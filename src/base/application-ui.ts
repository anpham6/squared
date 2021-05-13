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

import { STRING } from './lib/regex';

import { removeElementsByClassName } from './lib/dom';
import { appendSeparator, flatArray, trimString } from './lib/util';

type FileActionOptions = squared.FileActionOptions;
type VisibleElementMethod = (element: HTMLElement, sessionId: string, pseudoElt?: PseudoElt) => boolean;
type ApplyDefaultStylesMethod<T extends NodeUI> = (processing: squared.base.AppProcessing<T>, element: Element, pseudoElt?: PseudoElt) => void;
type RenderNodeMethod<T extends NodeUI> = (layout: ContentUI<T>) => Undef<NodeTemplate<T>>;

const { insertStyleSheetRule } = squared.lib.internal;
const { QUOTED } = squared.lib.regex.STRING;

const { formatPX, getStyle, hasCoords, isCalc, parseUnit, resolveURL } = squared.lib.css;
const { getNamedItem } = squared.lib.dom;
const { getElementCache, setElementCache } = squared.lib.session;
const { capitalize, convertWord, isString, iterateArray, partitionArray, replaceAll, splitSome, startsWith } = squared.lib.util;

let REGEXP_COUNTER: RegExp;
let REGEXP_COUNTERVALUE: RegExp;
let REGEXP_ATTRVALUE: RegExp;
let REGEXP_QUOTE: RegExp;

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
    return (!floating ? NODE_ALIGNMENT.FLOAT : 0) | (!right ? NODE_ALIGNMENT.RIGHT : 0);
}

