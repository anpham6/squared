import USER_AGENT = squared.lib.constant.USER_AGENT;
import NODE_TEMPLATE = squared.base.lib.constant.NODE_TEMPLATE;

import type ApplicationUI from './application-ui';
import type ContentUI from './content-ui';
import type LayoutUI from './layout-ui';
import type NodeUI from './node-ui';
import type NodeList from './nodelist';

import Controller from './controller';

const { CSS_PROPERTIES } = squared.lib.internal;

const { isUserAgent } = squared.lib.client;
const { asPx, formatPX, getFontSize, getStyle, hasCoords, isLength, isPercent, parseUnit } = squared.lib.css;
const { getParentElement, withinViewport } = squared.lib.dom;
const { getElementCache, setElementCache } = squared.lib.session;
const { iterateArray } = squared.lib.util;

const BORDER_BOX = [
    CSS_PROPERTIES.borderTop.value as string[],
    CSS_PROPERTIES.borderRight.value as string[],
    CSS_PROPERTIES.borderBottom.value as string[],
    CSS_PROPERTIES.borderLeft.value as string[]
];
const CACHE_INDENT: StringMap = {};

function pushIndent(value: string, depth: number, char = '\t', indent?: string) {
    if (depth > 0) {
        indent ||= char.repeat(depth);
        return value.split('\n').reduce((a, b) => a + (b ? indent + b + '\n' : ''), '');
    }
    return value;
}

function pushIndentArray(values: string[], depth: number, char = '\t', separator = '') {
    if (depth > 0) {
        const indent = char.repeat(depth);
        let result = '';
        for (let i = 0, length = values.length; i < length; ++i) {
            result += (i > 0 ? separator : '') + pushIndent(values[i], depth, char, indent);
        }
        return result;
    }
    return values.join(separator);
}

const hasEmptyStyle = (value: Undef<string>) => !value || value === 'initial' || value === 'unset' || value === 'revert';

export default abstract class ControllerUI<T extends NodeUI> extends Controller<T> implements squared.base.ControllerUI<T> {
    public readonly application!: ApplicationUI<T>;
    public abstract readonly localSettings: ControllerSettingsUI;

    private _beforeOutside = new WeakMap<T, string[]>();
    private _beforeInside = new WeakMap<T, string[]>();
    private _afterInside = new WeakMap<T, string[]>();
    private _afterOutside = new WeakMap<T, string[]>();
    private _requireFormat = false;
    private _unsupportedCascade!: string[];
    private _unsupportedTagName!: string[];
    private _innerXmlTags!: string[];
    private _settingsStyle!: ControllerSettingsStyleUI;

    public abstract processUnknownParent(layout: LayoutUI<T>): void;
    public abstract processUnknownChild(layout: ContentUI<T>): void;
    public abstract processTraverseHorizontal(layout: LayoutUI<T>, siblings: T[]): Undef<LayoutUI<T>>;
    public abstract processTraverseVertical(layout: LayoutUI<T>, siblings: T[]): Undef<LayoutUI<T>>;
    public abstract processLayoutHorizontal(layout: LayoutUI<T>): LayoutUI<T>;
    public abstract createNodeGroup(node: T, children: T[], parent?: T, options?: CreateNodeGroupUIOptions): T;
    public abstract createNodeWrapper(node: T, parent: T, options?: CreateNodeWrapperUIOptions<T>): T;
    public abstract renderNode(layout: ContentUI<T>): Undef<NodeTemplate<T>>;
    public abstract renderNodeGroup(layout: LayoutUI<T>): Undef<NodeTemplate<T>>;
    public abstract sortRenderPosition(parent: T, templates: NodeTemplate<T>[]): NodeTemplate<T>[];
    public abstract setConstraints(rendering: NodeList<T>): void;
    public abstract optimize(rendered: T[]): void;
    public abstract finalize(layouts: FileAsset[]): void;

    public abstract get userSettings(): UserResourceSettingsUI;
    public abstract get screenDimension(): Dimension;
    public abstract get containerTypeHorizontal(): LayoutType;
    public abstract get containerTypeVertical(): LayoutType;
    public abstract get containerTypeVerticalMargin(): LayoutType;
    public abstract get containerTypePercent(): LayoutType;

