import { AppSessionUI, FileAsset, NodeTemplate, UserUISettings } from './@types/application';

import Application from './application';
import NodeList from './nodelist';
import ControllerUI from './controller-ui';
import ExtensionUI from './extension-ui';
import LayoutUI from './layout-ui';
import NodeUI from './node-ui';
import ResourceUI from './resource-ui';

import { APP_SECTION, BOX_STANDARD, NODE_ALIGNMENT, NODE_PROCEDURE, NODE_RESOURCE, NODE_TRAVERSE } from './lib/enumeration';

const $const = squared.lib.constant;
const $css = squared.lib.css;
const $dom = squared.lib.dom;
const $regex = squared.lib.regex;
const $session = squared.lib.session;
const $util = squared.lib.util;

let NodeConstructor!: Constructor<NodeUI>;

export default abstract class ApplicationUI<T extends NodeUI> extends Application<T> implements squared.base.ApplicationUI<T> {
    public controllerHandler!: ControllerUI<T>;
    public resourceHandler!: ResourceUI<T>;
    public userSettings!: UserUISettings;
    public readonly builtInExtensions: ObjectMap<ExtensionUI<T>> = {};
    public readonly extensions: ExtensionUI<T>[] = [];
    public readonly session: AppSessionUI<T> = {
        cache: new NodeList<T>(),
        excluded: new NodeList<T>(),
        active: [],
        extensionMap: new Map<number, ExtensionUI<T>[]>(),
        documentRoot: [],
        targetQueue: new Map<T, NodeTemplate<T>>()
    };

    private readonly _layouts: FileAsset[] = [];

    constructor(
        framework: number,
        nodeConstructor: Constructor<T>,
        ControllerConstructor: Constructor<T>,
        ResourceConstructor: Constructor<T>,
        ExtensionManagerConstructor: Constructor<T>)
    {
        super(framework, nodeConstructor, ControllerConstructor, ResourceConstructor, ExtensionManagerConstructor);
        NodeConstructor = nodeConstructor;
    }

