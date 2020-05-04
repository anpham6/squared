import { FileActionOptions, CreateNodeOptions, LayoutResult, LayoutRoot, NodeTemplate } from '../../@types/base/application';
import { FileAsset } from '../../@types/base/file';

import { AppSession } from '../../@types/base/internal-ui';
import { ControllerSettings, UserSettings } from '../../@types/base/application-ui';

import Application from './application';
import NodeList from './nodelist';
import ControllerUI from './controller-ui';
import ExtensionUI from './extension-ui';
import FileUI from './file-ui';
import LayoutUI from './layout-ui';
import NodeUI from './node-ui';
import ResourceUI from './resource-ui';

import { APP_SECTION, BOX_STANDARD, NODE_ALIGNMENT, NODE_PROCEDURE, NODE_RESOURCE, NODE_TRAVERSE } from './lib/enumeration';

type LayoutMap = Map<number, Map<number, NodeUI>>;

const $lib = squared.lib;

const { BOX_POSITION, TEXT_STYLE, convertListStyle, formatPX, getStyle, insertStyleSheetRule, resolveURL } = $lib.css;
const { getNamedItem, isTextNode, removeElementsByClassName } = $lib.dom;
const { maxArray } = $lib.math;
const { appendSeparator, capitalize, convertFloat, convertWord, flatArray, hasBit, hasMimeType, isString, iterateArray, partitionArray, safeNestedArray, safeNestedMap, trimBoth, trimString } = $lib.util;
const { XML } = $lib.regex;
const { getElementCache, getPseudoElt, setElementCache } = $lib.session;
const { isPlainText } = $lib.xml;