    public init() {
        const { cascade, tagName } = this.localSettings.unsupported;
        this._unsupportedCascade = cascade;
        this._unsupportedTagName = tagName;
        this._innerXmlTags = this.localSettings.layout.innerXmlTags;
        this._settingsStyle = this.localSettings.style;
    }

    public preventNodeCascade(node: T) {
        return this._unsupportedCascade.includes(node.tagName);
    }

    public includeElement(element: HTMLElement) {
        let tagName = element.tagName;
        if (tagName === 'INPUT') {
            tagName += ':' + (element as HTMLInputElement).type;
        }
        return !this._unsupportedTagName.includes(tagName) || element.contentEditable === 'true';
    }

    public reset() {
        this._requireFormat = false;
    }

    public applyDefaultStyles(processing: squared.base.AppProcessing<T>, element: Element) {
        if (element.nodeName.charAt(0) === '#') {
            setElementCache(element, 'styleMap', {
                position: 'static',
                display: 'inline',
                verticalAlign: 'baseline',
                float: 'none'
            }, processing.sessionId);
        }
        else {
            let styleMap = getElementCache<CssStyleMap>(element, 'styleMap', processing.sessionId);
            if (!styleMap) {
                setElementCache(element, 'styleMap', styleMap = {}, processing.sessionId);
            }
            const setDimension = () => {
                this.setElementDimension(processing.resourceId, element as HTMLImageElement, styleMap!, 'width');
                this.setElementDimension(processing.resourceId, element as HTMLImageElement, styleMap!, 'height');
            };
            if (isUserAgent(USER_AGENT.FIREFOX)) {
                switch (element.tagName) {
                    case 'BODY':
                        if (styleMap.backgroundColor === 'rgba(0, 0, 0, 0)') {
                            delete styleMap.backgroundColor;
                        }
                        break;
                    case 'INPUT':
                    case 'SELECT':
                    case 'BUTTON':
                    case 'TEXTAREA':
                        styleMap.display ||= 'inline-block';
                        break;
                    case 'FIELDSET':
                        styleMap.display ||= 'block';
                        break;
                    case 'RUBY':
                        styleMap.display ||= 'inline';
                        break;
                }
            }
            switch (element.tagName) {
                case 'A':
                    styleMap.color ||= this._settingsStyle.anchorFontColor;
                    break;
                case 'INPUT': {
                    styleMap.fontSize ||= this._settingsStyle.formFontSize;
                    const { type, disabled } = element as HTMLInputElement;
                    switch (type) {
                        case 'image':
                            setDimension();
                        case 'radio':
                        case 'checkbox':
                            break;
                        case 'file':
                        case 'reset':
                        case 'submit':
                        case 'button':
                            this.setButtonStyle(styleMap, disabled);
                            break;
                        case 'range':
                            if (!disabled && hasEmptyStyle(styleMap.backgroundColor)) {
                                styleMap.backgroundColor = this._settingsStyle.rangeBackgroundColor;
                            }
                        default:
                            this.setInputStyle(styleMap, disabled);
                            break;
                    }
                    break;
                }
                case 'BUTTON': {
                    const disabled = (element as HTMLButtonElement).disabled;
                    styleMap.fontSize ||= this._settingsStyle.formFontSize;
                    this.setButtonStyle(styleMap, disabled);
                    break;
                }
                case 'TEXTAREA':
                case 'SELECT': {
                    const disabled = (element as HTMLTextAreaElement | HTMLSelectElement).disabled;
                    styleMap.fontSize ||= this._settingsStyle.formFontSize;
                    this.setInputStyle(styleMap, disabled, '1px');
                    break;
                }
                case 'BODY':
                    if (hasEmptyStyle(styleMap.backgroundColor) && (getStyle(document.documentElement).backgroundColor === 'rgba(0, 0, 0, 0)')) {
                        styleMap.backgroundColor = 'rgb(255, 255, 255)';
                    }
                    break;
                case 'H1':
                    if (!styleMap.fontSize) {
                        let parent = element.parentElement;
                        found: {
                            while (parent) {
                                switch (parent.tagName) {
                                    case 'ARTICLE':
                                    case 'ASIDE':
                                    case 'NAV':
                                    case 'SECTION':
                                        styleMap.fontSize = '1.5em';
                                        break found;
                                    default:
                                        parent = parent.parentElement;
                                        break;
                                }
                            }
                            styleMap.fontSize = '2em';
                        }
                    }
                    break;
                case 'H2':
                    styleMap.fontSize ||= '1.5em';
                    break;
                case 'H3':
                    styleMap.fontSize ||= '1.17em';
                    break;
                case 'H4':
                    styleMap.fontSize ||= '1em';
                    break;
                case 'H5':
                    styleMap.fontSize ||= '0.83em';
                    break;
                case 'H6':
                    styleMap.fontSize ||= '0.67em';
                    break;
                case 'HR':
                    this.setBorderStyle(styleMap, '1px', 'silver');
                    break;
                case 'FORM':
                    styleMap.marginTop ||= '0px';
                    break;
                case 'LI':
                    styleMap.listStyleImage ||= 'inherit';
                    break;
                case 'SUP':
                case 'SUB':
                case 'SMALL':
                    styleMap.fontSize ||= 'smaller';
                    break;
                case 'RT':
                    if (!styleMap.fontSize && element.parentElement!.tagName === 'RUBY') {
                        styleMap.fontSize = '50%';
                    }
                    break;
                case 'IFRAME':
                    if (!styleMap.display || styleMap.display === 'inline') {
                        styleMap.display = 'inline-block';
                    }
                case 'IMG':
                case 'CANVAS':
                case 'VIDEO':
                case 'AUDIO':
                case 'OBJECT':
                case 'EMBED':
                case 'svg':
                    setDimension();
                    break;
            }
        }
    }