function getPseudoQuoteValue(element: HTMLElement, pseudoElt: PseudoElt, outside: string, inside: string, sessionId: string) {
    REGEXP_QUOTE ||= new RegExp(STRING.CSS_QUOTE + `(?:\\s+${STRING.CSS_QUOTE})?`);
    let current: Null<HTMLElement> = element,
        found = 0,
        i = 0, j = -1;
    while (current && current.tagName === 'Q') {
        const quotes = getStyleAttr(sessionId, current, 'quotes', pseudoElt);
        if (quotes && quotes !== 'auto') {
            const match = REGEXP_QUOTE.exec(quotes);
            if (match) {
                if (pseudoElt === '::before') {
                    if (found === 0) {
                        outside = match[2] || match[1];
                        ++found;
                    }
                    if (match[5] && found < 2) {
                        inside = match[6] || match[5];
                        ++found;
                    }
                }
                else {
                    if (found === 0) {
                        outside = match[4] || match[3];
                        ++found;
                    }
                    if (match[7] && found < 2) {
                        inside = match[8] || match[7];
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
    else {
        if (j === 0) {
            return outside;
        }
        if (j > 0) {
            return inside;
        }
    }
    return i % 2 === 0 ? outside : inside;
}

function getCounterValue(value: Undef<string>, counterName: string, fallback = 1) {
    if (value && value !== 'none') {
        (REGEXP_COUNTERVALUE ||= /([^-\d][^\s]*)(\s+([+-]?\d+))?/g).lastIndex = 0;
        let match: Null<RegExpExecArray>;
        while (match = REGEXP_COUNTERVALUE.exec(value)) {
            if (match[1] === counterName) {
                return match[2] ? +match[2] : fallback;
            }
        }
    }
    return null;
}

function setElementState(node: NodeUI, type?: number) {
    const cacheState = node.unsafe<CacheStateUI<NodeUI>>('cacheState')!;
    cacheState.naturalChild = true;
    if (type === 1) {
        cacheState.styleElement = false;
        cacheState.naturalElement = false;
        cacheState.htmlElement = false;
        cacheState.svgElement = false;
    }
    else {
        cacheState.styleElement = true;
        if (type === 2) {
            cacheState.naturalElement = false;
            cacheState.htmlElement = true;
            cacheState.svgElement = false;
        }
        else {
            cacheState.naturalElement = true;
        }
    }
}

function isDocumentBase(node: NodeUI) {
    const renderExtension = node.renderExtension;
    return !!renderExtension && renderExtension.some(item => item.documentBase);
}

function getStyleAttr(sessionId: string, element: Element, attr: CssStyleAttr, pseudoElt = '') {
    const styleMap = getElementCache<CSSStyleDeclaration>(element, 'styleMap' + pseudoElt, sessionId);
    return styleMap && styleMap[attr] || getStyle(element, pseudoElt as PseudoElt)[attr];
}

const getStyleMap = (sessionId: string, element: Element, pseudoElt = '') => getElementCache<CSSStyleDeclaration>(element, 'styleMap' + pseudoElt, sessionId) || getStyle(element, pseudoElt as PseudoElt);
const setColumnMaxWidth = (nodes: NodeUI[], value: number) => nodes.forEach(child => !child.hasUnit('width') && !child.hasUnit('maxWidth') && !child.imageContainer && child.css('maxWidth', formatPX(value)));

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

    private _layouts: LayoutAsset[] = [];
    private _resourceId!: number;
    private _controllerSettings!: ControllerSettingsUI;
    private _excludedElements!: string[];

    private _applyDefaultStyles!: ApplyDefaultStylesMethod<T>;
    private _visibleElement!: VisibleElementMethod;
    private _renderNode!: RenderNodeMethod<T>;
    private _renderNodeGroup!: RenderNodeMethod<T>;

    public abstract getUserSetting: squared.base.UserSettingMethod<T, UserResourceSettingsUI>;

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
        this._excludedElements = localSettings.unsupported.excluded;
        this.setResourceId();
        super.init();
    }

    public finalize() {
        if (this.closed) {
            return true;
        }
        const controller = this.controllerHandler;
        const [extensions, children] = this.sessionAll as [ExtensionUI<T>[], T[]];
        const length = children.length;
        const rendered: T[] = new Array(length - 1);
        let itemCount = 0;
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
        if (itemCount < rendered.length) {
            rendered.length = itemCount;
        }
        controller.optimize(rendered);
        for (let i = 0, q = extensions.length; i < q; ++i) {
            const ext = extensions[i];
            if (ext.postOptimize) {
                const postOptimize = ext.postOptimize.bind(ext);
                for (const node of ext.subscribers) {
                    postOptimize(node, rendered);
                }
            }
        }
        const documentRoot: LayoutRoot<T>[] = [];
        const finalizeData: FinalizeDataExtensionUI<T> = { resourceId: this.resourceId, rendered, documentRoot };
        itemCount = rendered.length;
        for (let i = 0; i < itemCount; ++i) {
            const node = rendered[i];
            if (node.hasResource(NODE_RESOURCE.BOX_SPACING)) {
                node.setBoxSpacing();
            }
            if (node.documentRoot && node.renderParent && !(!node.rendering && !node.inlineText && node.naturalElements.length)) {
                const host = node.innerMostWrapped as T;
                const filename = host.data<string>(Application.KEY_NAME, 'filename');
                const renderTemplates = node.renderParent.renderTemplates as Undef<NodeTemplate<T>[]>;
                if (filename && renderTemplates) {
                    documentRoot.push({ node, pathname: host.data<string>(Application.KEY_NAME, 'pathname'), filename, documentBase: isDocumentBase(host) || isDocumentBase(node), renderTemplates });
                }
            }
        }
        for (let i = 0, q = extensions.length; i < q; ++i) {
            const ext = extensions[i];
            if (ext.postBoxSpacing) {
                const postBoxSpacing = ext.postBoxSpacing.bind(ext);
                for (const node of ext.subscribers) {
                    postBoxSpacing(node, rendered);
                }
            }
            ext.beforeFinalize(finalizeData);
        }
        for (let i = 0, q = documentRoot.length; i < q; ++i) {
            const { node, pathname, filename, documentBase, renderTemplates } = documentRoot[i];
            this.saveDocument(
                filename,
                this._controllerSettings.layout.baseTemplate + controller.writeDocument(renderTemplates, Math.abs(node.depth), this.userSettings.showAttributes),
                pathname,
                documentBase ? 0 : -1
            );
        }
        controller.finalize(this._layouts);
        for (let i = 0, q = extensions.length; i < q; ++i) {
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
            pathname: pathname ? trimString(replaceAll(pathname, '\\', '/'), '/') : appendSeparator(this.userSettings.outputDirectory, this._controllerSettings.layout.baseDirectory),
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
        const { element, parent, children, childIndex, flags = 0 } = options;
        const { cache, afterInsertNode } = this.getProcessing(sessionId)!;
        const node = new this.Node(this.nextId, sessionId, element);
        this._afterInsertNode(node, sessionId);
        if (afterInsertNode) {
            afterInsertNode.some(item => item.afterInsertNode!(node));
        }
        if (parent) {
            node.unsafe('depth', parent.depth + 1);
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
            cache.add(node, flags & CREATE_NODE.DELEGATE ? { cascade: (flags & CREATE_NODE.CASCADE) > 0 } : undefined);
        }
        if (childIndex !== undefined) {
            node.unsafe('childIndex', childIndex);
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
            const parent = node.parent;
            if (parent) {
                parent.visible = false;
                node.documentParent = parent;
                setElementState(parent);
                if (parent.element === document.documentElement) {
                    parent.addAlign(NODE_ALIGNMENT.AUTO_LAYOUT);
                    parent.exclude({ resource: NODE_RESOURCE.FONT_STYLE | NODE_RESOURCE.VALUE_STRING, procedure: NODE_PROCEDURE.ALL });
                    cache.add(parent as T);
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
                            if (item.hasUnit(attr)) {
                                if (!data) {
                                    preAlignment.set(item, data = {});
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
            excluded.each(item => !item.pageFlow && item.cssTry('display', 'none'));
            cache.each(item => {
                if (item.pseudoElt) {
                    pseudoElements.push(item);
                }
                else {
                    item.setBounds(!resetBounds && !preAlignment.get(item));
                }
            });
            if (pseudoElements.length) {
                const pseudoMap: [item: T, previousId: Null<string>, removeStyle: Null<VoidFunction>][] = [];
                for (let i = 0, length = pseudoElements.length; i < length; ++i) {
                    const item = pseudoElements[i];
                    const parentElement = item.parentElement!;
                    let previousId: Null<string> = null,
                        removeStyle: Null<VoidFunction> = null;
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
                        removeStyle = insertStyleSheetRule(tagName + item.pseudoElt + ' { display: none !important; }', item.shadowHost);
                    }
                    if (item.cssTry('display', item.display)) {
                        pseudoMap.push([item, previousId, removeStyle]);
                    }
                }
                const length = pseudoMap.length;
                for (let i = 0; i < length; ++i) {
                    pseudoMap[i][0].setBounds(false);
                }
                for (let i = 0; i < length; ++i) {
                    const [item, previousId, removeStyle] = pseudoMap[i];
                    if (previousId !== null) {
                        item.parentElement!.id = previousId;
                    }
                    if (removeStyle) {
                        removeStyle();
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
                            element.style[attr] = reset[attr]!;
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
        const { elementId, dataset } = node;
        const systemName = capitalize(this.systemName);
        const settings = processing.settings;
        let pathname = settings && settings.pathname || dataset['pathname' + systemName] || dataset.pathname,
            filename = settings && settings.filename || dataset['filename' + systemName] || dataset.filename;
        if (!filename) {
            const baseName = elementId && convertWord(elementId) || 'document_' + this.length;
            filename = baseName;
            let i = 0;
            while (this._layouts.find(item => item.filename === filename)) {
                filename = baseName + '_' + ++i;
            }
        }
        if (pathname) {
            pathname = trimString(replaceAll(pathname, '\\', '/'), '/');
            dataset['pathname' + systemName] = pathname;
            node.data(Application.KEY_NAME, 'pathname', pathname);
        }
        dataset['filename' + systemName] = filename;
        node.data(Application.KEY_NAME, 'filename', filename);
        this.setBaseLayout(processing);
        this.setConstraints(processing);
        this.setResources(processing);
    }

    public useElement(element: HTMLElement) {
        const use = this.getDatasetName('use', element);
        return !!use && splitSome(use, value => this.extensionManager.get(value));
    }

    public toString() {
        return this.layouts[0]?.content || '';
    }

    protected cascadeParentNode(processing: squared.base.AppProcessing<T>, sessionId: string, resourceId: number, parentElement: HTMLElement, depth: number, pierceShadowRoot: boolean, createQuerySelectorMap: boolean, extensions: Null<ExtensionUI<T>[]>, shadowParent?: ShadowRoot, beforeElement?: HTMLElement, afterElement?: HTMLElement, cascadeAll?: boolean) {
        const node = this.insertNode(processing, parentElement, cascadeAll);
        setElementState(node);
        if (depth === 0) {
            processing.cache.add(node);
            for (const name of node.extensions) {
                if ((this.extensionManager.get(name) as Undef<ExtensionUI<T>>)?.cascadeAll) {
                    cascadeAll = true;
                    break;
                }
            }
            beforeElement = this.createPseduoElement(sessionId, resourceId, parentElement, '::before');
            afterElement = this.createPseduoElement(sessionId, resourceId, parentElement, '::after');
        }
        const display = node.display;
        if (display !== 'none' || depth === 0 || cascadeAll || node.extensions.some(name => (this.extensionManager.get(name) as Undef<ExtensionUI<T>>)?.documentBase)) {
            if (node.excluded || this._preventNodeCascade(node)) {
                return node;
            }
            const { cache, rootElements } = processing;
            const hostParent = parentElement.shadowRoot || parentElement;
            const childNodes = hostParent.childNodes;
            const children: T[] = [];
            const elements: T[] = [];
            const childDepth = depth + 1;
            let inlineText = true,
                plainText = -1,
                lineBreak = -1,
                j = 0;
            for (let i = 0, child: T, length = childNodes.length; i < length; ++i) {
                const element = childNodes[i] as HTMLElement;
                if (element === beforeElement) {
                    setElementState(child = this.insertNode(processing, beforeElement, cascadeAll, '::before'), 2);
                    if (!child.textEmpty) {
                        child.cssApply(node.textStyle, false);
                        child.inlineText = true;
                    }
                    inlineText = false;
                    node.innerBefore = child;
                }
                else if (element === afterElement) {
                    setElementState(child = this.insertNode(processing, afterElement, cascadeAll, '::after'), 2);
                    if (!child.textEmpty) {
                        child.cssApply(node.textStyle, false);
                        child.inlineText = true;
                    }
                    inlineText = false;
                    node.innerAfter = child;
                }
                else if (element.nodeName[0] === '#') {
                    if (this.visibleText(node, element)) {
                        setElementState(child = this.insertNode(processing, element), 1);
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
                        const hostChild = shadowRoot || element;
                        const beforeChild = this.createPseduoElement(sessionId, resourceId, element, '::before', hostChild);
                        const afterChild = this.createPseduoElement(sessionId, resourceId, element, '::after', hostChild);
                        if (hostChild.childNodes.length) {
                            child = this.cascadeParentNode(
                                processing,
                                sessionId,
                                resourceId,
                                element,
                                childDepth,
                                pierceShadowRoot,
                                createQuerySelectorMap,
                                extensions,
                                shadowRoot || shadowParent,
                                beforeChild,
                                afterChild,
                                cascadeAll
                            );
                            if (child.display === 'contents' && !child.excluded && !shadowRoot) {
                                for (const item of child.naturalChildren as T[]) {
                                    if (item.naturalElement) {
                                        elements.push(item);
                                    }
                                    else if (item.plainText) {
                                        plainText = j;
                                    }
                                    item.internalSelf(node, childDepth, j++, node);
                                    children.push(item);
                                }
                                child.excluded = true;
                                continue;
                            }
                        }
                        else {
                            setElementState(child = this.insertNode(processing, element, cascadeAll), 0);
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
                child.internalSelf(node, childDepth, j++, node);
                children.push(child);
            }
            node.internalNodes(children, elements, inlineText && plainText !== -1, hostParent !== parentElement);
            const contents = display === 'contents';
            const length = children.length;
            if (!inlineText) {
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
            if (elements.length && createQuerySelectorMap) {
                node.queryMap = this.createQueryMap(elements);
            }
        }
        return node;
    }

    protected setBaseLayout(processing: squared.base.AppProcessing<T>) {
        const controller = this.controllerHandler;
        const { extensionMap, clearMap } = this.session;
        const { sessionId, extensions, cache } = processing;
        const rootNode = processing.node!.parent;
        const mapData = new Map<number, T[]>();
        const setMapDepth = (depth: number, node: T) => {
            const data = mapData.get(depth = depth + 1);
            if (data) {
                if (!data.includes(node)) {
                    data.push(node);
                }
            }
            else {
                mapData.set(depth, [node]);
            }
            if (depth > 0 && !mapData.has(-depth)) {
                mapData.set(-depth, []);
            }
        };
        const deleteNode = (depth: number, node: T) => {
            const data = mapData.get(depth + 1);
            if (data) {
                const index = data.indexOf(node);
                if (index !== -1) {
                    data.splice(index, 1);
                }
            }
        };
        if (rootNode) {
            setMapDepth(-1, rootNode as T);
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
        cache.afterAdd = function(this: T, options: NodeListAddOptions) {
            if (options.remove) {
                deleteNode(this.depth, this);
            }
            setMapDepth(-(this.depth + 2), this);
            if (options.cascade && !this.isEmpty()) {
                this.cascade((item: T) => {
                    if (!item.isEmpty()) {
                        const depth = item.depth;
                        deleteNode(depth, item);
                        setMapDepth(-(depth + 2), item);
                    }
                });
            }
        };
        for (let i = 0, length = extensions.length; i < length; ++i) {
            (extensions[i] as ExtensionUI<T>).beforeBaseLayout(sessionId, cache);
        }
        let extensionsTraverse = extensions.filter((item: ExtensionUI<T>) => !item.eventOnly) as ExtensionUI<T>[];
        for (const depth of mapData.values()) {
            for (let i = 0, q = depth.length; i < q; ++i) {
                const parent = depth[i];
                const r = parent.size();
                if (r === 0) {
                    continue;
                }
                const renderExtension = parent.renderExtension as Undef<ExtensionUI<T>[]>;
                const floatContainer = parent.floatContainer;
                const axisY = parent.toArray() as T[];
                for (let j = 0; j < r; ++j) {
                    let nodeY = axisY[j];
                    if (nodeY.rendered || !nodeY.visible) {
                        continue;
                    }
                    let parentY = nodeY.parent as T;
                    if (r > 1 && j < r - 1 && nodeY.pageFlow && (parentY.alignmentType === 0 || parentY.hasAlign(NODE_ALIGNMENT.UNKNOWN) || nodeY.hasAlign(NODE_ALIGNMENT.EXTENDABLE)) && !nodeY.nodeGroup && nodeY.hasSection(APP_SECTION.DOM_TRAVERSE)) {
                        const horizontal: T[] = [];
                        const vertical: T[] = [];
                        let k = j, l = 0;
                        if (parentY.layoutVertical && nodeY.hasAlign(NODE_ALIGNMENT.EXTENDABLE)) {
                            horizontal.push(nodeY);
                            ++k;
                            ++l;
                        }
                        traverse: {
                            let floatActive: Undef<boolean>;
                            for ( ; k < r; ++k, ++l) {
                                const item = axisY[k];
                                if (item.pageFlow) {
                                    if (item.labelFor && !item.visible) {
                                        --l;
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
                                    if (l === 0) {
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
                                    const s = vertical.length;
                                    if (s) {
                                        if (vertical[s - 1].blockStatic && !item.renderExclude) {
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
                                if (horizontal[horizontal.length - 1] === axisY[r - 1]) {
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
                                if (segEnd === axisY[r - 1]) {
                                    parentY.removeAlign(NODE_ALIGNMENT.UNKNOWN);
                                }
                                else if (segEnd.inlineFlow && segEnd !== axisY[r - 1]) {
                                    segEnd.addAlign(NODE_ALIGNMENT.EXTENDABLE);
                                }
                                if (layout && this.addLayout(layout)) {
                                    parentY = nodeY.parent as T;
                                }
                            }
                        }
                    }
                    nodeY.removeAlign(NODE_ALIGNMENT.EXTENDABLE);
                    if (j === r - 1) {
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
                            for (let k = 0, s = combined.length; k < s; ++k) {
                                const ext = combined[k];
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
                                    if ((next = result.next === true) || result.complete) {
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
                            for (let k = 0, s = combined.length; k < s; ++k) {
                                const ext = combined[k];
                                if (ext.is(nodeY) && ext.condition(nodeY, parentY) && !(descendant && descendant.includes(ext))) {
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
                                        if ((next = result.next === true) || result.complete) {
                                            break;
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
                            layout = new LayoutUI(parentY, nodeY, containerType, nodeY.alignmentType);
                            if (containerType === 0) {
                                controller.processUnknownParent(layout as LayoutUI<T>);
                            }
                        }
                        else {
                            layout = new ContentUI(parentY, nodeY, containerType, nodeY.alignmentType);
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
                    if (a.nodeGroup) {
                        return -1;
                    }
                    if (b.nodeGroup) {
                        return 1;
                    }
                    if (a.innerWrapped === b) {
                        return -1;
                    }
                    if (a === b.innerWrapped) {
                        return 1;
                    }
                    const outerA = a.outerWrapper;
                    const outerB = b.outerWrapper;
                    if (a === outerB || !outerA && outerB) {
                        return -1;
                    }
                    if (b === outerA || !outerB && outerA) {
                        return 1;
                    }
                }
                return 0;
            }
            return depth;
        });
        for (let i = 0, length = extensions.length; i < length; ++i) {
            const ext = extensions[i] as ExtensionUI<T>;
            if (ext.postBaseLayout) {
                const postBaseLayout = ext.postBaseLayout.bind(ext);
                for (const node of ext.subscribers) {
                    if (node.sessionId === sessionId) {
                        postBaseLayout(node);
                    }
                }
            }
            ext.afterBaseLayout(sessionId, cache);
        }
    }

    protected setConstraints(processing: squared.base.AppProcessing<T>) {
        const { sessionId, cache, extensions } = processing;
        this.controllerHandler.setConstraints(cache);
        for (let i = 0, length = extensions.length; i < length; ++i) {
            const ext = extensions[i] as ExtensionUI<T>;
            if (ext.postConstraints) {
                const postConstraints = ext.postConstraints.bind(ext);
                for (const node of ext.subscribers) {
                    if (node.sessionId === sessionId) {
                        postConstraints(node);
                    }
                }
            }
            ext.afterConstraints(sessionId, cache);
        }
    }

    protected setResources(processing: squared.base.AppProcessing<T>) {
        const { sessionId, resourceId, cache, extensions } = processing;
        this.resourceHandler.setData(cache);
        for (let i = 0, length = extensions.length; i < length; ++i) {
            const ext = extensions[i] as ExtensionUI<T>;
            if (ext.postResources) {
                const postResources = ext.postResources.bind(ext);
                for (const node of ext.subscribers) {
                    if (node.sessionId === sessionId) {
                        postResources(node);
                    }
                }
            }
            ext.afterResources(sessionId, resourceId, cache);
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
            const wrapper = controllerHandler.createNodeGroup(node, inlineBelow, parent, { childIndex: node.childIndex });
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
                outerGroup: Undef<T>;
            if (Array.isArray(item[0])) {
                segments = item as T[][];
                itemCount = segments.length;
                const grouping = flatArray(segments, Infinity).sort((a: T, b: T) => a.childIndex - b.childIndex) as T[];
                const node = layout.node;
                if (node.layoutVertical) {
                    outerGroup = node;
                }
                else {
                    outerGroup = controllerHandler.createNodeGroup(grouping[0], grouping, node);
                    this.addLayout(LayoutUI.create({
                        parent: node,
                        node: outerGroup,
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
            outerGroup ||= layout.node;
            for (let j = 0; j < itemCount; ++j) {
                const seg = segments[j];
                const target = controllerHandler.createNodeGroup(seg[0], seg, outerGroup, { flags: CREATE_NODE.DELEGATE | CREATE_NODE.CASCADE });
                const group = new LayoutUI(outerGroup, target, 0, NODE_ALIGNMENT.SEGMENTED, seg);
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
                    this.setFloatPadding(outerGroup, target, inlineAbove, leftSub && flatArray(leftSub), rightSub && flatArray(rightSub));
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
                        wrapper.push(subgroup = controllerHandler.createNodeGroup(children[0], children));
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
                setElementCache(element, 'styleMap' + pseudoElt, styleMap = {}, sessionId);
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
                let content = '',
                    tagName: Undef<string>;
                switch (value) {
                    case 'initial':
                    case 'unset':
                    case 'revert':
                        value = getStyle(element, pseudoElt).content;
                        break;
                    case 'inherit':
                        value = getStyle(element).content;
                        break;
                }
                switch (value) {
                    case 'normal':
                    case 'none':
                    case 'no-open-quote':
                    case 'no-close-quote':
                        return;
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
                    default:
                        if (value[0] === '"' || startsWith(value, 'attr')) {
                            (REGEXP_ATTRVALUE ||= new RegExp(QUOTED + '|attr\\(([^)]+)\\)', 'g')).lastIndex = 0;
                            let match: Null<RegExpExecArray>;
                            while (match = REGEXP_ATTRVALUE.exec(value)) {
                                if (match[2]) {
                                    content += getNamedItem(element, match[2].trim());
                                }
                                else {
                                    content += match[1];
                                }
                            }
                            if (!isString(content)) {
                                const checkDimension = (after?: boolean) => {
                                    switch (styleMap!.display) {
                                        case 'inline':
                                        case 'block':
                                        case 'inherit':
                                        case 'initial':
                                        case 'unset':
                                        case 'revert': {
                                            const { width, height } = styleMap!;
                                            if ((after || !width || !parseFloat(width) && !isCalc(width)) && (!height || !parseFloat(height) && !isCalc(height))) {
                                                for (const attr in styleMap) {
                                                    const unit = parseFloat(styleMap[attr as CssStyleAttr]!);
                                                    if (unit) {
                                                        switch (attr) {
                                                            case 'minHeight':
                                                                return true;
                                                            case 'borderTopWidth':
                                                                if (getStyle(element, pseudoElt).borderTopStyle !== 'none') {
                                                                    return true;
                                                                }
                                                                continue;
                                                            case 'borderRightWidth':
                                                                if (getStyle(element, pseudoElt).borderRightStyle !== 'none') {
                                                                    return true;
                                                                }
                                                                continue;
                                                            case 'borderBottomWidth':
                                                                if (getStyle(element, pseudoElt).borderBottomStyle !== 'none') {
                                                                    return true;
                                                                }
                                                                continue;
                                                            case 'borderLeftWidth':
                                                                if (getStyle(element, pseudoElt).borderLeftStyle !== 'none') {
                                                                    return true;
                                                                }
                                                                continue;
                                                        }
                                                        if (startsWith(attr, 'padding')) {
                                                            return true;
                                                        }
                                                        if (!absolute && startsWith(attr, 'margin')) {
                                                            return true;
                                                        }
                                                    }
                                                    else if (unit === 0 && attr === 'maxHeight') {
                                                        break;
                                                    }
                                                }
                                                return false;
                                            }
                                        }
                                    }
                                    return true;
                                };
                                if (pseudoElt === '::after') {
                                    const checkLastChild = (sibling: Null<ChildNode>) => !!sibling && sibling.nodeName === '#text' && !/\s+$/.test(sibling.textContent!);
                                    if ((absolute || !content || !checkLastChild(element.lastChild)) && !checkDimension(true)) {
                                        return;
                                    }
                                }
                                else if (!checkDimension()) {
                                    return;
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
                                            const { position, float } = getStyle(child);
                                            if (hasCoords(position)) {
                                                continue;
                                            }
                                            if (float !== 'none') {
                                                return;
                                            }
                                            break;
                                        }
                                    }
                                }
                            }
                        }
                        else {
                            const url = resolveURL(value);
                            if (url) {
                                if (ResourceUI.hasMimeType(this._controllerSettings.mimeType.image, url)) {
                                    tagName = 'img';
                                    content = url;
                                }
                            }
                            else {
                                (REGEXP_COUNTER ||= new RegExp(`counter\\(([^,)]+)(?:,\\s*([a-z-]+))?\\)|counters\\(([^,]+),\\s*${QUOTED}(?:,\\s*([a-z-]+))?\\)|${QUOTED}`, 'g')).lastIndex = 0;
                                let match: Null<RegExpExecArray>;
                                while (match = REGEXP_COUNTER.exec(value)) {
                                    if (match[6]) {
                                        content += match[6];
                                        continue;
                                    }
                                    const [counterName, styleName = 'decimal'] = match[1] ? [match[1], match[2]] : [match[3], match[5]];
                                    const counters: number[] = [NaN];
                                    let current: Null<HTMLElement> = element,
                                        depth = 0,
                                        initial = 0,
                                        wasSet = 0,
                                        wasReset: Undef<boolean>,
                                        locked: Undef<boolean>;
                                    const incrementCounter = (increment: Null<number>, isSet?: boolean) => {
                                        if (increment !== null && !locked && (isSet || wasSet !== 2)) {
                                            if (isNaN(counters[0])) {
                                                counters[0] = increment;
                                            }
                                            else {
                                                counters[0] += increment;
                                            }
                                        }
                                    };
                                    const cascadeSibling = (target: Element, ignoreReset?: boolean, ascending?: boolean) => {
                                        const [counterSet, counterReset] = setCounter(target, ascending);
                                        let type = 0;
                                        if (counterSet !== null) {
                                            wasSet = ascending ? 2 : 1;
                                        }
                                        if (counterReset !== null) {
                                            if (depth === 0) {
                                                if (ascending && !wasReset) {
                                                    type = 1;
                                                }
                                                else {
                                                    return 1;
                                                }
                                            }
                                            else {
                                                return 0;
                                            }
                                        }
                                        iterateArray(target.children, (item: Element) => {
                                            if (item.className !== '__squared-pseudo') {
                                                switch (cascadeSibling(item)) {
                                                    case 0:
                                                    case 1:
                                                        wasReset = true;
                                                        return true;
                                                }
                                            }
                                        });
                                        if (type === 1) {
                                            if (!ignoreReset || target === current) {
                                                incrementCounter(counterReset, true);
                                                locked = false;
                                                counters.unshift(NaN);
                                                return 1;
                                            }
                                            return ascending ? -1 : 0;
                                        }
                                        if (ascending) {
                                            if (wasSet === 2) {
                                                return 2;
                                            }
                                            if (wasSet === 1 && !wasReset) {
                                                incrementCounter(initial);
                                                locked = true;
                                            }
                                        }
                                        return wasReset ? 0 : -1;
                                    };
                                    const setCounter = (target: Element, ascending?: boolean) => {
                                        const { counterSet, counterReset, counterIncrement } = getStyleMap(sessionId, target);
                                        const setValue = getCounterValue(counterSet, counterName, 0);
                                        const resetValue = getCounterValue(counterReset, counterName);
                                        if (!locked) {
                                            const isSet = setValue !== null;
                                            if (ascending) {
                                                incrementCounter(setValue, isSet);
                                            }
                                            else if (isSet) {
                                                counters[0] = setValue!;
                                            }
                                            if (ascending || setValue === null && resetValue === null) {
                                                incrementCounter(getCounterValue(counterIncrement, counterName), isSet);
                                            }
                                            incrementCounter(getCounterValue(getStyleMap(sessionId, target, pseudoElt).counterIncrement, counterName), isSet);
                                        }
                                        return [setValue, resetValue];
                                    };
                                    while (current) {
                                        const [counterSet, counterReset] = setCounter(current, true);
                                        initial = 0;
                                        wasReset = false;
                                        if (counterSet !== null) {
                                            locked = true;
                                            wasSet = 2;
                                        }
                                        else {
                                            wasSet = 0;
                                        }
                                        if (counterReset !== null) {
                                            incrementCounter(counterReset, true);
                                            if (match[1]) {
                                                break;
                                            }
                                            else {
                                                locked = false;
                                                counters.unshift(NaN);
                                            }
                                        }
                                        let sibling = current.previousElementSibling;
                                        while (sibling) {
                                            if (sibling.className !== '__squared-pseudo') {
                                                if (!locked) {
                                                    initial = counters[0];
                                                }
                                                switch (cascadeSibling(sibling, counterReset !== null, true)) {
                                                    case 0:
                                                        incrementCounter(initial, true);
                                                        locked = true;
                                                        break;
                                                    case 1:
                                                        wasSet = 0;
                                                        break;
                                                    case 2:
                                                        locked = true;
                                                        break;
                                                }
                                            }
                                            sibling = sibling.previousElementSibling;
                                        }
                                        ++depth;
                                        current = current.parentElement;
                                    }
                                    const delimiter = match[4] ? replaceAll(match[4], '\\"', '"') : '';
                                    content += counters.reduce((a, b) => a + (!isNaN(b) ? (a ? delimiter : '') + convertListStyle(styleName, b, true) : ''), '');
                                }
                            }
                        }
                        break;
                }
                if (content || value === '""') {
                    tagName ||= /^(?:inline|table)/.test(styleMap.display ||= 'inline') ? 'span' : 'div';
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
                            const { width, height } = this.resourceHandler.getImageDimension(resourceId, content);
                            if (width && height) {
                                let options: Undef<ParseUnitOptions>;
                                if (styleMap.fontSize) {
                                    options = { fontSize: parseUnit(styleMap.fontSize) };
                                }
                                if (!styleMap.width && styleMap.height) {
                                    const offset = parseUnit(styleMap.height, options);
                                    if (offset > 0) {
                                        styleMap.width = width * offset / height + 'px';
                                    }
                                }
                                else if (styleMap.width && !styleMap.height) {
                                    const offset = parseUnit(styleMap.width, options);
                                    if (offset > 0) {
                                        styleMap.height = height * offset / width + 'px';
                                    }
                                }
                                else {
                                    styleMap.width = width + 'px';
                                    styleMap.height = height + 'px';
                                }
                            }
                        }
                        else {
                            pseudoElement.innerText = content;
                        }
                    }
                    const style = getStyle(element, pseudoElt);
                    for (const attr in styleMap) {
                        if (attr !== 'display') {
                            switch (value = styleMap[attr]) {
                                case 'inherit':
                                case 'unset':
                                case 'revert':
                                    value = style[attr];
                                    styleMap[attr] = value;
                                    break;
                            }
                            pseudoElement.style[attr] = value;
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
                        target.modifyBox(BOX_STANDARD.PADDING_LEFT, offset + (!spacing && target.find(child => child.multiline, { cascade: item => !item.hasUnit('width', { percent: false }) }) ? Math.max(marginLeft, this._controllerSettings.deviations.textMarginBoundarySize) : 0));
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
                        target.modifyBox(BOX_STANDARD.PADDING_RIGHT, offset + (!spacing && target.find(child => child.multiline, { cascade: item => !item.hasUnit('width', { percent: false }) }) ? Math.max(marginRight, this._controllerSettings.deviations.textMarginBoundarySize) : 0));
                        setColumnMaxWidth(rightAbove, offset);
                    }
                }
            }
        }
    }

    protected createAssetOptions(options?: FileActionOptions) {
        return options ? { ...options, assets: options.assets ? (this.layouts as FileAsset[]).concat(options.assets) : this.layouts } : { assets: this.layouts };
    }

    protected setResourceId() {
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
            const indexA = a.index;
            const indexB = b.index;
            if (indexA !== indexB) {
                if (indexA === 0 || indexB === Infinity || indexB === -1 && indexA !== Infinity) {
                    return -1;
                }
                if (indexB === 0 || indexA === Infinity || indexA === -1 && indexB !== Infinity) {
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