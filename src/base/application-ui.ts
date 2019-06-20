import { AppSessionUI, FileAsset, NodeTemplate, UserUISettings } from './@types/application';

import Application from './application';
import NodeList from './nodelist';
import ControllerUI from './controller-ui';
import ExtensionUI from './extension-ui';
import LayoutUI from './layout-ui';
import NodeUI from './node-ui';
import ResourceUI from './resource-ui';

import { APP_SECTION, BOX_STANDARD, NODE_ALIGNMENT, NODE_PROCEDURE, NODE_RESOURCE, NODE_TRAVERSE } from './lib/enumeration';

const {
    constant: $const,
    css: $css,
    dom: $dom,
    regex: $regex,
    session: $session,
    util: $util,
    xml: $xml
} = squared.lib;

const CACHE_PATTERN: ObjectMap<RegExp> = {};
let NodeConstructor!: Constructor<NodeUI>;

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

export default abstract class ApplicationUI<T extends NodeUI> extends Application<T> implements squared.base.ApplicationUI<T> {
    public static prioritizeExtensions<T extends NodeUI>(element: HTMLElement, extensions: ExtensionUI<T>[]) {
        if (element.dataset.use && extensions.length) {
            const included = element.dataset.use.split($regex.XML.SEPARATOR);
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
                return $util.spliceArray(result, item => item === undefined).concat(untagged);
            }
        }
        return extensions;
    }

    public controllerHandler!: ControllerUI<T>;
    public resourceHandler!: ResourceUI<T>;
    public readonly builtInExtensions: ObjectMap<ExtensionUI<T>> = {};
    public readonly extensions: ExtensionUI<T>[] = [];
    public readonly session: AppSessionUI<T> = {
        cache: new NodeList<T>(),
        excluded: new NodeList<T>(),
        extensionMap: new Map<number, ExtensionUI<T>[]>(),
        active: [],
        documentRoot: [],
        targetQueue: new Map<T, NodeTemplate<T>>()
    };
    public abstract userSettings: UserUISettings;

    private readonly _layouts: FileAsset[] = [];

    protected constructor(
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
            if (node.documentRoot && node.renderChildren.length === 0 && !node.inlineText && node.naturalChildren.every(item => item.documentRoot)) {
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
        $dom.removeElementsByClassName('__squared.pseudo');
        this.closed = true;
    }

    public saveAllToDisk() {
        const file = this.resourceHandler.fileHandler;
        if (file) {
            file.saveAllToDisk(this.layouts);
        }
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
        if (!this.controllerHandler.localSettings.unsupported.excluded.has(element.tagName)) {
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

    public insertNode(element: Element, parent?: T) {
        if ($dom.isPlainText(element)) {
            if ($xml.isPlainText(element.textContent as string) || $css.isParentStyle(element, 'whiteSpace', 'pre', 'pre-wrap')) {
                this.controllerHandler.applyDefaultStyles(element);
                const node = this.createNode(element, false);
                if (parent) {
                    NodeUI.copyTextStyle(node, parent);
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

    public createCache(documentRoot: HTMLElement) {
        const node = this.createRootNode(documentRoot);
        if (node) {
            node.documentParent = node.parent as T;
            const controller = this.controllerHandler;
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
            for (const item of CACHE) {
                if (item.styleElement) {
                    const element = <HTMLElement> item.element;
                    if (item.length) {
                        const textAlign = item.cssInitial('textAlign');
                        switch (textAlign) {
                            case $const.CSS.CENTER:
                            case $const.CSS.RIGHT:
                            case $const.CSS.END:
                                saveAlignment(element, item.id, 'text-align', $const.CSS.LEFT, textAlign);
                                break;
                        }
                    }
                    if (item.positionRelative) {
                        for (const attr of $css.BOX_POSITION) {
                            if (item.hasPX(attr)) {
                                saveAlignment(element, item.id, attr, $const.CSS.AUTO, item.css(attr));
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
            (node.parent as T).setBounds();
            for (const item of CACHE) {
                if (!item.pseudoElement) {
                    item.setBounds(preAlignment[item.id] === undefined && !resetBounds);
                }
                else {
                    const element = (item.actualParent as T).element;
                    if (element) {
                        const id = element.id;
                        let styleElement: HTMLElement | undefined;
                        if (item.pageFlow) {
                            element.id = `id_${Math.round(Math.random() * new Date().getTime())}`;
                            styleElement = $css.insertStyleSheetRule(`#${element.id + NodeUI.getPseudoElt(item)} { display: none !important; }`);
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
                }
            }
            for (const item of this.processing.excluded) {
                if (!item.lineBreak) {
                    item.setBounds();
                    item.saveAsInitial();
                }
            }
            for (const item of CACHE) {
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
            controller.evaluateNonStatic(node, CACHE);
            controller.sortInitialCache(CACHE);
            return true;
        }
        return false;
    }

    public afterCreateCache(element: HTMLElement) {
        const dataset = element.dataset;
        const filename = dataset.filename && dataset.filename.replace(new RegExp(`\.${this.controllerHandler.localSettings.layout.fileExtension}$`), '') || element.id || `document_${this.length}`;
        const iteration = (dataset.iteration ? $util.convertInt(dataset.iteration) : -1) + 1;
        dataset.iteration = iteration.toString();
        dataset.layoutName = $util.convertWord(iteration > 1 ? `${filename}_${iteration}` : filename, true);
        this.setBaseLayout(dataset.layoutName);
        this.setConstraints();
        this.setResources();
    }

    public resolveTarget(target: string) {
        for (const parent of this.processing.cache) {
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

    protected cascadeParentNode(parentElement: HTMLElement, depth = 0) {
        const node = this.insertNode(parentElement);
        if (node) {
            node.depth = depth;
            if (depth === 0) {
                this.processing.cache.append(node);
            }
            const controller = this.controllerHandler;
            if (controller.preventNodeCascade(parentElement)) {
                return node;
            }
            const beforeElement = this.createPseduoElement(parentElement, '::before');
            const afterElement = this.createPseduoElement(parentElement, '::after');
            const childNodes = parentElement.childNodes;
            const length = childNodes.length;
            const children: T[] = new Array(length);
            const elements: T[] = new Array(parentElement.childElementCount);
            const queryMap: T[][] | undefined = this.userSettings.createQuerySelectorMap && parentElement.childElementCount ? [[]] : undefined;
            let inlineText = true;
            let j = 0;
            let k = 0;
            for (let i = 0; i < length; i++) {
                const element = <HTMLElement> childNodes[i];
                let child: T | undefined;
                if (element === beforeElement) {
                    child = this.insertNode(<HTMLElement> beforeElement);
                    if (child) {
                        node.innerBefore = child;
                        child.inlineText = true;
                        inlineText = false;
                    }
                }
                else if (element === afterElement) {
                    child = this.insertNode(<HTMLElement> afterElement);
                    if (child) {
                        node.innerAfter = child;
                        child.inlineText = true;
                        inlineText = false;
                    }
                }
                else if (element.nodeName.charAt(0) === '#') {
                    if ($dom.isPlainText(element)) {
                        child = this.insertNode(element, node);
                    }
                }
                else if (controller.includeElement(element)) {
                    ApplicationUI.prioritizeExtensions(element, this.extensions).some(item => item.init(element));
                    if (!this.rootElements.has(element)) {
                        child = this.cascadeParentNode(element, depth + 1);
                        if (child && !child.excluded) {
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
            this.cacheNodeChildren(node, children, inlineText);
            if (queryMap && queryMap[0].length) {
                node.queryMap = queryMap;
            }
        }
        return node;
    }

    protected cacheNodeChildren(node: T, children: T[], inlineText: boolean) {
        const length = children.length;
        if (length) {
            const CACHE = this.processing.cache;
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
                        CACHE.append(child);
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
                    CACHE.append(child);
                }
                child.actualParent = node;
            }
        }
        else {
            inlineText = !node.textEmpty;
        }
        node.inlineText = inlineText;
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

    protected setBaseLayout(layoutName: string) {
        const processing = this.processing;
        const CACHE = processing.cache;
        const documentRoot = processing.node as T;
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
            if (node.visible && node.length) {
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
        for (const ext of this.extensions) {
            ext.beforeBaseLayout();
        }
        for (const depth of mapY.values()) {
            for (const parent of depth.values()) {
                if (parent.length === 0) {
                    continue;
                }
                const axisY = parent.duplicate() as T[];
                const floatContainer = parent.floatContainer;
                const length = axisY.length;
                let cleared!: Map<T, string>;
                if (floatContainer) {
                    cleared = <Map<T, string>> NodeUI.linearData(parent.naturalElements as T[], true).cleared;
                }
                for (let k = 0; k < length; k++) {
                    let nodeY = axisY[k];
                    if (nodeY.rendered || !nodeY.visible || nodeY.naturalElement && !nodeY.documentRoot && this.rootElements.has(<HTMLElement> nodeY.element)) {
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
                            combined = combined ? combined.concat(descendant) : descendant.slice(0);
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
                            ApplicationUI.prioritizeExtensions(<HTMLElement> nodeY.element, extensions).some((item: ExtensionUI<T>) => {
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
        this.session.cache.concat(CACHE.children);
        this.session.excluded.concat(processing.excluded.children);
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
            const parent = this.createNode(undefined, true, layout.parent, inlineBelow);
            parent.actualParent = layout.parent;
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
                grouping.sort((a: T, b: T) => a.childIndex < b.childIndex ? -1 : 1);
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
                            if (!node.nodeGroup) {
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