    public addBeforeOutsideTemplate(node: T, value: string, format = true, index = -1) {
        let template = this._beforeOutside.get(node);
        if (!template) {
            this._beforeOutside.set(node, template = []);
        }
        if (index >= 0 && index < template.length) {
            template.splice(index, 0, value);
        }
        else {
            template.push(value);
        }
        if (format) {
            this._requireFormat = true;
        }
    }

    public addBeforeInsideTemplate(node: T, value: string, format = true, index = -1) {
        let template = this._beforeInside.get(node);
        if (!template) {
            this._beforeInside.set(node, template = []);
        }
        if (index >= 0 && index < template.length) {
            template.splice(index, 0, value);
        }
        else {
            template.push(value);
        }
        if (format) {
            this._requireFormat = true;
        }
    }

    public addAfterInsideTemplate(node: T, value: string, format = true, index = -1) {
        let template = this._afterInside.get(node);
        if (!template) {
            this._afterInside.set(node, template = []);
        }
        if (index >= 0 && index < template.length) {
            template.splice(index, 0, value);
        }
        else {
            template.push(value);
        }
        if (format) {
            this._requireFormat = true;
        }
    }

    public addAfterOutsideTemplate(node: T, value: string, format = true, index = -1) {
        let template = this._afterOutside.get(node);
        if (!template) {
            this._afterOutside.set(node, template = []);
        }
        if (index >= 0 && index < template.length) {
            template.splice(index, 0, value);
        }
        else {
            template.push(value);
        }
        if (format) {
            this._requireFormat = true;
        }
    }

    public getBeforeOutsideTemplate(node: T, depth: number) {
        const template = this._beforeOutside.get(node);
        return template ? pushIndentArray(template, depth) : '';
    }

    public getBeforeInsideTemplate(node: T, depth: number) {
        const template = this._beforeInside.get(node);
        return template ? pushIndentArray(template, depth) : '';
    }

    public getAfterInsideTemplate(node: T, depth: number) {
        const template = this._afterInside.get(node);
        return template ? pushIndentArray(template, depth) : '';
    }

    public getAfterOutsideTemplate(node: T, depth: number) {
        const template = this._afterOutside.get(node);
        return template ? pushIndentArray(template, depth) : '';
    }

    public hasAppendProcessing(node?: T) {
        return node ? this._beforeOutside.has(node) || this._beforeInside.has(node) || this._afterInside.has(node) || this._afterOutside.has(node) : this._requireFormat;
    }

