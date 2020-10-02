import { APP_SECTION, BOX_STANDARD, NODE_ALIGNMENT, NODE_PROCEDURE, NODE_RESOURCE, NODE_TRAVERSE } from './lib/constant';

import type ExtensionManager from './extensionmanager';
import type ControllerUI from './controller-ui';
import type ExtensionUI from './extension-ui';
import type NodeUI from './node-ui';
import type NodeList from './nodelist';

import Application from './application';
import ResourceUI from './resource-ui';
import ContentUI from './content-ui';
import LayoutUI from './layout-ui';

import { appendSeparator, convertListStyle } from './lib/util';

type FileActionOptions = squared.FileActionOptions;

const { FILE } = squared.lib.regex;

const { formatPX, getStyle, hasCoords, insertStyleSheetRule, resolveURL } = squared.lib.css;
const { getNamedItem, removeElementsByClassName } = squared.lib.dom;
const { getElementCache, setElementCache } = squared.lib.session;
const { capitalize, convertWord, flatArray, hasBit, isString, iterateArray, partitionArray, trimBoth, trimString } = squared.lib.util;

const REGEXP_PSEUDOCOUNTER = /\s*(?:attr\(([^)]+)\)|(counter)\(([^,)]+)(?:,\s+([a-z-]+))?\)|(counters)\(([^,]+),\s+"([^"]*)"(?:,\s+([a-z-]+))?\)|"([^"]+)")\s*/g;
const REGEXP_PSEUDOCOUNTERVALUE = /\b([^\-\d][^\-\d]?[^\s]*)\s+(-?\d+)\b/g;
const REGEXP_PSEUDOQUOTE = /("(?:[^"]|\\")+"|[^\s]+)\s+("(?:[^"]|\\")+"|[^\s]+)(?:\s+("(?:[^"]|\\")+"|[^\s]+)\s+("(?:[^"]|\\")+"|[^\s]+))?/;

function getFloatAlignmentType(nodes: NodeUI[]) {
    let right: Undef<boolean>,
        floating: Undef<boolean>;
    for (let i = 0, length = nodes.length; i < length; ++i) {
        const item = nodes[i];
        if (!item.floating) {
            if (right) {
                return 0;
            }
            floating = true;
        }
        if (!item.rightAligned) {
            if (floating) {
                return 0;
            }
            right = true;
        }
    }
    let result = 0;
    if (!floating) {
        result |= NODE_ALIGNMENT.FLOAT;
    }
    if (!right) {
        result |= NODE_ALIGNMENT.RIGHT;
    }
    return result;
}

function checkPseudoDimension(styleMap: StringMap, after: boolean, absolute: boolean) {
    switch (styleMap.display) {
        case 'inline':
        case 'block':
        case 'inherit':
        case 'initial':
        case 'unset': {
            const { width, height } = styleMap;
            if ((after || !width || !parseFloat(width)) && (!height || !parseFloat(height))) {
                for (const attr in styleMap) {
                    const value = styleMap[attr]!;
                    if (/(padding|Width|Height)/.test(attr) && parseFloat(value) || !absolute && attr.startsWith('margin') && parseFloat(value)) {
                        return true;
                    }
                }
                return false;
            }
        }
        default:
            return true;
    }
}