    public finalize() {
        const controller = this.controllerHandler;
        for (const [node, template] of this.session.targetQueue.entries()) {
            if (node.dataset.target) {
                const parent = this.resolveTarget(node.dataset.target);
                if (parent) {
                    node.render(parent);
                    this.addLayoutTemplate(parent, node, template);
                }
                else if (node.renderParent === undefined) {
                    this.session.cache.remove(node);
                }
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
        controller.optimize(rendered);
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
            for (const node of ext.subscribers) {
                ext.postBoxSpacing(node);
            }
            ext.beforeCascade();
        }
        for (const layout of this.session.documentRoot) {
            const node = layout.node;
            if (node.documentRoot && node.renderChildren.length === 0 && !node.inlineText && node.actualChildren.every(item => item.documentRoot)) {
                continue;
            }
            const parent = node.renderParent;
            if (parent && parent.renderTemplates) {
                this.saveDocument(
                    layout.layoutName,
                    controller.localSettings.layout.baseTemplate + controller.cascadeDocument(<NodeTemplate<T>[]> parent.renderTemplates, 0),
                    node.dataset.pathname,
                    !!node.renderExtension && node.renderExtension.some(item => item.documentBase) ? 0 : undefined
                );
            }
        }
        this.resourceHandler.finalize(this._layouts);
        controller.finalize(this._layouts);
        for (const ext of this.extensions) {
            ext.afterFinalize();
        }
        $dom.removeElementsByClassName('__squared.placeholder');
        $dom.removeElementsByClassName('__squared.pseudo');
        this.closed = true;
    }

    public saveAllToDisk() {
        if (this.resourceHandler.fileHandler) {
            this.resourceHandler.fileHandler.saveAllToDisk(this.layouts);
        }
    }

    public reset() {
        for (const id of this.session.active) {
            this.session.cache.each(node => {
                if (node.naturalElement && !node.pseudoElement) {
                    const element = <Element> node.element;
                    $session.deleteElementCache(element, 'node', id);
                    $session.deleteElementCache(element, 'styleMap', id);
                }
            });
        }
        for (const element of this.rootElements) {
            element.dataset.iteration = '';
        }
        this.session.documentRoot.length = 0;
        this.session.active.length = 0;
        this.session.targetQueue.clear();
        this.session.cache.reset();
        this.session.excluded.reset();
        this.session.extensionMap.clear();
        this.processing.cache.reset();
        this.controllerHandler.reset();
        this.resourceHandler.reset();
        this._layouts.length = 0;
        for (const ext of this.extensions) {
            ext.subscribers.clear();
        }
        this.closed = false;
    }

    public conditionElement(element: HTMLElement) {
        if (super.conditionElement(element)) {
            if (this.controllerHandler.visibleElement(element) || element.dataset.use && element.dataset.use.split($regex.XML.SEPARATOR).some(value => !!this.extensionManager.retrieve(value.trim()))) {
                return true;
            }
            else {
                let current = element.parentElement;
                let valid = true;
                while (current) {
                    if ($css.getStyle(current).display === $const.CSS.NONE) {
                        valid = false;
                        break;
                    }
                    current = current.parentElement;
                }
                if (valid) {
                    const children = element.children;
                    const length = children.length;
                    for (let i = 0; i < length; i++) {
                        if (this.controllerHandler.visibleElement(<Element> children[i])) {
                            return true;
                        }
                    }
                }
                return false;
            }
        }
        return false;
    }

    public saveDocument(filename: string, content: string, pathname?: string, index?: number) {
        if ($util.isString(content)) {
            const layout: FileAsset = {
                pathname: pathname ? $util.trimString(pathname, '/') : this.controllerHandler.localSettings.layout.pathName,
                filename,
                content,
                index
            };
            if (index !== undefined && index >= 0 && index < this._layouts.length) {
                this._layouts.splice(index, 0, layout);
            }
            else {
                this._layouts.push(layout);
            }
        }
    }

    public renderNode(layout: LayoutUI<T>) {
        return layout.itemCount === 0 ? this.controllerHandler.renderNode(layout) : this.controllerHandler.renderNodeGroup(layout);
    }

    public addLayout(layout: LayoutUI<T>) {
        if ($util.hasBit(layout.renderType, NODE_ALIGNMENT.FLOAT)) {
            if ($util.hasBit(layout.renderType, NODE_ALIGNMENT.HORIZONTAL)) {
                layout = this.processFloatHorizontal(layout);
            }
            else if ($util.hasBit(layout.renderType, NODE_ALIGNMENT.VERTICAL)) {
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
                    if (parent.renderTemplates === undefined) {
                        parent.renderTemplates = [];
                    }
                    if (index >= 0 && index < parent.renderChildren.length) {
                        parent.renderChildren.splice(index, 0, node);
                        parent.renderTemplates.splice(index, 0, template);
                    }
                    else {
                        parent.renderChildren.push(node);
                        parent.renderTemplates.push(template);
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

    public createNode(element: Element, append = true, parent?: T, children?: T[]) {
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

    public resolveTarget(target: string) {
        for (const parent of this.processing.cache as NodeList<T>) {
            if (parent.elementId === target || parent.controlId === target) {
                return parent;
            }
        }
        for (const parent of this.session.cache) {
            if (parent.elementId === target || parent.controlId === target) {
                return parent;
            }
        }
        return undefined;
    }

    public toString() {
        return this._layouts.length ? this._layouts[0].content : '';
    }

    public afterCreateCache(element: HTMLElement) {
        const iteration = (element.dataset.iteration ? $util.convertInt(element.dataset.iteration) : -1) + 1;
        element.dataset.iteration = iteration.toString();
        const filename = element.dataset.filename && element.dataset.filename.replace(new RegExp(`\.${this.controllerHandler.localSettings.layout.fileExtension}$`), '') || element.id || `document_${this.length}`;
        element.dataset.layoutName = $util.convertWord(iteration > 1 ? `${filename}_${iteration}` : filename, true);
        this.setBaseLayout(element.dataset.layoutName);
        this.setConstraints();
        this.setResources();
    }

    protected cacheNodeChildren(node: T, children: T[], includeText: boolean) {
        const length = children.length;
        if (length) {
            let siblingsLeading: T[] = [];
            let siblingsTrailing: T[] = [];
            if (length > 1) {
                let trailing = children[0];
                let floating = false;
                let input = false;
                for (let i = 0; i < length; i++) {
                    const child = children[i];
                    if (child.excluded) {
                        this.processing.excluded.append(child);
                    }
                    else if (includeText || !child.plainText) {
                        child.parent = node;
                        this.processing.cache.append(child);
                    }
                    if (child.pageFlow) {
                        if (child.floating) {
                            floating = true;
                        }
                        if (child.inputElement) {
                            input = true;
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
                    child.siblingIndex = i;
                    child.actualParent = node;
                }
                trailing.siblingsTrailing = siblingsTrailing;
                node.floatContainer = floating;
                node.inputContainer = input;
            }
            else {
                const child = children[0];
                if (child.excluded) {
                    this.processing.excluded.append(child);
                }
                else {
                    child.siblingsLeading = siblingsLeading;
                    child.siblingsTrailing = siblingsTrailing;
                    if (includeText || !child.plainText) {
                        child.parent = node;
                        this.processing.cache.append(child);
                    }
                }
                child.actualParent = node;
                node.inputContainer = child.inputElement;
            }
        }
    }

    protected partitionNodeChildren(element: HTMLElement, depth: number) {
        Application.prioritizeExtensions(element, this.extensions).some(item => item.init(element));
        if (!this.rootElements.has(element)) {
            return this.cascadeParentNode(element, depth + 1);
        }
        else {
            const child = this.insertNode(element);
            if (child) {
                child.documentRoot = true;
                child.visible = false;
                child.excluded = true;
            }
            return child;
        }
    }

    protected setBaseLayout(layoutName: string) {
        const CACHE = this.processing.cache;
        const documentRoot = this.processing.node as T;
        const extensions = $util.filterArray(this.extensions, item => !item.eventOnly);
        const mapY = new Map<number, Map<number, T>>();
        function setMapY(depth: number, id: number, node: T) {
            const index = mapY.get(depth) || new Map<number, T>();
            mapY.set(depth, index.set(id, node));
        }
        function deleteMapY(id: number) {
            for (const mapNode of mapY.values()) {
                for (const node of mapNode.values()) {
                    if (node.id === id) {
                        mapNode.delete(node.id);
                        return;
                    }
                }
            }
        }
        setMapY(-1, 0, documentRoot.parent as T);
        let maxDepth = 0;
        for (const node of CACHE) {
            if (node.visible) {
                setMapY(node.depth, node.id, node);
                maxDepth = Math.max(node.depth, maxDepth);
            }
        }
        for (let i = 0; i < maxDepth; i++) {
            mapY.set((i * -1) - 2, new Map<number, T>());
        }
        CACHE.afterAppend = (node: T) => {
            deleteMapY(node.id);
            setMapY((node.depth * -1) - 2, node.id, node);
            for (const item of node.cascade()) {
                deleteMapY(item.id);
                setMapY((item.depth * -1) - 2, item.id, item as T);
            }
        };
        for (const depth of mapY.values()) {
            for (const parent of depth.values()) {
                if (parent.length === 0) {
                    continue;
                }
                const axisY = parent.duplicate() as T[];
                const hasFloat = parent.floatContainer;
                const length = axisY.length;
                let cleared!: Map<T, string>;
                if (hasFloat) {
                    cleared = <Map<T, string>> NodeUI.linearData(parent.actualChildren as T[], true).cleared;
                }
                for (let k = 0; k < length; k++) {
                    let nodeY = axisY[k];
                    if (nodeY.rendered || !nodeY.visible || nodeY.naturalElement && !nodeY.documentRoot && this.rootElements.has(<HTMLElement> nodeY.element)) {
                        continue;
                    }
                    let parentY = nodeY.parent as T;
                    if (length > 1 && k < length - 1 && nodeY.pageFlow && (parentY.alignmentType === 0 || parentY.hasAlign(NODE_ALIGNMENT.UNKNOWN) || nodeY.hasAlign(NODE_ALIGNMENT.EXTENDABLE)) && !parentY.hasAlign(NODE_ALIGNMENT.AUTO_LAYOUT) && nodeY.hasSection(APP_SECTION.DOM_TRAVERSE)) {
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
                            if (hasFloat) {
                                floatActive = new Set<string>();
                                floatCleared = new Map<T, string>();
                            }
                            for ( ; l < length; l++, m++) {
                                const item = axisY[l];
                                if (item.pageFlow) {
                                    if (hasFloat) {
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
                                        if (hasFloat) {
                                            const status = item.alignedVertically(horizontal.length ? horizontal : vertical, floatCleared, horizontal.length > 0);
                                            if (status > 0) {
                                                if (horizontal.length) {
                                                    if (status !== NODE_TRAVERSE.FLOAT_INTERSECT && status !== NODE_TRAVERSE.FLOAT_BLOCK && floatActive.size && floatCleared.get(item) !== 'both' && !item.siblingsLeading.some((node: T) => node.lineBreak && !cleared.has(node))) {
                                                         if (!item.floating || previous.floating && !$util.aboveRange(item.linear.top, previous.linear.bottom)) {
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
                                                                    $util.captureMap(
                                                                        horizontal,
                                                                        node => node.floating,
                                                                        node => floatBottom = Math.max(floatBottom, node.linear.bottom)
                                                                    );
                                                                }
                                                                if (!item.floating && !$util.aboveRange(item.linear.top, floatBottom) || item.floating && floatActive.has(item.float)) {
                                                                    horizontal.push(item);
                                                                    if (!item.floating && $util.aboveRange(item.linear.bottom, floatBottom)) {
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
                                    if (vertical.length) {
                                        if (vertical[vertical.length - 1].blockStatic) {
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
                        const descendant = <ExtensionUI<T>[]> this.session.extensionMap.get(nodeY.id);
                        let combined = parent.renderExtension && <ExtensionUI<T>[]> parent.renderExtension.slice(0);
                        if (descendant) {
                            if (combined) {
                                combined = combined.concat(descendant);
                            }
                            else {
                                combined = descendant.slice(0);
                            }
                        }
                        if (combined) {
                            let next = false;
                            for (const ext of combined) {
                                const result = ext.processChild(nodeY, parentY);
                                if (result) {
                                    if (result.output) {
                                        this.addLayoutTemplate(result.parentAs || parentY, nodeY, result.output);
                                    }
                                    if (result.renderAs && result.outputAs) {
                                        this.addLayoutTemplate(parentY, result.renderAs, result.outputAs);
                                    }
                                    if (result.parent) {
                                        parentY = result.parent;
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
                            let next = false;
                            Application.prioritizeExtensions(<HTMLElement> nodeY.element, extensions).some((item: ExtensionUI<T>) => {
                                if (item.is(nodeY) && item.condition(nodeY, parentY) && (descendant === undefined || !descendant.includes(item))) {
                                    const result = item.processNode(nodeY, parentY);
                                    if (result) {
                                        if (result.output) {
                                            this.addLayoutTemplate(result.parentAs || parentY, nodeY, result.output);
                                        }
                                        if (result.renderAs && result.outputAs) {
                                            this.addLayoutTemplate(parentY, result.renderAs, result.outputAs);
                                        }
                                        if (result.parent) {
                                            parentY = result.parent as T;
                                        }
                                        if (result.output && result.include !== false || result.include === true) {
                                            if (nodeY.renderExtension === undefined) {
                                                nodeY.renderExtension = [];
                                            }
                                            nodeY.renderExtension.push(item);
                                            item.subscribers.add(nodeY);
                                        }
                                        next = result.next === true;
                                        if (result.complete || next) {
                                            return true;
                                        }
                                    }
                                }
                                return false;
                            });
                            if (next) {
                                continue;
                            }
                        }
                    }
                    if (!nodeY.rendered && nodeY.hasSection(APP_SECTION.RENDER)) {
                        let layout = this.createLayoutControl(parentY, nodeY);
                        if (layout.containerType === 0) {
                            const result = nodeY.length ? this.controllerHandler.processUnknownParent(layout) : this.controllerHandler.processUnknownChild(layout);
                            if (result.next === true) {
                                continue;
                            }
                            layout = result.layout;
                        }
                        this.addLayout(layout);
                    }
                }
            }
        }
        for (const node of CACHE) {
            if (node.documentRoot && node.rendered) {
                this.session.documentRoot.push({ node, layoutName: node === documentRoot ? layoutName : '' });
            }
        }
        CACHE.sort((a, b) => {
            if (a.depth === b.depth) {
                if (a.groupParent && (b.length === 0 || b.naturalElement)) {
                    return -1;
                }
                else if (b.groupParent && (a.length === 0 || a.naturalElement)) {
                    return 1;
                }
                return 0;
            }
            return a.depth < b.depth ? -1 : 1;
        });
        this.session.cache.concat(CACHE.children);
        this.session.excluded.concat(this.processing.excluded.children);
        for (const ext of this.extensions) {
            for (const node of ext.subscribers) {
                ext.postBaseLayout(node);
            }
            ext.afterBaseLayout();
        }
    }

    protected setConstraints() {
        this.controllerHandler.setConstraints();
        for (const ext of this.extensions) {
            for (const node of ext.subscribers) {
                ext.postConstraints(node);
            }
            ext.afterConstraints();
        }
    }

    protected setResources() {
        for (const node of this.processing.cache) {
            this.resourceHandler.setBoxStyle(node);
            this.resourceHandler.setFontStyle(node);
            this.resourceHandler.setValueString(node);
        }
        for (const ext of this.extensions) {
            ext.afterResources();
        }
    }

    protected processFloatHorizontal(layout: LayoutUI<T>) {
        const controller = this.controllerHandler;
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
                const cleared = layout.cleared.get(node);
                if (cleared) {
                    switch (cleared) {
                        case $const.CSS.LEFT:
                            if (!$util.hasBit(clearedFloat, 2)) {
                                clearedFloat |= 2;
                            }
                            break;
                        case $const.CSS.RIGHT:
                            if (!$util.hasBit(clearedFloat, 4)) {
                                clearedFloat |= 4;
                            }
                            break;
                        default:
                            clearedFloat = 6;
                            break;
                    }
                }
            }
            if (clearedFloat === 0) {
                if (node.float === $const.CSS.RIGHT) {
                    rightAbove.push(node);
                }
                else if (node.float === $const.CSS.LEFT) {
                    leftAbove.push(node);
                }
                else if (leftAbove.length || rightAbove.length) {
                    let top = node.linear.top;
                    if (node.textElement && !node.plainText) {
                        const rect = $session.getRangeClientRect(<Element> node.element, node.sessionId);
                        if (rect.top > top) {
                            top = rect.top;
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
            else if (node.float === $const.CSS.RIGHT) {
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
            else if (node.float === $const.CSS.LEFT) {
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
        if (leftAbove.length && leftBelow) {
            leftSub = [leftAbove, leftBelow];
        }
        else if (leftAbove.length) {
            leftSub = leftAbove;
        }
        if (rightAbove.length && rightBelow) {
            rightSub = [rightAbove, rightBelow];
        }
        else if (rightAbove.length) {
            rightSub = rightAbove;
        }
        const { containerType, alignmentType } = controller.containerTypeVertical;
        const verticalMargin = controller.containerTypeVerticalMargin;
        if (rightAbove.length + (rightBelow ? rightBelow.length : 0) === layout.length) {
            layout.add(NODE_ALIGNMENT.RIGHT);
        }
        if (inlineBelow.length) {
            if (inlineBelow.length > 1) {
                inlineBelow[0].addAlign(NODE_ALIGNMENT.EXTENDABLE);
            }
            inlineBelow.unshift(layout.node);
            const parent = this.createNode($dom.createElement(layout.node.actualParent && layout.node.actualParent.element), true, layout.parent, inlineBelow);
            this.addLayout(new LayoutUI(
                layout.parent,
                parent,
                containerType,
                alignmentType | (layout.parent.blockStatic ? NODE_ALIGNMENT.BLOCK : 0),
                inlineBelow
            ));
            layout.parent = parent;
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
        layout.setType(verticalMargin.containerType, verticalMargin.alignmentType);
        layout.itemCount = layerIndex.length;
        layout.add(NODE_ALIGNMENT.BLOCK);
        for (const item of layerIndex) {
            let segments: T[][];
            let floatgroup: T | undefined;
            if (Array.isArray(item[0])) {
                segments = item as T[][];
                let grouping: T[] = segments[0];
                for (let i = 1; i < segments.length; i++) {
                    grouping = grouping.concat(segments[i]);
                }
                grouping.sort(NodeUI.siblingIndex);
                if (layout.node.layoutVertical) {
                    floatgroup = layout.node;
                }
                else {
                    floatgroup = controller.createNodeGroup(grouping[0], grouping, layout.node);
                    const group = new LayoutUI(
                        layout.node,
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
                const target = controller.createNodeGroup(seg[0], seg, node, true);
                const group = new LayoutUI(
                    node,
                    target,
                    0,
                    NODE_ALIGNMENT.SEGMENTED | (seg === inlineAbove ? NODE_ALIGNMENT.COLUMN : 0),
                    seg
                );
                if (seg.length === 1) {
                    group.node.innerWrapped = seg[0];
                    seg[0].outerWrapper = group.node;
                    if (seg[0].percentWidth) {
                        const percent = controller.containerTypePercent;
                        group.setType(percent.containerType, percent.alignmentType);
                    }
                    else {
                        group.setType(containerType, alignmentType);
                    }
                }
                else if (group.linearY || group.unknownAligned) {
                    group.setType(containerType, alignmentType | (group.unknownAligned ? NODE_ALIGNMENT.UNKNOWN : 0));
                }
                else {
                    controller.processLayoutHorizontal(group);
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
        const controller = this.controllerHandler;
        const { containerType, alignmentType } = controller.containerTypeVertical;
        if (layout.containerType !== 0) {
            const parent = controller.createNodeGroup(layout.node, [layout.node], layout.parent);
            this.addLayout(new LayoutUI(
                parent,
                layout.node,
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
            for (let i = 0; i < Math.max(floatedRows.length, staticRows.length); i++) {
                const pageFlow = staticRows[i] || [];
                if (floatedRows[i] === null && pageFlow.length) {
                    const layoutType = controller.containerTypeVertical;
                    layoutType.alignmentType |= NODE_ALIGNMENT.SEGMENTED | NODE_ALIGNMENT.BLOCK;
                    this.addLayout(new LayoutUI(
                        layout.node,
                        controller.createNodeGroup(pageFlow[0], pageFlow, layout.node),
                        layoutType.containerType,
                        layoutType.alignmentType,
                        pageFlow
                    ));
                }
                else {
                    const floating = floatedRows[i] || [];
                    if (pageFlow.length || floating.length) {
                        const verticalMargin = controller.containerTypeVerticalMargin;
                        const basegroup = controller.createNodeGroup(floating[0] || pageFlow[0], [], layout.node);
                        const layoutGroup = new LayoutUI(
                            layout.node,
                            basegroup,
                            verticalMargin.containerType,
                            verticalMargin.alignmentType
                        );
                        const children: T[] = [];
                        let subgroup: T | undefined;
                        if (floating.length) {
                            const floatgroup = controller.createNodeGroup(floating[0], floating, basegroup);
                            layoutGroup.add(NODE_ALIGNMENT.FLOAT);
                            if (pageFlow.length === 0 && floating.every(item => item.float === $const.CSS.RIGHT)) {
                                layoutGroup.add(NODE_ALIGNMENT.RIGHT);
                            }
                            children.push(floatgroup);
                        }
                        if (pageFlow.length) {
                            subgroup = controller.createNodeGroup(pageFlow[0], pageFlow, basegroup);
                            children.push(subgroup);
                        }
                        basegroup.init();
                        layoutGroup.itemCount = children.length;
                        this.addLayout(layoutGroup);
                        for (let node of children) {
                            if (!node.groupParent) {
                                node = controller.createNodeGroup(node, [node], basegroup, true);
                            }
                            this.addLayout(new LayoutUI(
                                basegroup,
                                node,
                                containerType,
                                alignmentType | NODE_ALIGNMENT.SEGMENTED | NODE_ALIGNMENT.BLOCK,
                                node.children as T[]
                            ));
                        }
                        if (pageFlow.length && floating.length) {
                            const [leftAbove, rightAbove] = $util.partitionArray(floating, item => item.float !== 'right');
                            this.setFloatPadding(layout.node, subgroup as T, pageFlow, leftAbove, rightAbove);
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
                let invalid = 0;
                let hasSpacing = false;
                for (const child of leftAbove) {
                    const right = child.linear.right + (child.marginLeft < 0 ? child.marginLeft : 0);
                    if (right > floatPosition) {
                        floatPosition = right;
                        hasSpacing = child.marginRight > 0;
                    }
                }
                for (const child of inlineAbove) {
                    if (child.blockStatic && child.bounds.left > floatPosition) {
                        invalid++;
                    }
                }
                if (invalid < inlineAbove.length) {
                    const offset = floatPosition - parent.box.left;
                    if (offset > 0) {
                        target.modifyBox(BOX_STANDARD.PADDING_LEFT, offset + (!hasSpacing && target.cascadeSome(child => child.multiline) ? this.controllerHandler.localSettings.deviations.textMarginBoundarySize : 0));
                    }
                }
            }
            if (rightAbove.length) {
                let floatPosition = Number.POSITIVE_INFINITY;
                let invalid = 0;
                let hasSpacing = false;
                for (const child of rightAbove) {
                    const left = child.linear.left + (child.marginRight < 0 ? child.marginRight : 0);
                    if (left < floatPosition) {
                        floatPosition = left;
                        hasSpacing = child.marginLeft > 0;
                    }
                }
                for (const child of inlineAbove) {
                    if (child.blockStatic && child.bounds.right < floatPosition) {
                        invalid++;
                    }
                }
                if (invalid < inlineAbove.length) {
                    const offset = parent.box.right - floatPosition;
                    if (offset > 0) {
                        target.modifyBox(BOX_STANDARD.PADDING_RIGHT, offset + (!hasSpacing && target.cascadeSome(child => child.multiline) ? this.controllerHandler.localSettings.deviations.textMarginBoundarySize : 0));
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
            if (a.index !== b.index) {
                if (a.index === 0 || a.index !== undefined && a.index !== Number.POSITIVE_INFINITY && b.index === undefined || b.index === Number.POSITIVE_INFINITY) {
                    return -1;
                }
                else if (b.index === 0 || b.index !== undefined && b.index !== Number.POSITIVE_INFINITY && a.index === undefined || a.index === Number.POSITIVE_INFINITY) {
                    return 1;
                }
                else if (a.index !== undefined && b.index !== undefined) {
                    return a.index < b.index ? -1 : 1;
                }
            }
            return 0;
        });
    }

    get rendered() {
        return this.session.cache.filter((node: T) => node.visible && node.rendered);
    }

    get nextId() {
        return this.processing.cache.nextId;
    }

    get length() {
        return this.session.documentRoot.length;
    }
}