    public visibleElement(element: HTMLElement, sessionId: string, pseudoElt?: PseudoElt): boolean {
        let style: CSSStyleDeclaration,
            width: number,
            height: number,
            display: string;
        if (!pseudoElt) {
            style = getStyle(element);
            display = style.display;
            if (display !== 'none') {
                const bounds = element.getBoundingClientRect();
                if (!withinViewport(bounds)) {
                    return false;
                }
                ({ width, height } = bounds);
                setElementCache(element, 'clientRect', bounds, sessionId);
            }
            else {
                return false;
            }
        }
        else {
            const parentElement = getParentElement(element);
            style = parentElement ? getStyle(parentElement, pseudoElt) : getStyle(element);
            display = style.display;
            if (display === 'none') {
                return false;
            }
            width = 1;
            height = 1;
        }
        if (width && height) {
            return style.visibility === 'visible' || !hasCoords(style.position);
        }
        let parent = element.parentElement;
        while (parent) {
            switch (parent.tagName) {
                case 'DETAILS':
                    return false;
                case 'SUMMARY':
                    return true;
            }
            parent = parent.parentElement;
        }
        switch (element.tagName) {
            case 'IMG':
                return display !== 'none';
            case 'SLOT':
                return true;
        }
        return !hasCoords(style.position) && (display === 'block' || width > 0 && style.float !== 'none' || style.clear !== 'none') || iterateArray(element.children, (item: HTMLElement) => this.visibleElement(item, sessionId)) === Infinity;
    }