function getPseudoQuoteValue(element: HTMLElement, pseudoElt: PseudoElt, outside: string, inside: string, sessionId: string) {
    const extractQuote = (value: string) => /^"(.+)"$/.exec(value)?.[1] || value;
    let current: Null<HTMLElement> = element,
        found = 0,
        i = 0, j = -1;
    while (current && current.tagName === 'Q') {
        const quotes = (getElementCache<CSSStyleDeclaration>(current, 'styleMap', sessionId) || getStyle(current)).quotes;
        if (quotes) {
            const match = REGEXP_PSEUDOQUOTE.exec(quotes);
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

function getCounterValue(value: Undef<string>, counterName: string, fallback = 1) {
    if (value && value !== 'none') {
        REGEXP_PSEUDOCOUNTERVALUE.lastIndex = 0;
        let match: Null<RegExpExecArray>;
        while (match = REGEXP_PSEUDOCOUNTERVALUE.exec(value)) {
            if (match[1] === counterName) {
                return parseInt(match[2]);
            }
        }
        return fallback;
    }
}

function setColumnMaxWidth(nodes: NodeUI[], offset: number) {
    for (let i = 0, length = nodes.length; i < length; ++i) {
        const child = nodes[i];
        if (!child.hasPX('width') && !child.hasPX('maxWidth') && !child.imageElement && !child.svgElement) {
            child.css('maxWidth', formatPX(offset));
        }
    }
}

function setElementState(node: NodeUI, styleElement: boolean, naturalElement: boolean, htmlElement: boolean, svgElement: boolean) {
    const cacheState = node.unsafe<CacheStateUI<NodeUI>>('cacheState')!;
    cacheState.naturalChild = true;
    cacheState.styleElement = styleElement;
    cacheState.naturalElement = naturalElement;
    cacheState.htmlElement = htmlElement;
    cacheState.svgElement = svgElement;
}

export default abstract class ApplicationUI<T extends NodeUI> extends Application<T> implements squared.base.ApplicationUI<T> {
    public builtInExtensions!: Map<string, ExtensionUI<T>>;
    public readonly session: squared.base.AppSessionUI<T> = {
        active: new Map<string, squared.base.AppProcessing<T>>(),
        extensionMap: new Map<T, ExtensionUI<T>[]>(),
        clearMap: new Map<T, string>()
    };
    public readonly extensions: ExtensionUI<T>[] = [];
    public abstract userSettings: UserResourceSettingsUI;

    private _controllerSettings!: ControllerSettingsUI;
    private _layoutFileExtension!: RegExp;
    private _excludedElements!: Set<string>;
    private _visibleElement!: (element: HTMLElement, sessionId: string, pseudoElt?: PseudoElt) => boolean;
    private _applyDefaultStyles!: (element: Element, sessionId: string, pseudoElt?: PseudoElt) => void;
    private _renderNode!: (layout: ContentUI<T>) => Undef<NodeTemplate<T>>;
    private _renderNodeGroup!: (layout: LayoutUI<T>) => Undef<NodeTemplate<T>>;
    private readonly _layouts: LayoutAsset[] = [];

    public abstract get controllerHandler(): ControllerUI<T>;
    public abstract get resourceHandler(): ResourceUI<T>;
    public abstract get extensionManager(): ExtensionManager<T>;

    public init() {
        const controller = this.controllerHandler;
        this._visibleElement = controller.visibleElement.bind(controller);
        this._applyDefaultStyles = controller.applyDefaultStyles.bind(controller);
        this._renderNode = controller.renderNode.bind(controller);
        this._renderNodeGroup = controller.renderNodeGroup.bind(controller);
        const localSettings = controller.localSettings;
        this._controllerSettings = localSettings;
        this._layoutFileExtension = new RegExp(`\\.${localSettings.layout.fileExtension}$`);
        this._excludedElements = localSettings.unsupported.excluded;
    }

    public finalize() {
        if (this.closed) {
            return true;
        }
        const controller = this.controllerHandler;
        const [extensions, children] = this.sessionAll;
        let length = children.length,
            j = 0;
        const rendered: T[] = new Array(length);
        for (let i = 0; i < length; ++i) {
            const node = children[i];
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
        controller.optimize(rendered);
        length = extensions.length;
        for (let i = 0; i < length; ++i) {
            const ext = extensions[i];
            for (const node of ext.subscribers) {
                (ext as ExtensionUI<T>).postOptimize(node, rendered);
            }
        }
        const documentRoot: squared.base.LayoutRoot<T>[] = [];
        for (let i = 0; i < j; ++i) {
            const node = rendered[i];
            if (node.hasResource(NODE_RESOURCE.BOX_SPACING)) {
                node.setBoxSpacing();
            }
            if (node.documentRoot && !(!node.rendering && !node.inlineText && node.naturalElements.length)) {
                const layoutName = node.innerMostWrapped.data<string>(Application.KEY_NAME, 'layoutName');
                const renderTemplates = node.renderParent?.renderTemplates as Undef<NodeTemplate<T>[]>;
                if (layoutName && renderTemplates) {
                    documentRoot.push({ node, layoutName, renderTemplates });
                }
            }
        }
        const documentWriteData: squared.base.DocumentWriteDataExtensionUI<T> = { rendered, documentRoot };
        for (let i = 0; i < length; ++i) {
            (extensions[i] as ExtensionUI<T>).beforeDocumentWrite(documentWriteData);
        }
        for (let i = 0, q = documentRoot.length; i < q; ++i) {
            const { node, layoutName, renderTemplates } = documentRoot[i];
            this.saveDocument(
                layoutName,
                this._controllerSettings.layout.baseTemplate + controller.writeDocument(renderTemplates, Math.abs(node.depth), this.userSettings.showAttributes),
                node.dataset['pathname' + capitalize(this.systemName)],
                node.renderExtension?.some(item => item.documentBase) ? 0 : undefined
            );
        }
        this.resourceHandler.finalize(this._layouts);
        controller.finalize(this._layouts);
        for (let i = 0; i < length; ++i) {
            (extensions[i] as ExtensionUI<T>).afterFinalize();
        }
        removeElementsByClassName('__squared.pseudo');
        return this.closed = true;
    }

    public copyTo(directory: string, options?: FileActionOptions) {
        return super.copyTo(directory, this.createAssetOptions(options));
    }

    public appendTo(pathname: string, options?: FileActionOptions) {
        return super.appendTo(pathname, this.createAssetOptions(options));
    }

    public saveAs(filename?: string, options?: FileActionOptions) {
        return super.saveAs(filename, this.createAssetOptions(options));
    }

    public reset() {
        const session = this.session;
        const iterationName = 'iteration' + capitalize(this.systemName);
        for (const item of session.active.values()) {
            for (const element of item.rootElements) {
                delete element.dataset[iterationName];
            }
        }
        session.extensionMap.clear();
        session.clearMap.clear();
        this._layouts.length = 0;
        super.reset();
    }

    public conditionElement(element: HTMLElement, sessionId: string, cascadeAll?: boolean, pseudoElt?: PseudoElt) {
        if (!this._excludedElements.has(element.tagName)) {
            if (this._visibleElement(element, sessionId, pseudoElt) || cascadeAll) {
                return true;
            }
            else if (!pseudoElt) {
                if (hasCoords(getStyle(element).position)) {
                    return this.useElement(element);
                }
                let current = element.parentElement;
                while (current) {
                    if (getStyle(current).display === 'none') {
                        return this.useElement(element);
                    }
                    current = current.parentElement;
                }
                const controller = this.controllerHandler;
                if (iterateArray(element.children, (item: HTMLElement) => controller.visibleElement(item, sessionId)) === Infinity) {
                    return true;
                }
                return this.useElement(element);
            }
        }
        return false;
    }

    public insertNode(element: Element, sessionId: string, cascadeAll?: boolean, pseudoElt?: PseudoElt) {
        if (element.nodeName === '#text' || this.conditionElement(element as HTMLElement, sessionId, cascadeAll, pseudoElt)) {
            this._applyDefaultStyles(element, sessionId, pseudoElt);
            return this.createNode(sessionId, { element, append: false });
        }
        else {
            const node = this.createNode(sessionId, { element, append: false });
            node.visible = false;
            node.excluded = true;
            return node;
        }
    }

    public saveDocument(filename: string, content: string, pathname?: string, index?: number) {
        const layout: LayoutAsset = {
            pathname: pathname ? trimString(pathname.replace(/\\/g, '/'), '/') : appendSeparator(this.userSettings.outputDirectory, this._controllerSettings.layout.pathName),
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

    public renderNode(layout: ContentUI<T>) {
        return layout.itemCount === 0 ? this._renderNode(layout) : this._renderNodeGroup(layout as LayoutUI<T>);
    }

    public addLayout(layout: ContentUI<T>) {
        const renderType = layout.renderType;
        if (renderType && hasBit(renderType, NODE_ALIGNMENT.FLOAT)) {
            if (hasBit(renderType, NODE_ALIGNMENT.HORIZONTAL)) {
                layout = this.processFloatHorizontal(layout as LayoutUI<T>);
            }
            else if (hasBit(renderType, NODE_ALIGNMENT.VERTICAL)) {
                layout = this.processFloatVertical(layout as LayoutUI<T>);
            }
        }
        if (layout.containerType) {
            const template = this.renderNode(layout);
            if (template) {
                this.addLayoutTemplate(template.parent || layout.parent, layout.node, template, layout.renderIndex);
                return true;
            }
        }
        return false;
    }

    public addLayoutTemplate(parent: T, node: T, template: NodeTemplate<T>, index?: number) {
        if (!node.renderExclude) {
            if (node.renderParent) {
                const renderTemplates = parent.renderTemplates ||= [];
                if (index === undefined || !(index >= 0 && index < parent.renderChildren.length)) {
                    parent.renderChildren.push(node);
                    renderTemplates.push(template);
                }
                else {
                    parent.renderChildren.splice(index, 0, node);
                    renderTemplates.splice(index, 0, template);
                }
                node.renderedAs = template;
            }
        }
        else {
            node.hide({ remove: true });
            node.excluded = true;
        }
    }

    public createNode(sessionId: string, options: CreateNodeUIOptions<T>) {
        const { element, parent, children } = options;
        const { cache, afterInsertNode } = this.getProcessing(sessionId)!;
        const node = new this.Node(this.nextId, sessionId, element);
        this._afterInsertNode(node);
        if (afterInsertNode) {
            afterInsertNode.some(item => item.afterInsertNode!(node));
        }
        if (parent) {
            node.depth = parent.depth + 1;
            if (!element && parent.naturalElement) {
                node.actualParent = parent;
            }
            const child = options.innerWrapped;
            if (child && parent.replaceTry({ child, replaceWith: node })) {
                child.parent = node;
                node.innerWrapped = child;
            }
        }
        if (children) {
            for (let i = 0, length = children.length; i < length; ++i) {
                children[i].parent = node;
            }
        }
        if (options.append !== false) {
            cache.add(node, !!options.delegate, !!options.cascade);
        }
        return node;
    }

    public createCache(documentRoot: HTMLElement, sessionId: string) {
        const node = this.createRootNode(documentRoot, sessionId);
        if (node) {
            const { cache, excluded } = this.getProcessing(sessionId)!;
            const parent = node.parent as T;
            if (parent) {
                parent.visible = false;
                node.documentParent = parent;
                setElementState(parent, true, true, true, false);
                if (parent.tagName === 'HTML') {
                    parent.addAlign(NODE_ALIGNMENT.AUTO_LAYOUT);
                    parent.exclude({ resource: NODE_RESOURCE.FONT_STYLE | NODE_RESOURCE.VALUE_STRING, procedure: NODE_PROCEDURE.ALL });
                    cache.add(parent);
                }
            }
            node.rootElement = true;
            const preAlignment = new WeakMap<T, StringMap>();
            const direction = new WeakSet<HTMLElement>();
            const pseudoElements: T[] = [];
            let resetBounds: Undef<boolean>;
            cache.each(item => {
                if (item.styleElement) {
                    const element = item.element as HTMLElement;
                    let data: Undef<StringMap>;
                    if (!item.isEmpty()) {
                        const textAlign = item.valueOf('textAlign');
                        switch (textAlign) {
                            case 'center':
                            case 'right':
                            case 'end':
                            case 'justify': {
                                data = { 'text-align': textAlign };
                                element.style.setProperty('text-align', 'left');
                                preAlignment.set(item, data);
                                break;
                            }
                        }
                    }
                    if (item.positionRelative) {
                        const setPosition = (attr: string) => {
                            if (item.hasPX(attr)) {
                                if (!data) {
                                    data = {};
                                    preAlignment.set(item, data);
                                }
                                data[attr] = item.css(attr);
                                element.style.setProperty(attr, 'auto');
                                resetBounds = true;
                            }
                        };
                        setPosition('top');
                        setPosition('right');
                        setPosition('bottom');
                        setPosition('left');
                    }
                    if (item.dir === 'rtl') {
                        element.dir = 'ltr';
                        direction.add(element);
                        resetBounds = true;
                    }
                }
            });
            excluded.each(item => {
                if (!item.pageFlow) {
                    item.cssTry('display', 'none');
                }
            });
            cache.each(item => {
                if (!item.pseudoElt) {
                    item.setBounds(!resetBounds && preAlignment.get(item) === undefined);
                }
                else {
                    pseudoElements.push(item);
                }
            });
            const length = pseudoElements.length;
            if (length) {
                const pseudoMap: [item: T, id: string, styleElement: Undef<HTMLStyleElement>][] = new Array(length);
                let q = 0;
                for (let i = 0; i < length; ++i) {
                    const item = pseudoElements[i];
                    const parentElement = item.parentElement!;
                    let id = '',
                        styleElement: Undef<HTMLStyleElement>;
                    if (item.pageFlow) {
                        let tagName: string;
                        if (parentElement.shadowRoot) {
                            tagName = ':host';
                        }
                        else {
                            id = parentElement.id.trim();
                            if (id === '') {
                                id = '__squared_' + Math.round(Math.random() * new Date().getTime());
                                parentElement.id = id;
                            }
                            tagName = '#' + id;
                        }
                        styleElement = insertStyleSheetRule(`${tagName + item.pseudoElt!} { display: none !important; }`, 0, item.shadowHost);
                    }
                    if (item.cssTry('display', item.display)) {
                        pseudoMap[q++] = [item, id, styleElement];
                    }
                }
                pseudoMap.length = q;
                for (let i = 0; i < q; ++i) {
                    pseudoMap[i][0].setBounds(false);
                }
                for (let i = 0; i < q; ++i) {
                    const data = pseudoMap[i];
                    const item = data[0];
                    if (data[1].startsWith('__squared_')) {
                        item.parentElement!.id = '';
                    }
                    if (data[2]) {
                        try {
                            (item.shadowHost || document.head).removeChild(data[2]);
                        }
                        catch {
                        }
                    }
                    item.cssFinally('display');
                }
            }
            excluded.each(item => {
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
                    const reset = preAlignment.get(item);
                    if (reset) {
                        for (const attr in reset) {
                            element.style.setProperty(attr, reset[attr]!);
                        }
                    }
                    if (direction.has(element)) {
                        element.dir = 'rtl';
                    }
                    item.setExclusions();
                }
                item.saveAsInitial();
            });
            this.controllerHandler.evaluateNonStatic(node, cache);
            this.controllerHandler.sortInitialCache(cache);
        }
        return node;
    }

    public afterCreateCache(node: T) {
        super.afterCreateCache(node);
        const systemName = capitalize(this.systemName);
        const dataset = node.dataset;
        const filename = dataset['filename' + systemName] || dataset.filename;
        const iteration = dataset['iteration' + systemName];
        const prefix = isString(filename) && filename.replace(this._layoutFileExtension, '') || node.elementId || `document_${this.length}`;
        const suffix = iteration ? parseInt(iteration) + 1 : 0;
        const layoutName = convertWord(suffix ? prefix + '_' + suffix : prefix, true);
        dataset['iteration' + systemName] = suffix.toString();
        dataset['layoutName' + systemName] = layoutName;
        node.data(Application.KEY_NAME, 'layoutName', layoutName);
        const sessionId = node.sessionId;
        this.setBaseLayout(sessionId);
        this.setConstraints(sessionId);
        this.setResources(sessionId);
    }

    public useElement(element: HTMLElement) {
        const use = this.getDatasetName('use', element);
        return use ? use.split(',').some(value => this.extensionManager.get(value.trim())) : false;
    }

    public toString() {
        return this.layouts[0]?.content || '';
    }

    protected cascadeParentNode(processing: squared.base.AppProcessing<T>, parentElement: HTMLElement, sessionId: string, depth: number, extensions: Null<ExtensionUI<T>[]>, shadowParent?: ShadowRoot, cascadeAll?: boolean) {
        const node = this.insertNode(parentElement, sessionId, cascadeAll);
        if (parentElement.tagName === 'svg') {
            setElementState(node, true, true, false, true);
        }
        else {
            setElementState(node, true, true, true, false);
        }
        if (depth === 0) {
            processing.cache.add(node);
            for (const name of node.extensions) {
                if ((this.extensionManager.get(name) as ExtensionUI<T>)?.cascadeAll) {
                    cascadeAll = true;
                    break;
                }
            }
        }
        if (node.display !== 'none' || depth === 0 || cascadeAll || node.extensions.some(name => (this.extensionManager.get(name) as ExtensionUI<T>)?.documentBase)) {
            if (node.excluded || this._preventNodeCascade(node)) {
                return node;
            }
            const { cache, rootElements } = processing;
            const pierceShadowRoot = this.userSettings.pierceShadowRoot;
            const hostElement = parentElement.shadowRoot || parentElement;
            const elements: T[] = new Array(hostElement.childElementCount);
            const beforeElement = this.createPseduoElement(parentElement, '::before', sessionId, hostElement);
            const afterElement = this.createPseduoElement(parentElement, '::after', sessionId, hostElement);
            const childNodes = hostElement.childNodes;
            const length = childNodes.length;
            const children: T[] = new Array(length);
            const childDepth = depth + 1;
            let inlineText = true,
                plainText = -1,
                lineBreak = -1,
                j = 0, k = 0;
            for (let i = 0; i < length; ++i) {
                const element = childNodes[i] as HTMLElement;
                let child: T;
                if (element === beforeElement) {
                    child = this.insertNode(beforeElement, sessionId, cascadeAll, '::before');
                    setElementState(child, true, false, true, false);
                    if (!child.textEmpty) {
                        child.cssApply(node.textStyle, false);
                        child.inlineText = true;
                    }
                    inlineText = false;
                    node.innerBefore = child;
                }
                else if (element === afterElement) {
                    child = this.insertNode(afterElement, sessionId, cascadeAll, '::after');
                    setElementState(child, true, false, true, false);
                    if (!child.textEmpty) {
                        child.cssApply(node.textStyle, false);
                        child.inlineText = true;
                    }
                    inlineText = false;
                    node.innerAfter = child;
                }
                else if (element.nodeName[0] === '#') {
                    if (this.visibleText(node, element)) {
                        child = this.insertNode(element, sessionId);
                        setElementState(child, false, false, false, false);
                        child.cssApply(node.textStyle);
                        plainText = j;
                    }
                    else {
                        continue;
                    }
                }
                else if (this._includeElement(element)) {
                    if (extensions) {
                        const use = this.getDatasetName('use', element);
                        (use ? ApplicationUI.prioritizeExtensions(use, extensions) : extensions).some(item => item.beforeInsertNode!(element, sessionId));
                    }
                    if (!rootElements.has(element)) {
                        let shadowRoot: UndefNull<ShadowRoot>;
                        if (pierceShadowRoot) {
                            shadowRoot = element.shadowRoot;
                            if (shadowRoot) {
                                this.setStyleMap(sessionId, shadowRoot);
                            }
                        }
                        if ((shadowRoot || element).childNodes.length) {
                            child = this.cascadeParentNode(processing, element, sessionId, childDepth, extensions, shadowRoot || shadowParent, cascadeAll);
                        }
                        else {
                            child = this.insertNode(element, sessionId, cascadeAll);
                            if (element.tagName === 'svg') {
                                setElementState(child, true, true, false, true);
                            }
                            else {
                                setElementState(child, true, true, true, child.imageElement && FILE.SVG.test(child.toElementString('src')));
                            }
                        }
                        if (!child.excluded) {
                            inlineText = false;
                        }
                        else if (inlineText && child.lineBreak && plainText !== -1 && lineBreak === -1) {
                            lineBreak = j;
                        }
                    }
                    else {
                        child = this.insertNode(element, sessionId);
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
                child.init(node, childDepth, j);
                child.actualParent = node;
                if (shadowParent) {
                    child.shadowHost = shadowParent;
                }
                children[j++] = child;
            }
            children.length = j;
            elements.length = k;
            node.naturalChildren = children;
            node.naturalElements = elements;
            node.shadowRoot = hostElement !== parentElement;
            if (!inlineText) {
                node.inlineText = false;
                if (j > 0) {
                    this.cacheNodeChildren(processing, cache, node, children);
                }
            }
            else {
                node.inlineText = plainText !== -1;
                if (lineBreak !== -1) {
                    if (lineBreak < plainText) {
                        node.multiline = true;
                    }
                    for (let i = 0; i < j; ++i) {
                        if (children[i].lineBreak) {
                            if (i > 0) {
                                children[i - 1].lineBreakTrailing = true;
                            }
                            if (i < j - 1) {
                                children[i + 1].lineBreakLeading = true;
                            }
                        }
                    }
                }
            }
            if (k > 0 && this.userSettings.createQuerySelectorMap) {
                node.queryMap = this.createQueryMap(elements, k);
            }
        }
        return node;
    }

    protected cacheNodeChildren(processing: squared.base.AppProcessing<T>, cache: NodeList<T>, node: T, children: T[]) {
        const length = children.length;
        if (length > 1) {
            let siblingsLeading: T[] = [],
                siblingsTrailing: T[] = [],
                trailing = children[0],
                floating = false,
                hasExcluded: Undef<boolean>;
            for (let i = 0; i < length; ++i) {
                const child = children[i];
                if (child.flowElement) {
                    if (child.floating) {
                        floating = true;
                    }
                    if (i > 0) {
                        siblingsTrailing.push(child);
                        if (child.lineBreak) {
                            children[i - 1].lineBreakTrailing = true;
                        }
                    }
                    child.siblingsLeading = siblingsLeading;
                    trailing.siblingsTrailing = siblingsTrailing;
                    siblingsLeading = [];
                    siblingsTrailing = [];
                    trailing = child;
                    if (i < length - 1) {
                        siblingsLeading.push(child);
                        if (child.lineBreak) {
                            children[i + 1].lineBreakLeading = true;
                        }
                    }
                }
                if (child.excluded) {
                    hasExcluded = true;
                    processing.excluded.add(child);
                }
            }
            trailing.siblingsTrailing = siblingsTrailing;
            node.floatContainer = floating;
            node.retainAs(hasExcluded ? children.filter(item => !item.excluded) : children.slice(0));
            cache.addAll(node);
        }
        else {
            const child = children[0];
            if (child.excluded) {
                processing.excluded.add(child);
            }
            else {
                node.add(child);
                cache.add(child);
            }
            child.actualParent = node;
        }
    }

    protected setBaseLayout(sessionId: string) {
        const controller = this.controllerHandler;
        const { extensionMap, clearMap } = this.session;
        const { extensions, cache, node: rootNode } = this.getProcessing(sessionId)!;
        const mapData = new Map<number, Set<T>>();
        const setMapDepth = (depth: number, node: T) => {
            const data = mapData.get(depth);
            if (data) {
                data.add(node);
            }
            else {
                mapData.set(depth, new Set([node]));
            }
        };
        if (rootNode!.parent) {
            setMapDepth(-1, rootNode!.parent as T);
        }
        cache.each(node => {
            if (!node.isEmpty()) {
                setMapDepth(node.depth, node);
                if (node.floatContainer) {
                    const floated = new Set<string>();
                    let clearable: T[] = [];
                    for (const item of (node.documentChildren || node.naturalChildren) as T[]) {
                        if (floated.size && item.pageFlow) {
                            const clear = item.valueOf('clear');
                            if (floated.has(clear) || clear === 'both') {
                                if (!item.floating) {
                                    item.setBox(BOX_STANDARD.MARGIN_TOP, { reset: 1 });
                                }
                                clearMap.set(item, floated.size === 2 ? 'both' : floated.values().next().value as string);
                                floated.clear();
                                clearable.length = 0;
                            }
                            else if (item.blockStatic && Math.ceil(item.bounds.top) >= Math.max(...clearable.map(previous => previous.bounds.bottom))) {
                                item.data(Application.KEY_NAME, 'cleared', clearable);
                                floated.clear();
                                clearable = [];
                            }
                        }
                        if (item.floating) {
                            const float = item.float;
                            floated.add(float);
                            clearable.push(item);
                        }
                    }
                }
            }
        });
        for (const depth of Array.from(mapData.keys())) {
            if (depth !== -1) {
                mapData.set(-(depth + 2), new Set<T>());
            }
        }
        cache.afterAdd = (node: T, cascade?: boolean, remove?: boolean) => {
            if (remove) {
                mapData.get(node.depth)?.delete(node);
            }
            setMapDepth(-(node.depth + 2), node);
            if (cascade && !node.isEmpty()) {
                node.cascade((item: T) => {
                    if (!item.isEmpty()) {
                        const depth = item.depth;
                        mapData.get(depth)?.delete(item);
                        setMapDepth(-(depth + 2), item);
                    }
                });
            }
        };
        const length = extensions.length;
        for (let i = 0; i < length; ++i) {
            (extensions[i] as ExtensionUI<T>).beforeBaseLayout(sessionId);
        }
        let extensionsTraverse = extensions.filter((item: ExtensionUI<T>) => !item.eventOnly) as ExtensionUI<T>[];
        for (const depth of mapData.values()) {
            for (const parent of depth.values()) {
                const q = parent.size();
                if (q === 0) {
                    continue;
                }
                const renderExtension = parent.renderExtension as Undef<ExtensionUI<T>[]>;
                const floatContainer = parent.floatContainer;
                const axisY = parent.toArray() as T[];
                for (let i = 0; i < q; ++i) {
                    let nodeY = axisY[i];
                    if (nodeY.rendered || !nodeY.visible) {
                        continue;
                    }
                    let parentY = nodeY.parent as T;
                    if (q > 1 && i < q - 1 && nodeY.pageFlow && (parentY.alignmentType === 0 || parentY.hasAlign(NODE_ALIGNMENT.UNKNOWN) || nodeY.hasAlign(NODE_ALIGNMENT.EXTENDABLE)) && !nodeY.nodeGroup && nodeY.hasSection(APP_SECTION.DOM_TRAVERSE)) {
                        const horizontal: T[] = [];
                        const vertical: T[] = [];
                        let j = i, k = 0;
                        if (parentY.layoutVertical && nodeY.hasAlign(NODE_ALIGNMENT.EXTENDABLE)) {
                            horizontal.push(nodeY);
                            ++j;
                            ++k;
                        }
                        traverse: {
                            let floatActive: Undef<boolean>,
                                floating: Undef<boolean>;
                            for ( ; j < q; ++j, ++k) {
                                const item = axisY[j];
                                if (item.pageFlow) {
                                    if (item.labelFor && !item.visible) {
                                        --k;
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
                                    if (k === 0) {
                                        const next = item.siblingsTrailing[0];
                                        if (next) {
                                            if (!item.inlineFlow || next.alignedVertically([item])) {
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
                                            if (status) {
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
                                        else if (item.alignedVertically(orientation ? horizontal : vertical, undefined, orientation)) {
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
                        if (horizontal.length > 1) {
                            const items = horizontal.filter(item => !item.renderExclude || floatContainer && clearMap.has(item));
                            if (items.length > 1) {
                                const layout = controller.processTraverseHorizontal(new LayoutUI(parentY, nodeY, 0, 0, items), axisY);
                                if (horizontal[horizontal.length - 1] === axisY[q - 1]) {
                                    parentY.removeAlign(NODE_ALIGNMENT.UNKNOWN);
                                }
                                if (layout && this.addLayout(layout)) {
                                    parentY = nodeY.parent as T;
                                }
                            }
                        }
                        else if (vertical.length > 1) {
                            const items = vertical.filter(item => !item.renderExclude || floatContainer && clearMap.has(item));
                            if (items.length > 1) {
                                const layout = controller.processTraverseVertical(new LayoutUI(parentY, nodeY, 0, 0, items), axisY);
                                const segEnd = vertical[vertical.length - 1];
                                if (segEnd === axisY[q - 1]) {
                                    parentY.removeAlign(NODE_ALIGNMENT.UNKNOWN);
                                }
                                else if (segEnd.inlineFlow && segEnd !== axisY[q - 1]) {
                                    segEnd.addAlign(NODE_ALIGNMENT.EXTENDABLE);
                                }
                                if (layout && this.addLayout(layout)) {
                                    parentY = nodeY.parent as T;
                                }
                            }
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
                        const descendant = extensionMap.get(nodeY) as Undef<ExtensionUI<T>[]>;
                        let combined = descendant ? renderExtension ? renderExtension.concat(descendant) : descendant : renderExtension,
                            next: Undef<boolean>;
                        if (combined) {
                            for (let j = 0, r = combined.length; j < r; ++j) {
                                const ext = combined[j];
                                const result = ext.processChild(nodeY, parentY);
                                if (result) {
                                    if (result.output) {
                                        this.addLayoutTemplate(result.outerParent || parentY, nodeY, result.output);
                                    }
                                    if (result.renderAs && result.outputAs) {
                                        this.addLayoutTemplate(result.parentAs || parentY, result.renderAs, result.outputAs);
                                    }
                                    if (result.parent) {
                                        parentY = result.parent;
                                    }
                                    if (result.subscribe) {
                                        ext.subscribers.add(nodeY);
                                    }
                                    next = result.next === true;
                                    if (next || result.complete) {
                                        break;
                                    }
                                }
                            }
                            if (next) {
                                continue;
                            }
                        }
                        if (nodeY.styleElement) {
                            combined = nodeY.use !== '' ? ApplicationUI.prioritizeExtensions<T>(nodeY.use, extensionsTraverse) as ExtensionUI<T>[] : extensionsTraverse;
                            for (let j = 0, r = combined.length; j < r; ++j) {
                                const ext = combined[j];
                                if (ext.is(nodeY)) {
                                    if (ext.condition(nodeY, parentY) && !(descendant && descendant.includes(ext))) {
                                        const result = ext.processNode(nodeY, parentY);
                                        if (result) {
                                            if (result.output) {
                                                this.addLayoutTemplate(result.outerParent || parentY, nodeY, result.output);
                                            }
                                            if (result.renderAs && result.outputAs) {
                                                this.addLayoutTemplate(result.parentAs || parentY, result.renderAs, result.outputAs);
                                            }
                                            if (result.parent) {
                                                parentY = result.parent;
                                            }
                                            if (result.include) {
                                                (nodeY.renderExtension ||= []).push(ext);
                                                ext.subscribers.add(nodeY);
                                            }
                                            else if (result.subscribe) {
                                                ext.subscribers.add(nodeY);
                                            }
                                            if (result.remove) {
                                                const index = extensionsTraverse.indexOf(ext);
                                                if (index !== -1) {
                                                    extensionsTraverse = extensionsTraverse.slice(0);
                                                    extensionsTraverse.splice(index, 1);
                                                }
                                            }
                                            next = result.next === true;
                                            if (next || result.complete) {
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
                        const containerType = nodeY.containerType;
                        let layout: ContentUI<T>;
                        if (!nodeY.isEmpty()) {
                            layout = new LayoutUI(
                                parentY,
                                nodeY,
                                containerType,
                                nodeY.alignmentType
                            );
                            if (containerType === 0) {
                                controller.processUnknownParent(layout as LayoutUI<T>);
                            }
                        }
                        else {
                            layout = new ContentUI(
                                parentY,
                                nodeY,
                                containerType,
                                nodeY.alignmentType
                            );
                            if (containerType === 0) {
                                controller.processUnknownChild(layout);
                            }
                        }
                        if (layout.next) {
                            continue;
                        }
                        this.addLayout(layout);
                    }
                }
            }
        }
        cache.sort((a, b) => {
            const depth = a.depth - b.depth;
            if (depth === 0) {
                if (!a.naturalChild || !b.naturalChild) {
                    if (a.nodeGroup && b.nodeGroup) {
                        return a.id - b.id;
                    }
                    else if (a.nodeGroup) {
                        return -1;
                    }
                    else if (b.nodeGroup) {
                        return 1;
                    }
                    if (a.innerWrapped === b) {
                        return -1;
                    }
                    else if (a === b.innerWrapped) {
                        return 1;
                    }
                    const outerA = a.outerWrapper;
                    const outerB = b.outerWrapper;
                    if (a === outerB || !outerA && outerB) {
                        return -1;
                    }
                    else if (b === outerA || !outerB && outerA) {
                        return 1;
                    }
                }
                return 0;
            }
            return depth;
        });
        for (let i = 0; i < length; ++i) {
            const ext = extensions[i] as ExtensionUI<T>;
            for (const node of ext.subscribers) {
                if (node.sessionId === sessionId) {
                    ext.postBaseLayout(node);
                }
            }
            ext.afterBaseLayout(sessionId);
        }
    }

    protected setConstraints(sessionId: string) {
        const { cache, extensions } = this.getProcessing(sessionId)!;
        this.controllerHandler.setConstraints(cache);
        for (let i = 0, length = extensions.length; i < length; ++i) {
            const ext = extensions[i] as ExtensionUI<T>;
            for (const node of ext.subscribers) {
                if (node.sessionId === sessionId) {
                    ext.postConstraints(node);
                }
            }
            ext.afterConstraints(sessionId);
        }
    }

    protected setResources(sessionId: string) {
        const { cache, extensions } = this.getProcessing(sessionId)!;
        const resource = this.resourceHandler;
        cache.each(node => {
            if (node.hasResource(NODE_RESOURCE.BOX_STYLE)) {
                resource.setBoxStyle(node);
            }
            if (node.hasResource(NODE_RESOURCE.VALUE_STRING) && !node.imageContainer && (node.visible || node.labelFor)) {
                resource.setFontStyle(node);
                resource.setValueString(node);
            }
        });
        for (let i = 0, length = extensions.length; i < length; ++i) {
            (extensions[i] as ExtensionUI<T>).afterResources(sessionId);
        }
    }

    protected processFloatHorizontal(layout: LayoutUI<T>) {
        const { clearMap, controllerHandler } = this;
        const { containerType, alignmentType } = controllerHandler.containerTypeVertical;
        const verticalMargin = controllerHandler.containerTypeVerticalMargin;
        const layerIndex: (T[] | T[][])[] = [];
        const inlineAbove: T[] = [];
        const leftAbove: T[] = [];
        const rightAbove: T[] = [];
        let leftBelow: Undef<T[]>,
            rightBelow: Undef<T[]>,
            leftSub: Undef<T[] | T[][]>,
            rightSub: Undef<T[] | T[][]>,
            inlineBelow: Undef<T[]>,
            inheritStyle: Undef<boolean>,
            clearing: Undef<boolean>,
            clearedFloat: Undef<boolean>,
            boxStyle: Undef<StandardMap>;
        layout.each((node, index) => {
            const float = node.float;
            if (clearing && float === 'left') {
                clearedFloat = true;
            }
            if (index) {
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
        if (rightAbove.length + (rightBelow ? rightBelow.length : 0) === layout.size()) {
            layout.addAlign(NODE_ALIGNMENT.RIGHT);
        }
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
        layout.setContainerType(verticalMargin.containerType, verticalMargin.alignmentType | NODE_ALIGNMENT.BLOCK);
        layout.itemCount = layerIndex.length;
        for (let i = 0; i < layout.itemCount; ++i) {
            const item = layerIndex[i];
            let segments: T[][],
                itemCount: number,
                floatgroup: Undef<T>;
            if (Array.isArray(item[0])) {
                segments = item as T[][];
                itemCount = segments.length;
                let grouping: T[] = segments[0];
                for (let j = 1; j < itemCount; ++j) {
                    grouping = grouping.concat(segments[j]);
                }
                grouping.sort((a: T, b: T) => a.childIndex - b.childIndex);
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
                itemCount = 1;
            }
            const parent = floatgroup || layout.node;
            for (let j = 0; j < itemCount; ++j) {
                const seg = segments[j];
                const target = controllerHandler.createNodeGroup(seg[0], seg, parent, { delegate: true, cascade: true });
                const group = new LayoutUI(parent, target, 0, NODE_ALIGNMENT.SEGMENTED, seg);
                if (seg === inlineAbove) {
                    group.addAlign(NODE_ALIGNMENT.COLUMN);
                    if (inheritStyle) {
                        if (boxStyle) {
                            target.inheritApply('boxStyle', boxStyle);
                        }
                        else {
                            boxStyle = target.inherit(layout.node, 'boxStyle');
                        }
                    }
                }
                else {
                    group.addAlign(getFloatAlignmentType(seg));
                }
                if (seg.some(child => child.percentWidth > 0 || child.percentHeight > 0)) {
                    const percent = controllerHandler.containerTypePercent;
                    group.setContainerType(percent.containerType, percent.alignmentType);
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
                    this.setFloatPadding(parent, target, inlineAbove, leftSub && flatArray(leftSub), rightSub && flatArray(rightSub));
                }
            }
        }
        return layout;
    }

    protected processFloatVertical(layout: LayoutUI<T>) {
        const { clearMap, controllerHandler } = this;
        const { containerType, alignmentType } = controllerHandler.containerTypeVertical;
        if (layout.containerType !== 0) {
            const wrapper = controllerHandler.createNodeWrapper(layout.node, layout.parent, { containerType, alignmentType, cascade: true });
            this.addLayout(new LayoutUI(
                wrapper,
                layout.node,
                containerType,
                alignmentType,
                wrapper.children as T[]
            ));
            layout.node = wrapper;
        }
        else {
            layout.setContainerType(containerType, alignmentType);
        }
        const staticRows: T[][] = [];
        const floatedRows: Null<T[]>[] = [];
        const current: T[] = [];
        const floated: T[] = [];
        let clearReset: Undef<boolean>,
            blockArea: Undef<boolean>,
            layoutVertical = true;
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
            for (let i = 0, length = Math.max(floatedRows.length, staticRows.length); i < length; ++i) {
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
                    let alignmentFloat = 0,
                        subgroup: Undef<T>;
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
                    const wrapper = controllerHandler.createNodeGroup((floating || pageFlow)[0], children, node);
                    this.addLayout(new LayoutUI(
                        node,
                        wrapper,
                        containerTypeParent,
                        alignmentTypeParent | alignmentFloat,
                        children
                    ));
                    for (const item of children) {
                        this.addLayout(new LayoutUI(
                            wrapper,
                            item,
                            containerType,
                            alignmentType | NODE_ALIGNMENT.SEGMENTED | NODE_ALIGNMENT.BLOCK
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

    protected createPseduoElement(element: HTMLElement, pseudoElt: PseudoElt, sessionId: string, parentRoot: HTMLElement | ShadowRoot) {
        let styleMap = getElementCache<StringMap>(element, 'styleMap' + pseudoElt, sessionId);
        if (element.tagName === 'Q') {
            if (!styleMap) {
                styleMap = {};
                setElementCache(element, 'styleMap' + pseudoElt, styleMap, sessionId);
            }
            styleMap.content ||= getStyle(element, pseudoElt).getPropertyValue('content') || (pseudoElt === '::before' ? 'open-quote' : 'close-quote');
        }
        if (styleMap) {
            styleMap.position ||= 'static';
            styleMap.display ||= 'inline';
            let value = styleMap.content;
            if (value) {
                const textContent = trimBoth(value, '"');
                if (!isString(textContent)) {
                    const absolute = hasCoords(styleMap.position);
                    if (pseudoElt === '::after') {
                        const checkPseudoAfter = (sibling: Element) => sibling.nodeName === '#text' && !/\s+$/.test(sibling.textContent!);
                        if ((absolute || textContent === '' || !checkPseudoAfter(element.lastChild as Element)) && !checkPseudoDimension(styleMap, true, absolute)) {
                            return;
                        }
                    }
                    else {
                        const childNodes = parentRoot.childNodes;
                        for (let i = 0, length = childNodes.length; i < length; ++i) {
                            const child = childNodes[i] as Element;
                            if (child.nodeName[0] === '#') {
                                if (child.nodeName === '#text' && isString(child.textContent)) {
                                    break;
                                }
                            }
                            else {
                                const style = getStyle(child);
                                if (hasCoords(styleMap.position)) {
                                    continue;
                                }
                                else if (style.getPropertyValue('float') !== 'none') {
                                    return;
                                }
                                break;
                            }
                        }
                        if (!checkPseudoDimension(styleMap, false, absolute)) {
                            return;
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
                let content = '',
                    tagName: Undef<string>;
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
                        if (url) {
                            if (ResourceUI.hasMimeType(this._controllerSettings.mimeType.image, url)) {
                                tagName = 'img';
                                content = url;
                            }
                        }
                        else {
                            const style = getStyle(element);
                            const getCounterIncrementValue = (parent: HTMLElement, counterName: string, fallback?: number) => getCounterValue(getElementCache<CSSStyleDeclaration>(parent, 'styleMap' + pseudoElt, sessionId)?.counterIncrement, counterName, fallback);
                            let found: Undef<boolean>,
                                match: Null<RegExpExecArray>;
                            while (match = REGEXP_PSEUDOCOUNTER.exec(value)) {
                                const attr = match[1];
                                if (attr) {
                                    content += getNamedItem(element, attr.trim());
                                }
                                else if (match[2] || match[5]) {
                                    const counterType = match[2] === 'counter';
                                    let counterName: string,
                                        styleName: string;
                                    if (counterType) {
                                        counterName = match[3];
                                        styleName = match[4] || 'decimal';
                                    }
                                    else {
                                        counterName = match[6];
                                        styleName = match[8] || 'decimal';
                                    }
                                    const initialValue = (getCounterIncrementValue(element, counterName, 0) ?? 1) + (getCounterValue(style.getPropertyValue('counter-reset'), counterName, 0) || 0);
                                    const subcounter: number[] = [];
                                    let current: Null<HTMLElement> = element,
                                        counter = initialValue,
                                        ascending: Undef<boolean>,
                                        lastResetElement: Undef<Element>;
                                    const incrementCounter = (increment: number, pseudo: boolean) => {
                                        if (subcounter.length === 0) {
                                            counter += increment;
                                        }
                                        else if (ascending || pseudo) {
                                            subcounter[subcounter.length - 1] += increment;
                                        }
                                    };
                                    const cascadeCounterSibling = (sibling: Element) => {
                                        if (getCounterValue(getStyle(sibling).getPropertyValue('counter-reset'), counterName) === undefined) {
                                            iterateArray(sibling.children, (item: HTMLElement) => {
                                                if (item.className !== '__squared.pseudo') {
                                                    let increment = getCounterIncrementValue(item, counterName);
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
                                            else {
                                                break;
                                            }
                                        }
                                        else {
                                            current = current.parentElement;
                                            if (!current) {
                                                break;
                                            }
                                            ascending = true;
                                        }
                                        if (current.className !== '__squared.pseudo') {
                                            const pesudoIncrement = getCounterIncrementValue(current, counterName);
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
                                            for (const item of subcounter) {
                                                content += convertListStyle(styleName, item, true) + textValue;
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
                            REGEXP_PSEUDOCOUNTER.lastIndex = 0;
                            if (!found) {
                                content = value;
                            }
                        }
                        break;
                    }
                }
                if (content !== '' || value === '""') {
                    tagName ||= /^(inline|table)/.test(styleMap.display) ? 'span' : 'div';
                    const pseudoElement = document.createElement(tagName);
                    pseudoElement.className = '__squared.pseudo';
                    pseudoElement.style.setProperty('display', 'none');
                    if (pseudoElt === '::before') {
                        parentRoot.insertBefore(pseudoElement, parentRoot.childNodes[0]);
                    }
                    else {
                        parentRoot.appendChild(pseudoElement);
                    }
                    if (content !== '') {
                        if (tagName === 'img') {
                            (pseudoElement as HTMLImageElement).src = content;
                            const image = this.resourceHandler.getImage(content);
                            if (image) {
                                if (image.width) {
                                    styleMap.width ||= formatPX(image.width);
                                }
                                if (image.height) {
                                    styleMap.height ||= formatPX(image.height);
                                }
                            }
                        }
                        else {
                            pseudoElement.innerText = content;
                        }
                    }
                    for (const attr in styleMap) {
                        if (attr !== 'display') {
                            pseudoElement.style[attr] = styleMap[attr];
                        }
                    }
                    setElementCache(pseudoElement, 'styleMap', styleMap, sessionId);
                    setElementCache(pseudoElement, 'pseudoElt', pseudoElt, sessionId);
                    return pseudoElement;
                }
            }
        }
    }

    protected setFloatPadding(parent: T, target: T, inlineAbove: T[], leftAbove: T[] = [], rightAbove: T[] = []) {
        const requirePadding = (node: NodeUI, depth?: number): boolean => node.textElement && (node.blockStatic || node.multiline || depth === 1);
        let paddingNodes: T[] = [];
        for (let i = 0, length = inlineAbove.length; i < length; ++i) {
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
        let q = leftAbove.length;
        if (q) {
            let floatPosition = -Infinity,
                marginOffset = 0,
                spacing: Undef<boolean>;
            for (let i = 0; i < q; ++i) {
                const child = leftAbove[i];
                if (child.bounds.top < bottom) {
                    const marginRight = child.marginRight;
                    let right = child.bounds.right;
                    if (marginRight > 0) {
                        right += marginRight;
                    }
                    if (right > floatPosition) {
                        floatPosition = right;
                        if (marginRight < 0) {
                            marginOffset = marginRight;
                        }
                        spacing = true;
                    }
                    else if (right === floatPosition && marginRight <= 0) {
                        spacing = false;
                    }
                }
            }
            if (floatPosition !== -Infinity) {
                let marginLeft = -Infinity;
                for (let i = 0; i < length; ++i) {
                    const child = paddingNodes[i];
                    if (Math.floor(child.linear.left) <= floatPosition || child.centerAligned) {
                        marginLeft = Math.max(marginLeft, child.marginLeft);
                    }
                }
                if (marginLeft !== -Infinity) {
                    const offset = floatPosition + marginOffset - (parent.box.left + marginLeft + Math.max(...target.map((child: T) => !paddingNodes.includes(child) ? child.marginLeft : 0)));
                    if (offset > 0 && offset < parent.actualBoxWidth()) {
                        target.modifyBox(BOX_STANDARD.PADDING_LEFT, offset + (!spacing && target.find(child => child.multiline, { cascade: true }) ? Math.max(marginLeft, this._controllerSettings.deviations.textMarginBoundarySize) : 0));
                        setColumnMaxWidth(leftAbove, offset);
                    }
                }
            }
        }
        q = rightAbove.length;
        if (q) {
            let floatPosition = Infinity,
                marginOffset = 0,
                spacing: Undef<boolean>;
            for (let i = 0; i < q; ++i) {
                const child = rightAbove[i];
                if (child.bounds.top < bottom) {
                    const marginLeft = child.marginLeft;
                    const left = child.linear.left;
                    if (left < floatPosition) {
                        floatPosition = left;
                        if (marginLeft < 0) {
                            marginOffset = marginLeft;
                        }
                        spacing = marginLeft > 0;
                    }
                    else if (left === floatPosition && marginLeft <= 0) {
                        spacing = false;
                    }
                }
            }
            if (floatPosition !== Infinity) {
                let marginRight = -Infinity;
                for (let i = 0; i < length; ++i) {
                    const child = paddingNodes[i];
                    if (child.multiline || child.centerAligned || Math.ceil(child.linear.right) >= floatPosition) {
                        marginRight = Math.max(marginRight, child.marginRight);
                    }
                }
                if (marginRight !== -Infinity) {
                    const offset = parent.box.right - (floatPosition - marginOffset + marginRight + Math.max(...target.map((child: T) => !paddingNodes.includes(child) ? child.marginRight : 0)));
                    if (offset > 0 && offset < parent.actualBoxWidth()) {
                        target.modifyBox(BOX_STANDARD.PADDING_RIGHT, offset + (!spacing && target.find(child => child.multiline, { cascade: true }) ? Math.max(marginRight, this._controllerSettings.deviations.textMarginBoundarySize) : 0));
                        setColumnMaxWidth(rightAbove, offset);
                    }
                }
            }
        }
    }

    protected createAssetOptions(options?: FileActionOptions) {
        return options ? { ...options, assets: options.assets ? this.layouts.concat(options.assets) : this.layouts } : { assets: this.layouts };
    }

    get mainElement() {
        return document.body;
    }

    get layouts() {
        return this._layouts.sort((a, b) => {
            const indexA = a.index;
            const indexB = b.index;
            if (indexA !== indexB) {
                if (indexA === 0 || indexB === Infinity || indexB === undefined && !(indexA === Infinity)) {
                    return -1;
                }
                else if (indexB === 0 || indexA === Infinity || indexA === undefined && !(indexB === Infinity)) {
                    return 1;
                }
                else if (indexA !== undefined && indexB !== undefined) {
                    return indexA - indexB;
                }
            }
            return 0;
        });
    }

    get clearMap() {
        return this.session.clearMap;
    }
}