const REGEX_COUNTER = /\s*(?:attr\(([^)]+)\)|(counter)\(([^,)]+)(?:,\s+([a-z-]+))?\)|(counters)\(([^,]+),\s+"([^"]*)"(?:,\s+([a-z-]+))?\)|"([^"]+)")\s*/g;
const STRING_PSEUDOPREFIX = '__squared_';

function createPseudoElement(parent: HTMLElement, tagName = 'span', index = -1) {
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

function saveAlignment(preAlignment: ObjectIndex<StringMap>, element: HTMLElement, id: number, attr: string, value: string, restoreValue: string) {
    safeNestedMap(preAlignment, id)[attr] = restoreValue;
    element.style.setProperty(attr, value);
}

function getCounterValue(name: string, counterName: string, fallback = 1) {
    if (name !== 'none') {
        const pattern = /\s*([^\-\d][^\-\d]?[^\s]*)\s+(-?\d+)\s*/g;
        let match: Null<RegExpExecArray>;
        while ((match = pattern.exec(name)) !== null) {
            if (match[1] === counterName) {
                return parseInt(match[2]);
            }
        }
        return fallback;
    }
    return undefined;
}

function getCounterIncrementValue(parent: Element, counterName: string, pseudoElt: string, sessionId: string, fallback?: number) {
    const counterIncrement: string | undefined = getElementCache(parent, `styleMap${pseudoElt}`, sessionId)?.counterIncrement;
    return counterIncrement && getCounterValue(counterIncrement, counterName, fallback);
}

function checkTraverseHorizontal(node: NodeUI, horizontal: NodeUI[], vertical: NodeUI[]) {
    if (vertical.length) {
        return false;
    }
    horizontal.push(node);
    return true;
}

function checkTraverseVertical(node: NodeUI, horizontal: NodeUI[], vertical: NodeUI[]) {
    if (horizontal.length) {
        return false;
    }
    vertical.push(node);
    return true;
}

function prioritizeExtensions<T extends NodeUI>(value: Undef<string>, extensions: ExtensionUI<T>[]) {
    if (value) {
        const included = value.split(XML.SEPARATOR);
        const result: ExtensionUI<T>[] = [];
        const untagged: ExtensionUI<T>[] = [];
        extensions.forEach(ext => {
            const index = included.indexOf(ext.name);
            if (index !== -1) {
                result[index] = ext;
            }
            else {
                untagged.push(ext);
            }
        });
        if (result.length) {
            return flatArray<ExtensionUI<T>>(result).concat(untagged);
        }
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
    const previousSibling = <Element> element.childNodes[element.childNodes.length - 1];
    if (isTextNode(previousSibling)) {
        return !/\s+$/.test(previousSibling.textContent as string);
    }
    return false;
}

function checkPseudoDimension(styleMap: StringMap, after: boolean, absolute: boolean) {
    if ((after || convertFloat(styleMap.width) === 0) && convertFloat(styleMap.height) === 0) {
        for (const attr in styleMap) {
            if (/(padding|Width|Height)/.test(attr) && convertFloat(styleMap[attr]) > 0) {
                return true;
            }
            else if (!absolute && attr.startsWith('margin') && convertFloat(styleMap[attr]) !== 0) {
                return true;
            }
        }
        return false;
    }
    return true;
}

const isHorizontalAligned = (node: NodeUI) => !node.blockStatic && node.autoMargin.horizontal !== true && !(node.blockDimension && node.css('width') === '100%') && (!(node.plainText && node.multiline) || node.floating);
const requirePadding = (node: NodeUI): boolean => node.textElement && (node.blockStatic || node.multiline);
const getRelativeOffset = (item: NodeUI, fromRight: boolean) => item.positionRelative ? (item.hasPX('left') ? item.left * (fromRight ? 1 : -1) : item.right * (fromRight ? -1 : 1)) : 0;
const hasOuterParentExtension = (node: NodeUI) => node.ascend({ condition: (item: NodeUI) => !!item.use }).length > 0;
const setMapDepth = (map: LayoutMap, depth: number, id: number, node: NodeUI) => map.get(depth)?.set(id, node) || map.set(depth, new Map<number, NodeUI>([[id, node]]));
const getMapIndex = (value: number) => (value * -1) - 2;

export default abstract class ApplicationUI<T extends NodeUI> extends Application<T> implements squared.base.ApplicationUI<T> {
    public readonly session: AppSession<T> = {
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
    public abstract userSettings: UserSettings;

    private readonly _layouts: FileAsset[] = [];
    private readonly _controllerSettings!: ControllerSettings;
    private readonly _excluded!: Set<string>;

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
        const length = children.length;
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
        extensions.forEach(ext => {
            for (const node of ext.subscribers) {
                ext.postOptimize(node);
            }
        });
        const documentRoot: LayoutRoot<T>[] = [];
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
        extensions.forEach(ext => ext.beforeCascade(documentRoot));
        const baseTemplate = this._controllerSettings.layout.baseTemplate;
        const systemName = capitalize(this.systemName);
        documentRoot.forEach(layout => {
            const node = layout.node;
            const renderTemplates = (node.renderParent as T).renderTemplates;
            if (renderTemplates) {
                this.saveDocument(
                    layout.layoutName,
                    baseTemplate + controllerHandler.cascadeDocument(<NodeTemplate<T>[]> renderTemplates, Math.abs(node.depth)),
                    node.dataset['pathname' + systemName],
                    node.renderExtension?.some(item => item.documentBase) ? 0 : undefined
                );
            }
        });
        this.resourceHandler.finalize(layouts);
        controllerHandler.finalize(layouts);
        extensions.forEach(ext => ext.afterFinalize());
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

    public insertNode(element: Element, parent?: T, pseudoElt?: string) {
        if (isTextNode(element)) {
            if (isPlainText(element.textContent as string) || parent?.preserveWhiteSpace && (parent.tagName !== 'PRE' || (<Element> parent.element).childElementCount === 0)) {
                this.controllerHandler.applyDefaultStyles(element);
                const node = this.createNode({ parent, element, append: false });
                if (parent) {
                    node.cssApply(parent.textStyle);
                    node.setCacheValue('fontSize', parent.fontSize);
                }
                return node;
            }
        }
        else if (this.conditionElement(<HTMLElement> element, pseudoElt)) {
            this.controllerHandler.applyDefaultStyles(element);
            return this.createNode({ parent, element, append: false });
        }
        else {
            const node = this.createNode({ parent, element, append: false });
            node.visible = false;
            node.excluded = true;
            return node;
        }
        return undefined;
    }

    public saveDocument(filename: string, content: string, pathname?: string, index?: number) {
        if (isString(content)) {
            const layout: FileAsset = {
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
                    const renderTemplates = safeNestedArray(<StandardMap> parent, 'renderTemplates');
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
            if (parent.naturalElement && (!element || element.parentElement === null)) {
                node.actualParent = parent;
            }
            const child = options.innerWrap;
            if (child && parent.replaceTry({ child, replaceWith: node })) {
                child.parent = node;
                node.innerWrapped = child;
            }
        }
        children?.forEach(item => item.parent = node);
        if (options.append !== false) {
            this.processing.cache.append(node, options.delegate === true, options.cascade === true);
        }
        return node;
    }

    public createCache(documentRoot: HTMLElement) {
        const node = this.createRootNode(documentRoot);
        if (node) {
            const controllerHandler = this.controllerHandler;
            const cache = <NodeList<T>> this._cache;
            const excluded = this.processing.excluded;
            const parent = node.parent as T;
            const preAlignment: ObjectIndex<StringMap> = {};
            const direction = new Set<HTMLElement>();
            const pseudoElements: T[] = [];
            let resetBounds = false;
            if (node.documentBody) {
                parent.naturalChild = true;
                parent.setCacheValue('naturalElement', true);
                parent.visible = false;
                parent.addAlign(NODE_ALIGNMENT.AUTO_LAYOUT);
                parent.exclude({ resource: NODE_RESOURCE.FONT_STYLE | NODE_RESOURCE.VALUE_STRING, procedure: NODE_PROCEDURE.ALL });
                cache.append(parent);
            }
            node.originalRoot = true;
            node.documentParent = parent;
            cache.each(item => {
                if (item.styleElement) {
                    const element = <HTMLElement> item.element;
                    if (item.length) {
                        const textAlign = item.cssInitial('textAlign');
                        switch (textAlign) {
                            case 'center':
                            case 'right':
                            case 'end':
                                saveAlignment(preAlignment, element, item.id, 'text-align', 'left', textAlign);
                                break;
                        }
                    }
                    if (item.positionRelative) {
                        BOX_POSITION.forEach(attr => {
                            if (item.hasPX(attr) && item[attr] !== 0) {
                                saveAlignment(preAlignment, element, item.id, attr, 'auto', item.css(attr));
                                resetBounds = true;
                            }
                        });
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
                if (!item.pseudoElement) {
                    item.setBounds(!resetBounds && preAlignment[item.id] === undefined);
                }
                else {
                    pseudoElements.push(item);
                }
            });
            if (pseudoElements.length) {
                const pseudoMap: { item: T; id: string; parentElement: Element; styleElement?: HTMLStyleElement }[] = [];
                pseudoElements.forEach((item: T) => {
                    const parentElement = <HTMLElement> (item.actualParent as T).element;
                    let id = parentElement.id;
                    let styleElement: Undef<HTMLStyleElement>;
                    if (item.pageFlow) {
                        if (id === '') {
                            id = STRING_PSEUDOPREFIX + Math.round(Math.random() * new Date().getTime());
                            parentElement.id = id;
                        }
                        styleElement = insertStyleSheetRule(`#${id + getPseudoElt(<Element> item.element, item.sessionId)} { display: none !important; }`);
                    }
                    if (item.cssTry('display', item.display)) {
                        pseudoMap.push({ item, id, parentElement, styleElement });
                    }
                });
                pseudoMap.forEach(data => data.item.setBounds(false));
                pseudoMap.forEach(data => {
                    const styleElement = data.styleElement;
                    if (data.id.startsWith(STRING_PSEUDOPREFIX)) {
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
                });
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
            });
            controllerHandler.evaluateNonStatic(node, cache);
            controllerHandler.sortInitialCache();
        }
        return node;
    }

    public afterCreateCache(node: T) {
        const systemName = capitalize(this.systemName);
        const dataset = node.dataset;
        const filename = dataset['filename' + systemName] || dataset.filename;
        const iteration = dataset['iteration' + systemName];
        const prefix = isString(filename) && filename.replace(new RegExp(`\\.${this._controllerSettings.layout.fileExtension}$`), '') || node.elementId || `document_${this.length}`;
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
        return isString(use) && use.split(XML.SEPARATOR).some(value => !!this.extensionManager.retrieve(value));
    }

    public toString() {
        return this.layouts[0]?.content || '';
    }

    protected cascadeParentNode(parentElement: HTMLElement, depth: number, extensions?: ExtensionUI<T>[]) {
        const node = this.insertNode(parentElement);
        if (node && (node.display !== 'none' || depth === 0 || hasOuterParentExtension(node))) {
            node.depth = depth;
            if (depth === 0) {
                this._cache.append(node);
                for (const name of node.extensions) {
                    if ((<ExtensionUI<T>> this.extensionManager.retrieve(name))?.cascadeAll) {
                        this._cascadeAll = true;
                        break;
                    }
                }
            }
            const controllerHandler = this.controllerHandler;
            if (node.excluded && !hasOuterParentExtension(node) || controllerHandler.preventNodeCascade(parentElement)) {
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
            let i = 0, j = 0, k = 0;
            while (i < length) {
                const element = <HTMLElement> childNodes[i++];
                let child: Undef<T>;
                if (element === beforeElement) {
                    child = this.insertNode(beforeElement, undefined, '::before');
                    if (child) {
                        node.innerBefore = child;
                        if (!child.textEmpty) {
                            child.inlineText = true;
                        }
                        inlineText = false;
                    }
                }
                else if (element === afterElement) {
                    child = this.insertNode(afterElement, undefined, '::after');
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
                        prioritizeExtensions(this.getDatasetName('use', element), extensions).some(item => (<any> item.init)(element));
                    }
                    if (!this.rootElements.has(element)) {
                        child = this.cascadeParentNode(element, depth + 1, extensions);
                        if (child?.excluded === false) {
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
            if (k > 0 && this.userSettings.createQuerySelectorMap) {
                node.queryMap = this.createQueryMap(elements, k);
            }
        }
        return node;
    }

    protected cacheNodeChildren(node: T, children: T[], inlineText: boolean) {
        const length = children.length;
        if (length) {
            const cache = this._cache;
            let siblingsLeading: T[] = [], siblingsTrailing: T[] = [];
            if (length > 1) {
                let trailing = children[0];
                let floating = false;
                for (let i = 0, j = 0; i < length; ++i) {
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
                    node.floatContainer = child.floating;
                }
                child.actualParent = node;
            }
        }
        else {
            inlineText = !node.textEmpty;
        }
        node.inlineText = inlineText;
    }

    protected setBaseLayout() {
        const { controllerHandler, processing, session } = this;
        const { extensionMap, clearMap } = session;
        const cache = processing.cache;
        const documentRoot = processing.node as T;
        const mapY = new Map<number, Map<number, T>>();
        let extensions = this.extensionsTraverse;
        {
            let maxDepth = 0;
            setMapDepth(mapY, -1, 0, documentRoot.parent as T);
            cache.each(node => {
                if (node.length) {
                    const depth = node.depth;
                    setMapDepth(mapY, depth, node.id, node);
                    maxDepth = Math.max(depth, maxDepth);
                    if (node.floatContainer) {
                        const floated = new Set<string>();
                        const clearable: ObjectMap<Undef<T>> = {};
                        node.naturalChildren.forEach((item: T) => {
                            if (item.pageFlow) {
                                const floating = item.floating;
                                if (floated.size) {
                                    const clear = item.css('clear');
                                    if (clear !== 'none') {
                                        if (!floating) {
                                            let previousFloat: (T | undefined)[];
                                            switch (clear) {
                                                case 'left':
                                                    previousFloat = [clearable.left];
                                                    break;
                                                case 'right':
                                                    previousFloat = [clearable.right];
                                                    break;
                                                default:
                                                    previousFloat = [clearable.left, clearable.right];
                                                    break;
                                            }
                                            previousFloat.forEach(previous => {
                                                if (previous) {
                                                    const float = previous.float;
                                                    if (floated.has(float) && Math.ceil(item.bounds.top) >= previous.bounds.bottom) {
                                                        floated.delete(float);
                                                        clearable[float] = undefined;
                                                    }
                                                }
                                            });
                                        }
                                        if (floated.has(clear) || clear === 'both') {
                                            clearMap.set(item, floated.size === 2 ? 'both' : clear);
                                            if (!floating) {
                                                item.setBox(BOX_STANDARD.MARGIN_TOP, { reset: 1 });
                                            }
                                            floated.clear();
                                            clearable.left = undefined;
                                            clearable.right = undefined;
                                        }
                                    }
                                }
                                if (floating) {
                                    const float = item.float;
                                    floated.add(float);
                                    clearable[float] = item;
                                }
                            }
                        });
                    }
                }
            });
            let i = 0;
            while (i < maxDepth) {
                mapY.set(getMapIndex(i++), new Map<number, T>());
            }
            cache.afterAppend = (node: T, cascade = false) => {
                setMapDepth(mapY, getMapIndex(node.depth), node.id, node);
                if (cascade && node.length) {
                    node.cascade((item: T) => {
                        if (item.length) {
                            const depth = item.depth;
                            mapY.get(depth)?.delete(item.id);
                            setMapDepth(mapY, getMapIndex(depth), item.id, item);
                        }
                        return false;
                    });
                }
            };
        }
        this.extensions.forEach(ext => ext.beforeBaseLayout());
        for (const depth of mapY.values()) {
            for (const parent of depth.values()) {
                if (parent.length === 0) {
                    continue;
                }
                const floatContainer = parent.floatContainer;
                const renderExtension = <Undef<ExtensionUI<T>[]>> parent.renderExtension;
                const axisY = parent.duplicate() as T[];
                const length = axisY.length;
                for (let i = 0; i < length; ++i) {
                    let nodeY = axisY[i];
                    if (nodeY.rendered || !nodeY.visible) {
                        continue;
                    }
                    let parentY = nodeY.parent as T;
                    if (length > 1 && i < length - 1 && nodeY.pageFlow && (parentY.alignmentType === 0 || parentY.hasAlign(NODE_ALIGNMENT.UNKNOWN) || nodeY.hasAlign(NODE_ALIGNMENT.EXTENDABLE)) && !parentY.hasAlign(NODE_ALIGNMENT.AUTO_LAYOUT) && !nodeY.nodeGroup && nodeY.hasSection(APP_SECTION.DOM_TRAVERSE)) {
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
                            for ( ; l < length; ++l, ++m) {
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
                                        if (item.floating) {
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
                                                if (orientation) {
                                                    if (status < NODE_TRAVERSE.FLOAT_CLEAR && floatActive && !item.siblingsLeading.some((node: T) => node.lineBreak && !clearMap.has(node))) {
                                                         if (!item.floating || previous.floating && item.bounds.top < Math.floor(previous.bounds.bottom)) {
                                                            let floatBottom = -Infinity;
                                                            if (!item.floating) {
                                                                horizontal.forEach(node => {
                                                                    if (node.floating) {
                                                                        floatBottom = Math.max(floatBottom, node.bounds.bottom);
                                                                    }
                                                                });
                                                            }
                                                            if (!item.floating && item.bounds.top < Math.floor(floatBottom) || floatActive) {
                                                                horizontal.push(item);
                                                                if (!item.floating && Math.ceil(item.bounds.bottom) > floatBottom) {
                                                                    break traverse;
                                                                }
                                                                else {
                                                                    continue;
                                                                }
                                                            }
                                                        }
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
                                                if (!checkTraverseVertical(item, horizontal, vertical)) {
                                                    break traverse;
                                                }
                                            }
                                            else if (!checkTraverseHorizontal(item, horizontal, vertical)) {
                                                break traverse;
                                            }
                                        }
                                        else if (item.alignedVertically(orientation ? horizontal : vertical, undefined, orientation) > 0) {
                                            if (!checkTraverseVertical(item, horizontal, vertical)) {
                                                break traverse;
                                            }
                                        }
                                        else if (!checkTraverseHorizontal(item, horizontal, vertical)) {
                                            break traverse;
                                        }
                                    }
                                    else {
                                        break traverse;
                                    }
                                }
                                else if (item.autoPosition) {
                                    const q = vertical.length;
                                    if (q) {
                                        if (vertical[q - 1].blockStatic) {
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
                        let q = horizontal.length;
                        if (q > 1) {
                            layout = controllerHandler.processTraverseHorizontal(new LayoutUI(parentY, nodeY, 0, 0, horizontal), axisY);
                            segEnd = horizontal[q - 1];
                        }
                        else {
                            q = vertical.length;
                            if (q > 1) {
                                layout = controllerHandler.processTraverseVertical(new LayoutUI(parentY, nodeY, 0, 0, vertical), axisY);
                                segEnd = vertical[q - 1];
                                if (isHorizontalAligned(segEnd) && segEnd !== axisY[length - 1]) {
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
                        if (complete && segEnd === axisY[length - 1]) {
                            parentY.removeAlign(NODE_ALIGNMENT.UNKNOWN);
                        }
                    }
                    nodeY.removeAlign(NODE_ALIGNMENT.EXTENDABLE);
                    if (i === length - 1) {
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
                        const descendant = <ExtensionUI<T>[]> extensionMap.get(nodeY.id);
                        let combined = descendant ? (renderExtension ? renderExtension.concat(descendant) : descendant) : renderExtension;
                        let next = false;
                        if (combined) {
                            const q = combined.length;
                            let j = 0;
                            while (j < q) {
                                const ext = combined[j++];
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
                            combined = prioritizeExtensions(nodeY.use, extensions);
                            const q = combined.length;
                            let j = 0;
                            while (j < q) {
                                const ext = combined[j++];
                                if (ext.is(nodeY)) {
                                    if (ext.condition(nodeY, parentY) && (!descendant || !descendant.includes(ext))) {
                                        const result = ext.processNode(nodeY, parentY);
                                        if (result) {
                                            const { output, renderAs, outputAs } = result;
                                            if (output) {
                                                this.addLayoutTemplate(result.outerParent || parentY, nodeY, output);
                                            }
                                            if (renderAs && outputAs) {
                                                this.addLayoutTemplate(result.parentAs || parentY, renderAs, outputAs);
                                            }
                                            parentY = result.parent || parentY;
                                            if (result.include) {
                                                safeNestedArray(<StandardMap> nodeY, 'renderExtension').push(ext);
                                                ext.subscribers.add(nodeY);
                                            }
                                            else if (result.subscribe) {
                                                ext.subscribers.add(nodeY);
                                            }
                                            if (result.remove) {
                                                const index = extensions.indexOf(ext);
                                                if (index !== -1) {
                                                    extensions = extensions.slice(0);
                                                    extensions.splice(index, 1);
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
                            const result: LayoutResult<T> = nodeY.length ? controllerHandler.processUnknownParent(layout) : controllerHandler.processUnknownChild(layout);
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
                const innerA = a.innerWrapped, innerB = b.innerWrapped;
                if (innerA === b) {
                    return -1;
                }
                else if (a === innerB) {
                    return 1;
                }
                const outerA = a.outerWrapper, outerB = b.outerWrapper;
                if (a === outerB || !outerA && outerB) {
                    return -1;
                }
                else if (b === outerA || !outerB && outerA) {
                    return 1;
                }
                const groupA = a.nodeGroup, groupB = b.nodeGroup;
                if (groupA && groupB) {
                    return a.id < b.id ? -1 : 1;
                }
                else if (groupA) {
                    return -1;
                }
                else if (groupB) {
                    return 1;
                }
                return 0;
            }
            return a.depth < b.depth ? -1 : 1;
        });
        this.extensions.forEach(ext => {
            for (const node of ext.subscribers) {
                if (cache.contains(node)) {
                    ext.postBaseLayout(node);
                }
            }
            ext.afterBaseLayout();
        });
        session.cache.join(cache);
        session.excluded.join(processing.excluded);
    }

    protected setConstraints() {
        const cache = this._cache;
        this.controllerHandler.setConstraints();
        this.extensions.forEach(ext => {
            for (const node of ext.subscribers) {
                if (cache.contains(node)) {
                    ext.postConstraints(node);
                }
            }
            ext.afterConstraints();
        });
    }

    protected setResources() {
        const resourceHandler = this.resourceHandler;
        this._cache.each(node => {
            resourceHandler.setBoxStyle(node);
            if (!node.imageElement && !node.svgElement && node.visible) {
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
        const layerIndex: Array<T[] | T[][]> = [];
        const inlineAbove: T[] = [], inlineBelow: T[] = [];
        const leftAbove: T[] = [], rightAbove: T[] = [];
        let leftBelow: Undef<T[]>, rightBelow: Undef<T[]>;
        let leftSub: Undef<T[] | T[][]>, rightSub: Undef<T[] | T[][]>;
        let clearedFloat = false;
        layout.each((node, index) => {
            if (index > 0) {
                const value = clearMap.get(node);
                if (value) {
                    clearedFloat = true;
                }
            }
            const float = node.float;
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
                    if (leftAbove.some(item => top >= item.bounds.bottom) || rightAbove.some(item => top >= item.bounds.bottom)) {
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
            else {
                inlineBelow.push(node);
            }
        });
        if (leftAbove.length) {
            leftSub = leftBelow ? [leftAbove, leftBelow] : leftAbove;
        }
        if (rightAbove.length) {
            rightSub = rightBelow ? [rightAbove, rightBelow] : rightAbove;
        }
        if (rightAbove.length + (rightBelow?.length || 0) === layout.length) {
            layout.add(NODE_ALIGNMENT.RIGHT);
        }
        if (inlineBelow.length) {
            const { node, parent } = layout;
            if (inlineBelow.length > 1) {
                inlineBelow[0].addAlign(NODE_ALIGNMENT.EXTENDABLE);
            }
            inlineBelow.unshift(node);
            const wrapper = controllerHandler.createNodeGroup(node, inlineBelow, { parent });
            wrapper.childIndex = node.childIndex;
            wrapper.containerName = node.containerName;
            wrapper.inherit(node, 'boxStyle');
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
        layerIndex.forEach(item => {
            let segments: T[][];
            let floatgroup: Undef<T>;
            if (Array.isArray(item[0])) {
                segments = item as T[][];
                const itemCount = segments.length;
                let grouping: T[] = segments[0];
                let i = 1;
                while (i < itemCount) {
                    grouping = grouping.concat(segments[i++]);
                }
                grouping.sort((a: T, b: T) => a.childIndex < b.childIndex ? -1 : 1);
                const node = layout.node;
                if (node.layoutVertical) {
                    floatgroup = node;
                }
                else {
                    floatgroup = controllerHandler.createNodeGroup(grouping[0], grouping, { parent: node });
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
            segments.forEach(seg => {
                const first = seg[0];
                const node = floatgroup || layout.node;
                const target = controllerHandler.createNodeGroup(first, seg, { parent: node, delegate: true });
                const group = new LayoutUI(node, target, 0, NODE_ALIGNMENT.SEGMENTED);
                if (seg === inlineAbove) {
                    group.add(NODE_ALIGNMENT.COLUMN);
                }
                else {
                    group.add(getFloatAlignmentType(seg));
                }
                if (seg.some(child => child.percentWidth > 0)) {
                    group.type = controllerHandler.containerTypePercent;
                    if (seg.length === 1) {
                        group.node.innerWrapped = first;
                    }
                }
                else if (seg.length === 1) {
                    group.setContainerType(containerType, alignmentType);
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
            });
        });
        return layout;
    }

    protected processFloatVertical(layout: LayoutUI<T>) {
        const controllerHandler = this.controllerHandler;
        const { containerType, alignmentType } = controllerHandler.containerTypeVertical;
        const clearMap = this.session.clearMap;
        if (layout.containerType !== 0) {
            const node = layout.node;
            const parent = controllerHandler.createNodeGroup(node, [node], { parent: layout.parent });
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
            const node = layout.node;
            const length = Math.max(floatedRows.length, staticRows.length);
            for (let i = 0; i < length; ++i) {
                const pageFlow = staticRows[i] || [];
                if (floatedRows[i] === null && pageFlow.length) {
                    const layoutType = controllerHandler.containerTypeVertical;
                    this.addLayout(new LayoutUI(
                        node,
                        controllerHandler.createNodeGroup(pageFlow[0], pageFlow, { parent: node }),
                        layoutType.containerType,
                        layoutType.alignmentType | NODE_ALIGNMENT.SEGMENTED | NODE_ALIGNMENT.BLOCK,
                        pageFlow
                    ));
                }
                else {
                    const floating = floatedRows[i] || [];
                    if (pageFlow.length || floating.length) {
                        const basegroup = controllerHandler.createNodeGroup(floating[0] || pageFlow[0], [], { parent: node });
                        const group = new LayoutUI(node, basegroup);
                        group.type = controllerHandler.containerTypeVerticalMargin;
                        const children: T[] = [];
                        let subgroup!: T;
                        if (floating.length) {
                            const floatgroup = controllerHandler.createNodeGroup(floating[0], floating, { parent: basegroup });
                            group.add(NODE_ALIGNMENT.FLOAT);
                            if (pageFlow.length === 0 && floating.every(item => item.float === 'right')) {
                                group.add(NODE_ALIGNMENT.RIGHT);
                            }
                            children.push(floatgroup);
                        }
                        if (pageFlow.length) {
                            subgroup = controllerHandler.createNodeGroup(pageFlow[0], pageFlow, { parent: basegroup });
                            children.push(subgroup);
                        }
                        group.itemCount = children.length;
                        this.addLayout(group);
                        children.forEach(item => {
                            if (!item.nodeGroup) {
                                item = controllerHandler.createNodeGroup(item, [item], { parent: basegroup, delegate: true });
                            }
                            this.addLayout(new LayoutUI(
                                basegroup,
                                item,
                                containerType,
                                alignmentType | NODE_ALIGNMENT.SEGMENTED | NODE_ALIGNMENT.BLOCK,
                                item.children as T[]
                            ));
                        });
                        if (pageFlow.length && floating.length) {
                            const [leftAbove, rightAbove] = partitionArray(floating, item => item.float !== 'right');
                            this.setFloatPadding(node, subgroup, pageFlow, leftAbove, rightAbove);
                        }
                    }
                }
            }
        }
        return layout;
    }

    protected createPseduoElement(element: HTMLElement, pseudoElt: string, sessionId: string) {
        let styleMap: StringMap = getElementCache(element, `styleMap${pseudoElt}`, sessionId);
        let nested = 0;
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
            if (content.endsWith('-quote')) {
                let parent = element.parentElement;
                while (parent?.tagName === 'Q') {
                    ++nested;
                    parent = parent.parentElement;
                }
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
                if (textContent.trim() === '') {
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
                            const child = <Element> childNodes[i++];
                            if (isTextNode(child)) {
                                if ((child.textContent as string).trim() !== '') {
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
                        switch (styleMap.display) {
                            case undefined:
                            case 'block':
                            case 'inline':
                            case 'inherit':
                            case 'initial':
                                if (!checkPseudoDimension(styleMap, false, absolute)) {
                                    return undefined;
                                }
                                break;
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
                TEXT_STYLE.forEach(attr => {
                    if (!isString(styleMap[attr])) {
                        styleMap[attr] = style[attr];
                    }
                });
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
                            content = nested % 2 === 0 ? '“' : "‘";
                        }
                        break;
                    case 'close-quote':
                        if (pseudoElt === '::after') {
                            content = nested % 2 === 0 ? '”' : "’";
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
                            REGEX_COUNTER.lastIndex = 0;
                            let found = false;
                            let match: Null<RegExpExecArray>;
                            while ((match = REGEX_COUNTER.exec(value)) !== null) {
                                const attr = match[1];
                                if (attr) {
                                    content += getNamedItem(element, attr.trim());
                                }
                                else if (match[2] || match[5]) {
                                    const counterType = match[2] === 'counter';
                                    const [counterName, styleName] = counterType ? [match[3], match[4] || 'decimal'] : [match[6], match[8] || 'decimal'];
                                    const initialValue = (getCounterIncrementValue(element, counterName, pseudoElt, sessionId, 0) || 0) + (getCounterValue(style.getPropertyValue('counter-reset'), counterName, 0) || 0);
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
                                            current = <Null<HTMLElement>> current.previousElementSibling;
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
                                            subcounter.forEach(leading => content += convertListStyle(styleName, leading, true) + textValue);
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
                    const pseudoElement = createPseudoElement(element, tagName, pseudoElt === '::before' ? 0 : -1);
                    if (tagName === 'img') {
                        (<HTMLImageElement> pseudoElement).src = content;
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

    protected setFloatPadding(parent: T, target: T, inlineAbove: T[], leftAbove: T[], rightAbove: T[]) {
        let paddingNodes: T[] = [];
        inlineAbove.forEach(child => {
            if (requirePadding(child) || child.centerAligned) {
                paddingNodes.push(child);
            }
            if (child.blockStatic) {
                paddingNodes = paddingNodes.concat(child.cascade((item: T) => requirePadding(item)) as T[]);
            }
        });
        const bottom = target.bounds.bottom;
        const boxWidth = parent.actualBoxWidth();
        if (leftAbove.length) {
            let floatPosition = -Infinity;
            let spacing = false;
            leftAbove.forEach(child => {
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
            });
            if (floatPosition !== -Infinity) {
                let marginLeft = -Infinity;
                paddingNodes.forEach(child => {
                    if (Math.floor(child.linear.left) <= floatPosition || child.centerAligned) {
                        marginLeft = Math.max(marginLeft, child.marginLeft);
                    }
                });
                if (marginLeft !== -Infinity) {
                    const offset = floatPosition - parent.box.left - marginLeft - maxArray(target.map((child: T) => !paddingNodes.includes(child) ? child.marginLeft : 0));
                    if (offset > 0 && offset < boxWidth) {
                        target.modifyBox(BOX_STANDARD.PADDING_LEFT, offset + (!spacing && target.find(child => child.multiline, { cascade: true }) ? Math.max(marginLeft, this._controllerSettings.deviations.textMarginBoundarySize) : 0));
                    }
                }
            }
        }
        if (rightAbove.length) {
            let floatPosition = Infinity;
            let spacing = false;
            rightAbove.forEach(child => {
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
            });
            if (floatPosition !== Infinity) {
                let marginRight = -Infinity;
                paddingNodes.forEach(child => {
                    if (child.multiline || Math.ceil(child.linear.right) >= floatPosition) {
                        marginRight = Math.max(marginRight, child.marginRight);
                    }
                });
                if (marginRight !== -Infinity) {
                    const offset = parent.box.right - floatPosition - marginRight - maxArray(target.map((child: T) => !paddingNodes.includes(child) ? child.marginRight : 0));
                    if (offset > 0 && offset < boxWidth) {
                        target.modifyBox(BOX_STANDARD.PADDING_RIGHT, offset + (!spacing && target.find(child => child.multiline, { cascade: true }) ? Math.max(marginRight, this._controllerSettings.deviations.textMarginBoundarySize) : 0));
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