    public evaluateNonStatic(documentRoot: T, cache: NodeList<T>) {
        const altered: T[] = [];
        let escaped: Undef<Map<T, { parent: T; appending: T[] }>>;
        cache.each(node => {
            if (node.floating) {
                if (node.float === 'left') {
                    const actualParent = node.actualParent as Null<T>;
                    let parent: Null<T> = actualParent,
                        previousParent: Undef<T>;
                    while (parent && parent.tagName === 'P' && !parent.documentRoot) {
                        previousParent = parent;
                        parent = parent.actualParent as Null<T>;
                    }
                    if (parent && previousParent && parent !== actualParent && parent.tagName === 'DIV') {
                        if ((escaped ||= new Map()).has(previousParent)) {
                            escaped.get(previousParent)!.appending.push(node);
                        }
                        else {
                            escaped.set(previousParent, { parent, appending: [node] });
                        }
                    }
                }
            }
            else if (!node.pageFlow && !node.documentRoot) {
                const actualParent = node.actualParent as T;
                const absoluteParent = node.absoluteParent as T;
                let parent: Undef<T>;
                switch (node.valueOf('position')) {
                    case 'fixed':
                        if (!node.autoPosition) {
                            parent = documentRoot;
                            break;
                        }
                    case 'absolute':
                        if (node.autoPosition) {
                            if (!node.siblingsLeading.some(item => item.multiline || item.excluded && !item.blockStatic) && node.withinX(actualParent.box, { dimension: 'linear' }) && node.withinY(actualParent.box, { dimension: 'linear' })) {
                                node.cssApply({ display: 'inline-block', verticalAlign: 'top' }, true, true);
                                parent = actualParent;
                                break;
                            }
                            node.autoPosition = false;
                        }
                        parent = absoluteParent;
                        if (this.userSettings.supportNegativeLeftTop && !(node.hasPX('top') && node.hasPX('bottom') || node.hasPX('left') && node.hasPX('right'))) {
                            let outside: Undef<boolean>;
                            while (parent && parent.bounds.height) {
                                if (parent.layoutElement) {
                                    parent = absoluteParent;
                                    break;
                                }
                                else if (parent !== documentRoot && (!parent.rightAligned && !parent.centerAligned || !parent.pageFlow)) {
                                    const linear = parent.linear;
                                    if (!outside) {
                                        const overflowX = parent.valueOf('overflowX') === 'hidden';
                                        const overflowY = parent.valueOf('overflowY') === 'hidden';
                                        if (overflowX && overflowY) {
                                            break;
                                        }
                                        const outsideX = !overflowX && node.outsideX(linear);
                                        const outsideY = !overflowY && node.outsideY(linear);
                                        if (outsideX && (node.left < 0 || node.right > 0) ||
                                            outsideY && (node.top < 0 || node.bottom !== 0) ||
                                            outsideX && outsideY && (!parent.pageFlow || parent.actualParent!.documentRoot && (node.top > 0 || node.left > 0)) ||
                                            !overflowX && ((node.left < 0 || node.right > 0) && Math.ceil(node.bounds.right) < linear.left || (node.left > 0 || node.right < 0) && Math.floor(node.bounds.left) > linear.right) && parent.find(item => item.pageFlow) ||
                                            !overflowY && ((node.top < 0 || node.bottom > 0) && Math.ceil(node.bounds.bottom) < parent.bounds.top || (node.top > 0 || node.bottom < 0) && Math.floor(node.bounds.top) > parent.bounds.bottom) ||
                                            !overflowX && !overflowY && !node.intersectX(linear) && !node.intersectY(linear))
                                        {
                                            outside = true;
                                        }
                                        else {
                                            break;
                                        }
                                    }
                                    else if (node.withinX(linear) && node.withinY(linear)) {
                                        break;
                                    }
                                    parent = parent.actualParent as T;
                                }
                                else {
                                    break;
                                }
                            }
                        }
                        break;
                }
                parent ||= documentRoot;
                if (parent !== actualParent) {
                    if (absoluteParent.positionRelative && parent !== absoluteParent) {
                        const { left, right, top, bottom } = absoluteParent;
                        const bounds = node.bounds;
                        if (left !== 0) {
                            bounds.left += left;
                            bounds.right += left;
                        }
                        else if (!absoluteParent.hasPX('left') && right !== 0) {
                            bounds.left -= right;
                            bounds.right -= right;
                        }
                        if (top !== 0) {
                            bounds.top += top;
                            bounds.bottom += top;
                        }
                        else if (!absoluteParent.hasPX('top') && bottom !== 0) {
                            bounds.top -= bottom;
                            bounds.bottom -= bottom;
                        }
                        node.resetBounds(true);
                    }
                    let opacity = node.opacity,
                        current = actualParent;
                    do {
                        opacity *= current.opacity;
                        current = current.actualParent as T;
                    }
                    while (current && current !== parent);
                    node.cssInitial('opacity', { value: opacity.toString() });
                    node.parent = parent;
                    if (!altered.includes(parent)) {
                        altered.push(parent);
                    }
                }
                node.documentParent = parent;
            }
        });
        if (escaped) {
            for (const [floated, data] of escaped) {
                const { parent, appending } = data;
                const children = parent.children;
                const containerIndex = children.findIndex(item => item === floated);
                if (containerIndex !== -1) {
                    const childIndex = floated.childIndex;
                    const documentChildren = parent.naturalChildren.slice(0);
                    const target = children[containerIndex] as T;
                    const depth = parent.depth + 1;
                    const actualParent = new Set<T>();
                    for (let i = 0, j = 0, k = 0, prepend = false; i < appending.length; ++i) {
                        const item = appending[i];
                        if (item.actualParent!.firstStaticChild === item) {
                            prepend = true;
                        }
                        else if (prepend) {
                            const previous = appending[i - 1];
                            prepend = previous.nextSibling === item && previous.float === item.float;
                        }
                        const increment = j + (prepend ? 0 : k + 1);
                        const l = childIndex + increment;
                        const m = containerIndex + increment;
                        documentChildren.splice(l, 0, item);
                        children.splice(m, 0, item);
                        if (prepend) {
                            target.siblingsLeading.unshift(item);
                            ++j;
                        }
                        else {
                            ++k;
                        }
                        item.parent!.remove(item);
                        item.init(parent, depth);
                        item.documentParent = parent;
                        const clear = item.valueOf('clear');
                        switch (clear) {
                            case 'left':
                            case 'right':
                            case 'both':
                                notFound: {
                                    let clearing: Undef<string>;
                                    for (let n = l - 1; n >= 0; --n) {
                                        const sibling = documentChildren[n];
                                        if (sibling.floating) {
                                            const float = sibling.float;
                                            if (clear === 'both' || float === clear) {
                                                this.application.clearMap.set(item, clear);
                                                let nextSibling = item.nextElementSibling as Null<T>;
                                                while (nextSibling) {
                                                    if (nextSibling.floating && !appending.includes(nextSibling)) {
                                                        appending.push(nextSibling);
                                                    }
                                                    nextSibling = nextSibling.nextElementSibling as Null<T>;
                                                }
                                                break;
                                            }
                                            else if (float === clearing) {
                                                break;
                                            }
                                        }
                                        else {
                                            const clearBefore = sibling.valueOf('clear');
                                            switch (clearBefore) {
                                                case 'left':
                                                case 'right':
                                                    if (clear === clearBefore) {
                                                        break notFound;
                                                    }
                                                    else {
                                                        clearing = clearBefore;
                                                    }
                                                    break;
                                                case 'both':
                                                    break notFound;
                                            }
                                        }
                                    }
                                }
                                break;
                        }
                        actualParent.add(item.actualParent as T);
                    }
                    parent.floatContainer = true;
                    for (let i = 0, length = appending.length, q = documentChildren.length; i < length; ++i) {
                        const item = appending[i];
                        const index = documentChildren.findIndex(child => child === item);
                        if (index !== -1) {
                            const siblingsLeading: T[] = [];
                            const siblingsTrailing: T[] = [];
                            for (let j = index - 1; j >= 0; --j) {
                                const sibling = documentChildren[j] as T;
                                siblingsLeading.push(sibling);
                                if (!sibling.excluded) {
                                    break;
                                }
                            }
                            for (let j = index + 1; j < q; ++j) {
                                const sibling = documentChildren[j] as T;
                                siblingsTrailing.push(sibling);
                                if (!sibling.excluded) {
                                    break;
                                }
                            }
                            item.siblingsLeading = siblingsLeading;
                            item.siblingsTrailing = siblingsTrailing;
                        }
                    }
                    for (const item of actualParent) {
                        if (!item.find(child => child.floating)) {
                            item.floatContainer = false;
                        }
                    }
                }
            }
        }
        if (altered.length) {
            for (const node of altered) {
                const layers: T[][] = [];
                node.each((item: T) => {
                    if (item.parent !== item.actualParent) {
                        const sibling = node.find((adjacent: T) => {
                            if (adjacent.naturalElements.includes(item)) {
                                return true;
                            }
                            const nested = adjacent.cascade();
                            return item.ascend({ condition: child => nested.includes(child) }).length > 0;
                        });
                        if (sibling) {
                            const index = sibling.childIndex + (item.zIndex >= 0 || sibling !== item.actualParent ? 1 : 0);
                            (layers[index] ||= []).push(item);
                        }
                    }
                });
                const length = layers.length;
                if (length) {
                    const children: T[] = [];
                    for (let i = 0; i < length; ++i) {
                        const order = layers[i];
                        if (order) {
                            order.sort((a, b) => {
                                if (a.parent === b.parent) {
                                    const zA = a.zIndex;
                                    const zB = b.zIndex;
                                    return zA === zB ? a.id - b.id : zA - zB;
                                }
                                return 0;
                            });
                            children.push(...order);
                        }
                    }
                    node.each((item: T) => {
                        if (!children.includes(item)) {
                            children.push(item);
                        }
                    });
                    node.retainAs(children);
                }
            }
        }
    }

