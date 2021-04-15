import BOX_STANDARD = squared.base.lib.constant.BOX_STANDARD;
import NODE_ALIGNMENT = squared.base.lib.constant.NODE_ALIGNMENT;
import NODE_TRAVERSE = squared.base.lib.constant.NODE_TRAVERSE;
import APP_SECTION = squared.base.lib.constant.APP_SECTION;
import NODE_PROCEDURE = squared.base.lib.constant.NODE_PROCEDURE;
import NODE_RESOURCE = squared.base.lib.constant.NODE_RESOURCE;
import CREATE_NODE = squared.base.lib.internal.CREATE_NODE;

import type ExtensionManager from './extensionmanager';
import type ControllerUI from './controller-ui';
import type ExtensionUI from './extension-ui';
import type NodeUI from './node-ui';

import Application from './application';
import ResourceUI from './resource-ui';
import ContentUI from './content-ui';
import LayoutUI from './layout-ui';

import { convertListStyle } from './extensions/list';

import { appendSeparator } from './lib/util';

type FileActionOptions = squared.FileActionOptions;
type VisibleElementMethod = (element: HTMLElement, sessionId: string, pseudoElt?: PseudoElt) => boolean;
type ApplyDefaultStylesMethod<T extends NodeUI> = (processing: squared.base.AppProcessing<T>, element: Element, pseudoElt?: PseudoElt) => void;
type RenderNodeMethod<T extends NodeUI> = (layout: ContentUI<T>) => Undef<NodeTemplate<T>>;

const { FILE } = squared.lib.regex;

const { formatPX, getStyle, hasCoords, isCalc, insertStyleSheetRule, resolveURL } = squared.lib.css;
const { getNamedItem, removeElementsByClassName } = squared.lib.dom;
const { getElementCache, setElementCache } = squared.lib.session;
const { capitalize, convertWord, flatArray, isString, iterateArray, partitionArray, startsWith, trimBoth, trimString } = squared.lib.util;

const REGEXP_PSEUDOCOUNTER = /\s*(?:attr\(([^)]+)\)|(counter)\(([^,)]+)(?:,\s*([a-z-]+))?\)|(counters)\(([^,]+),\s*"((?:[^"]|(?<=\\)")*)"(?:,\s*([a-z-]+))?\)|"((?:[^"]|(?<=\\)")+)")/g;
const REGEXP_PSEUDOCOUNTERVALUE = /\b([^\-\d][^\-\d]?[^\s]*)\s+(-?\d+)\b/g;
const REGEXP_PSEUDOQUOTE = /("(?:[^"]|(?<=\\)")+"|[^\s]+)\s+("(?:[^"]|(?<=\\)")+"|[^\s]+)(?:\s+("(?:[^"]|(?<=\\)")+"|[^\s]+)\s+("(?:[^"]|(?<=\\)")+"|[^\s]+))?/;

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