    public sortInitialCache(cache: NodeList<T>) {
        cache.sort((a, b) => {
            let depth = a.depth - b.depth;
            if (depth !== 0) {
                return depth;
            }
            const parentA = a.documentParent;
            const parentB = b.documentParent;
            if (parentA !== parentB) {
                depth = parentA.depth - parentB.depth;
                if (depth !== 0) {
                    return depth;
                }
                else if (parentA.actualParent === parentB.actualParent) {
                    return parentA.childIndex - parentB.childIndex;
                }
                return parentA.id - parentB.id;
            }
            return 0;
        });
    }

    public writeDocument(templates: NodeTemplate<T>[], depth: number, showAttributes: boolean) {
        const indent = CACHE_INDENT[depth] ||= '\t'.repeat(depth);
        let output = '';
        for (let i = 0, length = templates.length; i < length; ++i) {
            const item = templates[i];
            switch (item.type) {
                case NODE_TEMPLATE.XML: {
                    const { node, controlName, attributes } = item as NodeXmlTemplate<T>;
                    const renderTemplates = node.renderTemplates;
                    const next = depth + 1;
                    const previous = node.depth < 0 ? depth + node.depth : depth;
                    const beforeInside = this.getBeforeInsideTemplate(node, next);
                    const afterInside = this.getAfterInsideTemplate(node, next);
                    output +=
                        this.getBeforeOutsideTemplate(node, previous) + indent +
                        '<' + controlName + (depth === 0 ? '{#0}' : '') +
                        (showAttributes ? !attributes ? node.extractAttributes(next) : pushIndent(attributes, next) : '') +
                        (renderTemplates || beforeInside || afterInside || this._innerXmlTags.includes(controlName)
                            ? '>\n' +
                                beforeInside +
                                (renderTemplates ? this.writeDocument(this.sortRenderPosition(node, renderTemplates as NodeTemplate<T>[]), next, showAttributes) : '') +
                                afterInside +
                                indent + `</${controlName}>`
                            : ' />') + '\n' +
                        this.getAfterOutsideTemplate(node, previous);
                    break;
                }
                case NODE_TEMPLATE.INCLUDE:
                    output += pushIndent((item as NodeIncludeTemplate<T>).content, depth);
                    break;
            }
        }
        return output;
    }

    public getEnclosingXmlTag(controlName: string, attributes = '', content = '') {
        return '<' + controlName + attributes + (content || this._innerXmlTags.includes(controlName) ? `>\n${content}</${controlName}>\n` : ' />\n');
    }

    protected setInputStyle(style: CssStyleMap, disabled: boolean, width = '2px') {
        this.setBorderStyle(style, width, this._settingsStyle[disabled ? 'inputDisabledBorderColor' : 'inputBorderColor']);
        if (disabled && hasEmptyStyle(style.backgroundColor)) {
            style.backgroundColor = this._settingsStyle.inputDisabledBackgroundColor;
        }
    }

    protected setButtonStyle(style: CssStyleMap, disabled: boolean) {
        if ((this.setBorderStyle(style, '2px', this._settingsStyle[disabled ? 'buttonDisabledBorderColor' : 'buttonBorderColor']) || disabled) && hasEmptyStyle(style.backgroundColor)) {
            style.backgroundColor = this._settingsStyle[disabled ? 'buttonDisabledBackgroundColor' : 'buttonBackgroundColor'];
        }
        style.textAlign ||= 'center';
        style.paddingTop ||= '1px';
        style.paddingRight ||= '6px';
        style.paddingBottom ||= '1px';
        style.paddingLeft ||= '6px';
    }

    protected setBorderStyle(style: CssStyleMap, width: string, color: string) {
        let result = false;
        for (let i = 0; i < 4; ++i) {
            const border = BORDER_BOX[i];
            const attr = border[0];
            if (!style[attr]) {
                style[attr] = width;
                style[border[1]] = 'inset';
                style[border[2]] = color;
                result = true;
            }
        }
        return result;
    }

    protected setElementDimension(resourceId: number, element: HTMLImageElement | HTMLVideoElement | HTMLAudioElement | HTMLEmbedElement | HTMLInputElement | HTMLObjectElement | HTMLIFrameElement | HTMLCanvasElement | SVGSVGElement, style: CssStyleMap, attr: DimensionAttr) {
        if (!style[attr] || style[attr] === 'auto') {
            const horizontal = attr === 'width';
            const match = new RegExp(`\\s${attr}="([^"]+)"`).exec(element.outerHTML);
            if (match) {
                const value = match[1];
                if (isPercent(value)) {
                    style[attr] = value;
                    return;
                }
                let unit = asPx(value);
                if (!isNaN(unit) || !isNaN(unit = parseFloat(value))) {
                    style[attr] = unit + 'px';
                    return;
                }
            }
            if (element.clientWidth === 300 && element.clientHeight === 150) {
                switch (element.tagName) {
                    case 'IMG':
                    case 'INPUT':
                        break;
                    case 'OBJECT':
                    case 'EMBED':
                         if ((element as HTMLObjectElement).type.startsWith('image/')) {
                            break;
                         }
                    default:
                        if (horizontal) {
                            style.width = '300px';
                        }
                        else {
                            style.height = '150px';
                        }
                        return;
                }
            }
            switch (element.tagName) {
                case 'IMG':
                case 'INPUT':
                case 'EMBED':
                case 'IFRAME':
                case 'OBJECT': {
                    const image = this.application.resourceHandler.getImage(resourceId, element instanceof HTMLObjectElement ? element.data : (element as HTMLImageElement).src);
                    if (image && image.width && image.height) {
                        const opposing = horizontal ? 'height' : 'width';
                        const value = style[opposing];
                        if (value && isLength(value)) {
                            const valueMax = horizontal ? style.maxWidth : style.maxHeight;
                            if (!valueMax || !isPercent(valueMax)) {
                                const options: ParseUnitOptions = { fontSize: getFontSize(element) };
                                let unit = image[attr] * parseUnit(value, options) / image[opposing];
                                if (valueMax && isLength(valueMax)) {
                                    unit = Math.min(unit, parseUnit(valueMax, options));
                                }
                                style[attr] = formatPX(unit);
                            }
                        }
                    }
                    break;
                }
            }
        }
    }
}