function checkPseudoDimension(styleMap: CssStyleMap, after: boolean, absolute: boolean) {
    switch (styleMap.display) {
        case 'inline':
        case 'block':
        case 'inherit':
        case 'initial':
        case 'unset': {
            const { width, height } = styleMap;
            if ((after || !width || !parseFloat(width) && !isCalc(width)) && (!height || !parseFloat(height) && !isCalc(height))) {
                for (const attr in styleMap) {
                    const value = styleMap[attr]!;
                    if (/(padding|Width|Height)/.test(attr) && parseFloat(value) || !absolute && startsWith(attr, 'margin') && parseFloat(value)) {
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
                return +match[2];
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
        active: new Map(),
        extensionMap: new WeakMap(),
        clearMap: new Map()
    };
    public readonly extensions: ExtensionUI<T>[] = [];

    public abstract resource: ResourceUI<T>;
    public abstract userSettings: UserResourceSettingsUI;

    private _controllerSettings!: ControllerSettingsUI;
    private _layoutFileExtension!: RegExp;
    private _excludedElements!: string[];
    private _resourceId!: number;
    private _layouts: LayoutAsset[] = [];

    private _applyDefaultStyles!: ApplyDefaultStylesMethod<T>;
    private _visibleElement!: VisibleElementMethod;
    private _renderNode!: RenderNodeMethod<T>;
    private _renderNodeGroup!: RenderNodeMethod<T>;

    public abstract get controllerHandler(): ControllerUI<T>;
    public abstract get resourceHandler(): ResourceUI<T>;
    public abstract get extensionManager(): ExtensionManager<T>;

    public init() {
        const controller = this.controllerHandler;
        const localSettings = controller.localSettings;
        this._visibleElement = controller.visibleElement.bind(controller);
        this._applyDefaultStyles = controller.applyDefaultStyles.bind(controller);
        this._renderNode = controller.renderNode.bind(controller);
        this._renderNodeGroup = controller.renderNodeGroup.bind(controller);
        this._controllerSettings = localSettings;
        this._layoutFileExtension = new RegExp(`\\.${localSettings.layout.fileExtension}$`, 'i');
        this._excludedElements = localSettings.unsupported.excluded;
        this.setResourceId();
    }

    public finalize() {
        if (this.closed) {
            return true;
        }
        const controller = this.controllerHandler;
        const [extensions, children] = this.sessionAll as [ExtensionUI<T>[], T[]];
        let itemCount = 0,
            length = children.length;
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
                rendered[itemCount++] = node;
            }
        }
        if (itemCount < length) {
            rendered.length = itemCount;
        }
        controller.optimize(rendered);
        length = extensions.length;
        for (let i = 0; i < length; ++i) {
            const ext = extensions[i];
            const postOptimize = ext.postOptimize;
            if (postOptimize) {
                for (const node of ext.subscribers) {
                    postOptimize.call(ext, node, rendered);
                }
            }
        }
        const documentRoot: squared.base.LayoutRoot<T>[] = [];
        const finalizeData: squared.base.FinalizeDataExtensionUI<T> = { resourceId: this.resourceId, rendered, documentRoot };
        itemCount = rendered.length;
        for (let i = 0; i < itemCount; ++i) {
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
        for (let i = 0; i < length; ++i) {
            const ext = extensions[i];
            const postBoxSpacing = ext.postBoxSpacing;
            if (postBoxSpacing) {
                for (const node of ext.subscribers) {
                    postBoxSpacing.call(ext, node, rendered);
                }
            }
            ext.beforeFinalize(finalizeData);
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
        controller.finalize(this._layouts);
        for (let i = 0; i < length; ++i) {
            extensions[i].afterFinalize(finalizeData);
        }
        removeElementsByClassName('__squared-pseudo');
        return this.closed = true;
    }

    public copyTo(pathname: string, options?: FileActionOptions) {
        return super.copyTo(pathname, this.createAssetOptions(options));
    }

    public appendTo(pathname: string, options?: FileActionOptions) {
        return super.appendTo(pathname, this.createAssetOptions(options));
    }

    public saveAs(filename: string, options?: FileActionOptions) {
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
        session.active.clear();
        session.extensionMap = new WeakMap();
        session.clearMap.clear();
        this.setResourceId();
        this._nextId = 0;
        this._layouts = [];
        super.reset();
    }

    public conditionElement(element: HTMLElement, sessionId: string, cascadeAll?: boolean, pseudoElt?: PseudoElt) {
        if (!this._excludedElements.includes(element.tagName)) {
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

    public saveDocument(filename: string, content: string, pathname?: string, index = -1) {
        const layout: LayoutAsset = {
            pathname: pathname ? trimString(pathname.replace(/\\/g, '/'), '/') : appendSeparator(this.userSettings.outputDirectory, this._controllerSettings.layout.pathName),
            filename,
            content,
            index
        };
        if (index === -1 || !(index >= 0 && index < this._layouts.length)) {
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
        if (layout.alignmentType & NODE_ALIGNMENT.FLOAT_LAYOUT) {
            layout = layout.alignmentType & NODE_ALIGNMENT.VERTICAL ? this.processFloatVertical(layout as LayoutUI<T>) : this.processFloatHorizontal(layout as LayoutUI<T>);
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

    public addLayoutTemplate(parent: T, node: T, template: NodeTemplate<T>, index = -1) {
        if (!node.renderExclude) {
            if (node.renderParent) {
                const renderTemplates = parent.renderTemplates ||= [];
                if (index >= 0 && index < parent.renderChildren.length) {
                    parent.renderChildren.splice(index, 0, node);
                    renderTemplates.splice(index, 0, template);
                }
                else {
                    parent.renderChildren.push(node);
                    renderTemplates.push(template);
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
        const { element, parent, children, flags = 0 } = options;
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
        if (~flags & CREATE_NODE.DEFER) {
            cache.add(node, (flags & CREATE_NODE.DELEGATE) > 0, (flags & CREATE_NODE.CASCADE) > 0);
        }
        return node;
    }

    public insertNode(processing: squared.base.AppProcessing<T>, element: Element, cascadeAll?: boolean, pseudoElt?: PseudoElt) {
        if (element.nodeName === '#text' || this.conditionElement(element as HTMLElement, processing.sessionId, cascadeAll, pseudoElt)) {
            this._applyDefaultStyles(processing, element, pseudoElt);
            return this.createNodeStatic(processing, element);
        }
        const node = this.createNodeStatic(processing, element);
        node.visible = false;
        node.excluded = true;
        return node;
    }

    public createCache(processing: squared.base.AppProcessing<T>, documentRoot: HTMLElement) {
        const node = this.createRootNode(processing, documentRoot);
        if (node) {
            const { cache, excluded } = processing;
            const parent = node.parent as Null<T>;
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
            node.renderExclude = false;
            const preAlignment = new WeakMap<T, CssStyleMap>();
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
                            case 'justify':
                                element.style.textAlign = 'left';
                                preAlignment.set(item, data = { textAlign });
                                break;
                        }
                    }
                    if (item.positionRelative) {
                        const setPosition = (attr: PositionAttr) => {
                            if (item.hasPX(attr)) {
                                if (!data) {
                                    data = {};
                                    preAlignment.set(item, data);
                                }
                                data[attr] = item.valueOf(attr);
                                element.style[attr] = 'auto';
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
                if (item.pseudoElt) {
                    pseudoElements.push(item);
                }
                else {
                    item.setBounds(!resetBounds && !preAlignment.get(item));
                }
            });
            if (pseudoElements.length) {
                const pseudoMap: [item: T, previousId: Null<string>, styleElement: Undef<HTMLStyleElement>][] = [];
                for (let i = 0, length = pseudoElements.length; i < length; ++i) {
                    const item = pseudoElements[i];
                    const parentElement = item.parentElement!;
                    let previousId: Null<string> = null,
                        styleElement: Undef<HTMLStyleElement>;
                    if (item.pageFlow) {
                        let tagName: string;
                        if (parentElement.shadowRoot) {
                            tagName = ':host';
                        }
                        else {
                            let id = parentElement.id;
                            if (!startsWith(id, 'sqd__') && (!id || id !== id.trim())) {
                                previousId = id;
                                id = 'sqd__' + Math.floor(Math.random() * Number.MAX_SAFE_INTEGER);
                                parentElement.id = id;
                            }
                            tagName = '#' + id;
                        }
                        styleElement = insertStyleSheetRule(`${tagName + item.pseudoElt!} { display: none !important; }`, 0, item.shadowHost);
                    }
                    if (item.cssTry('display', item.display)) {
                        pseudoMap.push([item, previousId, styleElement]);
                    }
                }
                const length = pseudoMap.length;
                for (let i = 0; i < length; ++i) {
                    pseudoMap[i][0].setBounds(false);
                }
                for (let i = 0; i < length; ++i) {
                    const [item, previousId, styleElement] = pseudoMap[i];
                    if (previousId !== null) {
                        item.parentElement!.id = previousId;
                    }
                    if (styleElement) {
                        try {
                            (item.shadowHost || document.head).removeChild(styleElement);
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
                            element.style[attr] = reset[attr];
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

    public afterCreateCache(processing: squared.base.AppProcessing<T>, node: T) {
        super.afterCreateCache(processing, node);
        const systemName = capitalize(this.systemName);
        const dataset = node.dataset;
        const filename = dataset['filename' + systemName] || dataset.filename;
        const iteration = dataset['iteration' + systemName];
        const prefix = isString(filename) && filename.replace(this._layoutFileExtension, '') || node.elementId || `document_${this.length}`;
        const suffix = iteration ? +iteration + 1 : 0;
        const layoutName = convertWord(suffix ? prefix + '_' + suffix : prefix);
        dataset['iteration' + systemName] = suffix.toString();
        dataset['layoutName' + systemName] = layoutName;
        node.data(Application.KEY_NAME, 'layoutName', layoutName);
        this.setBaseLayout(processing);
        this.setConstraints(processing);
        this.setResources(processing);
    }

    public useElement(element: HTMLElement) {
        const use = this.getDatasetName('use', element);
        return use ? use.split(',').some(value => this.extensionManager.get(value.trim())) : false;
    }

    public toString() {
        return this.layouts[0]?.content || '';
    }

    protected cascadeParentNode(processing: squared.base.AppProcessing<T>, sessionId: string, resourceId: number, parentElement: HTMLElement, depth: number, extensions: Null<ExtensionUI<T>[]>, shadowParent?: ShadowRoot, beforeElement?: HTMLElement, afterElement?: HTMLElement, cascadeAll?: boolean) {
        const node = this.insertNode(processing, parentElement, cascadeAll);
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
            beforeElement = this.createPseduoElement(sessionId, resourceId, parentElement, '::before');
            afterElement = this.createPseduoElement(sessionId, resourceId, parentElement, '::after');
        }
        const display = node.display;
        if (display !== 'none' || depth === 0 || cascadeAll || node.extensions.some(name => (this.extensionManager.get(name) as ExtensionUI<T>)?.documentBase)) {
            if (node.excluded || this._preventNodeCascade(node)) {
                return node;
            }
            const { cache, rootElements } = processing;
            const pierceShadowRoot = this.userSettings.pierceShadowRoot;
            const hostElement = parentElement.shadowRoot || parentElement;
            const childNodes = hostElement.childNodes;
            const children: T[] = [];
            const elements: T[] = [];
            const childDepth = depth + 1;
            let inlineText = true,
                plainText = -1,
                lineBreak = -1,
                j = 0;
            for (let i = 0, length = childNodes.length; i < length; ++i) {
                const element = childNodes[i] as HTMLElement;
                let child: T;
                if (element === beforeElement) {
                    child = this.insertNode(processing, beforeElement, cascadeAll, '::before');
                    setElementState(child, true, false, true, false);
                    if (!child.textEmpty) {
                        child.cssApply(node.textStyle, false);
                        child.inlineText = true;
                    }
                    inlineText = false;
                    node.innerBefore = child;
                }
                else if (element === afterElement) {
                    child = this.insertNode(processing, afterElement, cascadeAll, '::after');
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
                        child = this.insertNode(processing, element);
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
                    if (!rootElements.includes(element)) {
                        let shadowRoot: Optional<ShadowRoot>;
                        if (pierceShadowRoot && (shadowRoot = element.shadowRoot)) {
                            this.replaceShadowRootSlots(shadowRoot);
                            this.setStyleMap(sessionId, resourceId, shadowRoot);
                        }
                        const hostElementChild = shadowRoot || element;
                        const beforeElementChild = this.createPseduoElement(sessionId, resourceId, element, '::before', hostElementChild);
                        const afterElementChild = this.createPseduoElement(sessionId, resourceId, element, '::after', hostElementChild);
                        if (hostElementChild.childNodes.length) {
                            child = this.cascadeParentNode(processing, sessionId, resourceId, element, childDepth, extensions, shadowRoot || shadowParent, beforeElementChild, afterElementChild, cascadeAll);
                            if (child.display === 'contents' && !child.excluded && !shadowRoot) {
                                for (const item of child.naturalChildren as T[]) {
                                    if (item.naturalElement) {
                                        elements.push(item);
                                    }
                                    else if (item.plainText) {
                                        plainText = j;
                                    }
                                    item.init(node, childDepth, j++);
                                    item.actualParent = node;
                                    children.push(item);
                                }
                                child.excluded = true;
                                continue;
                            }
                        }
                        else {
                            child = this.insertNode(processing, element, cascadeAll);
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
                        child = this.insertNode(processing, element);
                        child.documentRoot = true;
                        child.visible = false;
                        child.excluded = true;
                        inlineText = false;
                    }
                    elements.push(child);
                }
                else {
                    continue;
                }
                if (shadowParent) {
                    child.shadowHost = shadowParent;
                }
                child.init(node, childDepth, j++);
                child.actualParent = node;
                children.push(child);
            }
            node.naturalChildren = children;
            node.naturalElements = elements;
            if (hostElement !== parentElement) {
                node.shadowRoot = true;
            }
            const contents = display === 'contents';
            const length = children.length;
            if (!inlineText) {
                node.inlineText = false;
                if (j > 0) {
                    if (length > 1) {
                        let siblingsLeading: T[] = [],
                            siblingsTrailing: T[] = [],
                            trailing = children[0],
                            floating = false,
                            excluded: Undef<boolean>;
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
                            if (child.excluded && !contents) {
                                excluded = true;
                                processing.excluded.add(child);
                            }
                        }
                        trailing.siblingsTrailing = siblingsTrailing;
                        if (!contents) {
                            node.floatContainer = floating;
                            node.retainAs(excluded ? children.filter(item => !item.excluded) : children.slice(0));
                            cache.addAll(node);
                        }
                        else {
                            node.retainAs(children);
                        }
                    }
                    else {
                        const child = children[0];
                        if (!contents) {
                            if (child.excluded) {
                                processing.excluded.add(child);
                            }
                            else {
                                node.add(child);
                                cache.add(child);
                            }
                        }
                        else {
                            node.add(child);
                        }
                    }
                }
            }
            else {
                node.inlineText = plainText !== -1;
                if (lineBreak !== -1 && lineBreak < plainText) {
                    node.multiline = true;
                }
                for (let i = 0; i < length; ++i) {
                    const item = children[i];
                    if (item.lineBreak) {
                        if (i > 0) {
                            children[i - 1].lineBreakTrailing = true;
                        }
                        if (i < length - 1) {
                            children[i + 1].lineBreakLeading = true;
                        }
                    }
                    if (item.excluded && !contents) {
                        processing.excluded.add(item);
                    }
                }
            }
            if (elements.length && this.userSettings.createQuerySelectorMap) {
                node.queryMap = this.createQueryMap(elements);
            }
        }
        return node;
    }

    protected setBaseLayout(processing: squared.base.AppProcessing<T>) {
        const controller = this.controllerHandler;
        const { extensionMap, clearMap } = this.session;
        const { sessionId, extensions, cache, node: rootNode } = processing;
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
                                clearable = [];
                            }
                            else if (item.blockStatic && Math.ceil(item.bounds.top) >= Math.max(...clearable.map(previous => previous.bounds.bottom))) {
                                item.data(Application.KEY_NAME, 'cleared', clearable);
                                floated.clear();
                                clearable = [];
                            }
                        }
                        if (item.floating) {
                            floated.add(item.float);
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
                            let floatActive: Undef<boolean>;
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
                                        if (item.floating) {
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
                            combined = nodeY.use ? ApplicationUI.prioritizeExtensions<T>(nodeY.use, extensionsTraverse) as ExtensionUI<T>[] : extensionsTraverse;
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
            const postBaseLayout = ext.postBaseLayout;
            if (postBaseLayout) {
                for (const node of ext.subscribers) {
                    if (node.sessionId === sessionId) {
                        postBaseLayout.call(ext, node);
                    }
                }
            }
            ext.afterBaseLayout(sessionId);
        }
    }

    protected setConstraints(processing: squared.base.AppProcessing<T>) {
        const { sessionId, cache, extensions } = processing;
        this.controllerHandler.setConstraints(cache);
        for (let i = 0, length = extensions.length; i < length; ++i) {
            const ext = extensions[i] as ExtensionUI<T>;
            const postConstraints = ext.postConstraints;
            if (postConstraints) {
                for (const node of ext.subscribers) {
                    if (node.sessionId === sessionId) {
                        postConstraints.call(ext, node);
                    }
                }
            }
            ext.afterConstraints(sessionId);
        }
    }

    protected setResources(processing: squared.base.AppProcessing<T>) {
        const { sessionId, resourceId, cache, extensions } = processing;
        this.resourceHandler.setData(cache);
        for (let i = 0, length = extensions.length; i < length; ++i) {
            const ext = extensions[i] as ExtensionUI<T>;
            const postResources = ext.postResources;
            if (postResources) {
                for (const node of ext.subscribers) {
                    if (node.sessionId === sessionId) {
                        postResources.call(ext, node);
                    }
                }
            }
            ext.afterResources(sessionId, resourceId);
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
        let boxStyle: Null<StandardMap> = null,
            leftBelow: Undef<T[]>,
            rightBelow: Undef<T[]>,
            leftSub: Undef<T[] | T[][]>,
            rightSub: Undef<T[] | T[][]>,
            inlineBelow: Undef<T[]>,
            inheritStyle: Undef<boolean>,
            clearing: Undef<boolean>,
            clearedFloat: Undef<boolean>;
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
                const grouping = flatArray(segments, Infinity).sort((a: T, b: T) => a.childIndex - b.childIndex) as T[];
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
                const target = controllerHandler.createNodeGroup(seg[0], seg, parent, { flags: CREATE_NODE.DELEGATE | CREATE_NODE.CASCADE });
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
            const wrapper = controllerHandler.createNodeWrapper(layout.node, layout.parent, { containerType, alignmentType, flags: CREATE_NODE.CASCADE });
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
        let current: T[] = [],
            floated: T[] = [],
            layoutVertical = true,
            clearReset: Undef<boolean>,
            blockArea: Undef<boolean>;
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
                        current = [];
                        floated = [];
                    }
                    else {
                        clearReset = true;
                    }
                }
                if (node.floating) {
                    if (blockArea) {
                        staticRows.push(current.slice(0));
                        floatedRows.push(null);
                        current = [];
                        floated = [];
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
                const children = staticRows[i];
                const floating = floatedRows[i];
                const blockCount = children.length;
                if (!floating && blockCount) {
                    const layoutType = controllerHandler.containerTypeVertical;
                    this.addLayout(new LayoutUI(
                        node,
                        controllerHandler.createNodeGroup(children[0], children, node),
                        layoutType.containerType,
                        layoutType.alignmentType | NODE_ALIGNMENT.SEGMENTED | NODE_ALIGNMENT.BLOCK,
                        children
                    ));
                }
                else {
                    const wrapper: T[] = [];
                    let alignmentFloat = 0,
                        subgroup: Undef<T>;
                    if (floating) {
                        if (floating.length > 1) {
                            const floatgroup = controllerHandler.createNodeGroup(floating[0], floating);
                            alignmentFloat = NODE_ALIGNMENT.FLOAT;
                            if (blockCount === 0 && floating.every(item => item.float === 'right')) {
                                alignmentFloat |= NODE_ALIGNMENT.RIGHT;
                            }
                            wrapper.push(floatgroup);
                        }
                        else {
                            wrapper.push(floating[0]);
                        }
                    }
                    if (blockCount > 1 || floating) {
                        subgroup = controllerHandler.createNodeGroup(children[0], children);
                        wrapper.push(subgroup);
                    }
                    else if (blockCount === 1) {
                        wrapper.push(children[0]);
                    }
                    const container = controllerHandler.createNodeGroup((floating || children)[0], wrapper, node);
                    this.addLayout(new LayoutUI(
                        node,
                        container,
                        containerTypeParent,
                        alignmentTypeParent | alignmentFloat,
                        wrapper
                    ));
                    for (const item of wrapper) {
                        this.addLayout(new LayoutUI(
                            container,
                            item,
                            containerType,
                            alignmentType | NODE_ALIGNMENT.SEGMENTED | NODE_ALIGNMENT.BLOCK
                        ));
                    }
                    if (blockCount && floating && subgroup) {
                        const [leftAbove, rightAbove] = partitionArray(floating, item => item.float !== 'right');
                        this.setFloatPadding(node, subgroup, children, leftAbove, rightAbove);
                    }
                }
            }
        }
        return layout;
    }

    protected createPseduoElement(sessionId: string, resourceId: number, element: HTMLElement, pseudoElt: PseudoElt, elementRoot: HTMLElement | ShadowRoot = element.shadowRoot || element) {
        let styleMap = getElementCache<CssStyleMap>(element, 'styleMap' + pseudoElt, sessionId);
        if (element.tagName === 'Q') {
            if (!styleMap) {
                styleMap = {};
                setElementCache(element, 'styleMap' + pseudoElt, styleMap, sessionId);
            }
            styleMap.content ||= getStyle(element, pseudoElt).content || (pseudoElt === '::before' ? 'open-quote' : 'close-quote');
        }
        if (styleMap) {
            let value = styleMap.content;
            if (value) {
                const absolute = hasCoords(styleMap.position ||= 'static');
                if (absolute && +styleMap.opacity! <= 0) {
                    return;
                }
                const textContent = trimBoth(value, '"');
                if (!isString(textContent)) {
                    if (pseudoElt === '::after') {
                        const checkPseudoAfter = (sibling: Element) => sibling.nodeName === '#text' && !/\s+$/.test(sibling.textContent!);
                        if ((absolute || !textContent || !checkPseudoAfter(element.lastChild as Element)) && !checkPseudoDimension(styleMap, true, absolute)) {
                            return;
                        }
                    }
                    else {
                        const childNodes = elementRoot.childNodes;
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
                                else if (style.float !== 'none') {
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
                        value = getStyle(current).content;
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
                                if (match[1]) {
                                    content += getNamedItem(element, match[1].trim());
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
                                    const initialValue = (getCounterIncrementValue(element, counterName, 0) ?? 1) + (getCounterValue(style.counterReset, counterName, 0) || 0);
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
                                        if (getCounterValue(getStyle(sibling).counterReset, counterName) === undefined) {
                                            iterateArray(sibling.children, (item: HTMLElement) => {
                                                if (item.className !== '__squared-pseudo') {
                                                    let increment = getCounterIncrementValue(item, counterName);
                                                    if (increment) {
                                                        incrementCounter(increment, true);
                                                    }
                                                    const childStyle = getStyle(item);
                                                    if (increment = getCounterValue(childStyle.counterIncrement, counterName)) {
                                                        incrementCounter(increment, false);
                                                    }
                                                    increment = getCounterValue(childStyle.counterReset, counterName);
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
                                            if (current = current.previousElementSibling as Null<HTMLElement>) {
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
                                        if (current.className !== '__squared-pseudo') {
                                            const pesudoIncrement = getCounterIncrementValue(current, counterName);
                                            if (pesudoIncrement) {
                                                incrementCounter(pesudoIncrement, true);
                                            }
                                            const currentStyle = getStyle(current);
                                            const counterIncrement = getCounterValue(currentStyle.counterIncrement, counterName);
                                            if (counterIncrement) {
                                                incrementCounter(counterIncrement, false);
                                            }
                                            const counterReset = getCounterValue(currentStyle.counterReset, counterName);
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
                                            content += subcounter.reduce((a, b) => a + convertListStyle(styleName, b, true) + textValue, '');
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
                if (content || value === '""') {
                    styleMap.display ||= 'inline';
                    tagName ||= /^(inline|table)/.test(styleMap.display) ? 'span' : 'div';
                    const pseudoElement = document.createElement(tagName);
                    pseudoElement.className = '__squared-pseudo';
                    pseudoElement.style.display = 'none';
                    if (pseudoElt === '::before') {
                        elementRoot.insertBefore(pseudoElement, elementRoot.childNodes[0]);
                    }
                    else {
                        elementRoot.appendChild(pseudoElement);
                    }
                    if (content) {
                        if (tagName === 'img') {
                            (pseudoElement as HTMLImageElement).src = content;
                            const image = this.resourceHandler.getImage(resourceId, content);
                            if (image) {
                                if (image.width) {
                                    styleMap.width ||= image.width + 'px';
                                }
                                if (image.height) {
                                    styleMap.height ||= image.height + 'px';
                                }
                            }
                        }
                        else {
                            pseudoElement.innerText = content;
                        }
                    }
                    for (const attr in styleMap) {
                        if (attr !== 'display') {
                            pseudoElement.style[attr] = (value = styleMap[attr]) === 'revert' ? getStyle(element, pseudoElt)[attr] : value;
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
        const paddingNodes: T[] = [];
        for (let i = 0, length = inlineAbove.length; i < length; ++i) {
            const child = inlineAbove[i];
            if (requirePadding(child) || child.centerAligned) {
                paddingNodes.push(child);
            }
            if (child.blockStatic) {
                paddingNodes.push(...child.cascade((item: T) => requirePadding(item, item.depth - child.depth)) as T[]);
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
                        target.modifyBox(BOX_STANDARD.PADDING_LEFT, offset + (!spacing && target.find(child => child.multiline, { cascade: item => !item.hasPX('width', { percent: false }) }) ? Math.max(marginLeft, this._controllerSettings.deviations.textMarginBoundarySize) : 0));
                        setColumnMaxWidth(leftAbove, offset);
                    }
                }
            }
        }
        if (q = rightAbove.length) {
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
                        target.modifyBox(BOX_STANDARD.PADDING_RIGHT, offset + (!spacing && target.find(child => child.multiline, { cascade: item => !item.hasPX('width', { percent: false }) }) ? Math.max(marginRight, this._controllerSettings.deviations.textMarginBoundarySize) : 0));
                        setColumnMaxWidth(rightAbove, offset);
                    }
                }
            }
        }
    }

    protected createAssetOptions(options?: FileActionOptions) {
        return options ? { ...options, assets: options.assets ? this.layouts.concat(options.assets) : this.layouts } : { assets: this.layouts };
    }

    private setResourceId() {
        ResourceUI.ASSETS[this._resourceId = ResourceUI.ASSETS.length] = null;
    }

    get mainElement() {
        return document.body;
    }

    get resourceId() {
        return this._resourceId;
    }

    get layouts() {
        return this._layouts.sort((a, b) => {
            const indexA = a.index!;
            const indexB = b.index!;
            if (indexA !== indexB) {
                if (indexA === 0 || indexB === Infinity || indexB === -1 && indexA !== Infinity) {
                    return -1;
                }
                else if (indexB === 0 || indexA === Infinity || indexA === -1 && indexB !== Infinity) {
                    return 1;
                }
                return indexA - indexB;
            }
            return 0;
        });
    }

    get clearMap() {
        return this.session.clearMap;
    }
}