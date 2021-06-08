import USER_AGENT = squared.lib.constant.USER_AGENT;
import NODE_TEMPLATE = squared.base.lib.constant.NODE_TEMPLATE;

import type ApplicationUI from './application-ui';
import type ContentUI from './content-ui';
import type LayoutUI from './layout-ui';
import type NodeUI from './node-ui';
import type NodeList from './nodelist';

import Controller from './controller';

import { CSS } from './lib/regex';

import { trimEnd } from './lib/util';

const { CSS_BORDER_SET } = squared.lib.internal;
const { STRING } = squared.lib.regex;

const { isUserAgent } = squared.lib.client;
const { formatPX, getFontSize, getStyle, hasCoords, isLength, isPercent, parseUnit } = squared.lib.css;
const { getParentElement, withinViewport } = squared.lib.dom;
const { getElementCache, setElementCache } = squared.lib.session;
const { iterateArray } = squared.lib.util;

const CACHE_INDENT: StringMap = {};
const DIMENSION_AUTO: CssStyleAttr[][] = [['width', 'height', 'maxWidth'], ['height', 'width', 'maxHeight']];

function pushIndent(value: string, depth: number, indent = '\t'.repeat(depth)) {
    if (depth > 0) {
        const lines = trimEnd(value, '\n').split('\n');
        let result = '';
        for (let i = 0, length = lines.length; i < length; ++i) {
            result += (i === 0 || i === length - 1 || lines[i + 1][0] === '\t' ? indent : '') + lines[i] + '\n';
        }
        return result;
    }
    return value;
}

function pushIndentArray(values: string[], depth: number) {
    if (depth > 0) {
        const indent = '\t'.repeat(depth);
        return values.reduce((a, b) => a + pushIndent(b, depth, indent), '');
    }
    return values.join('');
}

function setDimension(element: DimensionElement, style: CssStyleMap, attr: DimensionAttr) {
    if (hasEmptyDimension(style[attr])) {
        const match = new RegExp((element.tagName.toLowerCase() === 'svg' ? `^\\s*<svg${STRING.TAG_OPEN}+?` : '\\s') + `${attr}="([^"]+)"`).exec(element.outerHTML);
        if (match) {
            const value = match.pop()!;
            if (isPercent(value)) {
                style[attr] = value;
                return;
            }
            let unit = +value;
            if (!isNaN(unit) || !isNaN(unit = parseUnit(value, { fontSize: getFontSize(element) }))) {
                style[attr] = unit + 'px';
                return;
            }
        }
        if (element.clientWidth === 300 && element.clientHeight === 150) {
            switch (element.tagName) {
                case 'IMG':
                case 'INPUT':
                case 'SOURCE':
                    break;
                case 'OBJECT':
                case 'EMBED':
                     if ((element as HTMLObjectElement).type.startsWith('image/')) {
                        break;
                     }
                default:
                    if (attr === 'width') {
                        style.width = '300px';
                    }
                    else {
                        style.height = '150px';
                    }
                    break;
            }
        }
    }
}

const hasEmptyStyle = (value: Undef<string>) => !value || value === 'initial';
const hasEmptyDimension = (value: Undef<string>) => !value || value === 'auto';

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
    private _layoutInnerXmlTags!: string[];
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

    public abstract get screenDimension(): Dimension;
    public abstract get containerTypeHorizontal(): LayoutType;
    public abstract get containerTypeVertical(): LayoutType;
    public abstract get containerTypeVerticalMargin(): LayoutType;
    public abstract get containerTypePercent(): LayoutType;

    public init() {
        const { unsupported, style, layout } = this.localSettings;
        this._unsupportedCascade = unsupported.cascade;
        this._unsupportedTagName = unsupported.tagName;
        this._settingsStyle = style;
        this._layoutInnerXmlTags = layout.innerXmlTags;
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
        this._beforeOutside = new WeakMap();
        this._beforeInside = new WeakMap();
        this._afterInside = new WeakMap();
        this._afterOutside = new WeakMap();
        this._requireFormat = false;
    }

    public applyDefaultStyles(processing: squared.base.AppProcessing<T>, element: Element) {
        if (element.nodeName[0] === '#') {
            setElementCache(element, 'styleMap', {
                position: 'static',
                display: 'inline',
                verticalAlign: 'baseline',
                float: 'none'
            }, processing.sessionId);
        }
        else {
            let style = getElementCache<CssStyleMap>(element, 'styleMap', processing.sessionId);
            if (!style) {
                setElementCache(element, 'styleMap', style = {}, processing.sessionId);
            }
            if (isUserAgent(USER_AGENT.FIREFOX)) {
                switch (element.tagName) {
                    case 'BODY':
                        if (style.backgroundColor === 'rgba(0, 0, 0, 0)') {
                            delete style.backgroundColor;
                        }
                        break;
                    case 'INPUT':
                    case 'SELECT':
                    case 'BUTTON':
                    case 'TEXTAREA':
                        style.display ||= 'inline-block';
                        break;
                    case 'FIELDSET':
                        style.display ||= 'block';
                        break;
                    case 'RUBY':
                        style.display ||= 'inline';
                        break;
                }
            }
            switch (element.tagName) {
                case 'A':
                    style.color ||= this._settingsStyle.anchorFontColor;
                    style.textDecorationLine ||= 'underline';
                    break;
                case 'INPUT': {
                    const settings = this._settingsStyle;
                    style.fontSize ||= settings.formFontSize;
                    const { type, disabled } = element as HTMLInputElement;
                    switch (type) {
                        case 'image':
                            this.setElementDimension(processing.resourceId, element as HTMLInputElement, style);
                        case 'radio':
                        case 'checkbox':
                            break;
                        case 'file':
                        case 'reset':
                        case 'submit':
                        case 'button':
                            this.setButtonStyle(element as HTMLInputElement, style, disabled);
                            break;
                        case 'range':
                            if (!disabled && hasEmptyStyle(style.backgroundColor)) {
                                style.backgroundColor = settings.rangeBackgroundColor;
                            }
                        default:
                            this.setInputStyle(element, style, disabled, settings.inputBorderWidth);
                            break;
                    }
                    break;
                }
                case 'BUTTON': {
                    style.fontSize ||= this._settingsStyle.formFontSize;
                    this.setButtonStyle(element as HTMLButtonElement, style, (element as HTMLButtonElement).disabled);
                    break;
                }
                case 'TEXTAREA':
                case 'SELECT': {
                    style.fontSize ||= this._settingsStyle.formFontSize;
                    this.setInputStyle(element, style, (element as HTMLTextAreaElement | HTMLSelectElement).disabled);
                    break;
                }
                case 'BODY':
                    if (hasEmptyStyle(style.backgroundColor) && CSS.TRANSPARENT.test(getStyle(document.documentElement).backgroundColor)) {
                        style.backgroundColor = 'rgb(255, 255, 255)';
                    }
                    break;
                case 'H1':
                    if (!style.fontSize) {
                        let parent = element.parentElement;
                        found: {
                            while (parent) {
                                switch (parent.tagName) {
                                    case 'ARTICLE':
                                    case 'ASIDE':
                                    case 'NAV':
                                    case 'SECTION':
                                        style.fontSize = '1.5em';
                                        break found;
                                }
                                parent = parent.parentElement;
                            }
                            style.fontSize = '2em';
                        }
                    }
                    break;
                case 'H2':
                    style.fontSize ||= '1.5em';
                    break;
                case 'H3':
                    style.fontSize ||= '1.17em';
                    break;
                case 'H4':
                    style.fontSize ||= '1em';
                    break;
                case 'H5':
                    style.fontSize ||= '0.83em';
                    break;
                case 'H6':
                    style.fontSize ||= '0.67em';
                    break;
                case 'HR':
                    this.setBorderStyle(style, 'inset', '1px', this._settingsStyle.hrBorderColor);
                    break;
                case 'FORM':
                    style.marginTop ||= '0px';
                    break;
                case 'SUP':
                case 'SUB':
                case 'SMALL':
                    style.fontSize ||= 'smaller';
                    break;
                case 'RT':
                    if (!style.fontSize && element.parentElement!.tagName === 'RUBY') {
                        style.fontSize = '50%';
                    }
                    break;
                case 'SOURCE':
                    if (element.parentElement!.tagName !== 'PICTURE') {
                        break;
                    }
                case 'IFRAME':
                    if (!style.display || style.display === 'inline') {
                        style.display = 'inline-block';
                    }
                case 'IMG':
                case 'CANVAS':
                case 'VIDEO':
                case 'AUDIO':
                case 'OBJECT':
                case 'EMBED':
                case 'SVG':
                case 'svg':
                    this.setElementDimension(processing.resourceId, element as DimensionElement, style);
                    break;
            }
        }
    }

    public addBeforeOutsideTemplate(node: T, value: string, format?: boolean, index = -1) {
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

    public addBeforeInsideTemplate(node: T, value: string, format?: boolean, index = -1) {
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

    public addAfterInsideTemplate(node: T, value: string, format?: boolean, index = -1) {
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

    public addAfterOutsideTemplate(node: T, value: string, format?: boolean, index = -1) {
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

    public visibleElement(element: HTMLElement, sessionId: string, pseudoElt?: PseudoElt): boolean {
        let style: CSSStyleDeclaration,
            width = 1,
            height = 1,
            display: string;
        if (!pseudoElt) {
            style = getStyle(element);
            if ((display = style.display) !== 'none') {
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
            if ((display = style.display) === 'none') {
                return false;
            }
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
            case 'SLOT':
                return true;
        }
        return !hasCoords(style.position) && (display === 'block' || width > 0 && style.float !== 'none' || style.clear !== 'none') || iterateArray(element.children, (item: HTMLElement) => this.visibleElement(item, sessionId)) === Infinity;
    }

    public evaluateNonStatic(documentRoot: T, cache: NodeList<T>) {
        const altered: T[] = [];
        const supportNegativeLeftTop = this.application.getUserSetting<boolean>(documentRoot.sessionId, 'supportNegativeLeftTop');
        let escaped: Undef<Map<T, { parent: T; appending: T[] }>>,
            container: Undef<T>;
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
                let parent: Optional<T>;
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
                        if (supportNegativeLeftTop && !(node.hasUnit('top') && node.hasUnit('bottom') || node.hasUnit('left') && node.hasUnit('right'))) {
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
                                    parent = parent.actualParent as Null<T>;
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
                        else if (!absoluteParent.hasUnit('left') && right !== 0) {
                            bounds.left -= right;
                            bounds.right -= right;
                        }
                        if (top !== 0) {
                            bounds.top += top;
                            bounds.bottom += top;
                        }
                        else if (!absoluteParent.hasUnit('top') && bottom !== 0) {
                            bounds.top -= bottom;
                            bounds.bottom -= bottom;
                        }
                        node.resetBounds(true);
                    }
                    let opacity = node.opacity,
                        current = actualParent;
                    do {
                        opacity *= current.opacity;
                    }
                    while ((current = current.actualParent as T) && current !== parent);
                    node.cssInitial('opacity', { value: opacity.toString() });
                    node.parent = parent;
                    if (!altered.includes(parent)) {
                        altered.push(parent);
                    }
                }
                if (parent === documentRoot && parent.layoutElement) {
                    const root = parent.parent as T;
                    if (!container) {
                        container = this.createNodeGroup(parent, [parent, node], root, { ...this.containerTypeVertical, wrapper: true });
                    }
                    else {
                        node.internalSelf(container, 1);
                        container.add(node);
                    }
                    node.documentParent = root;
                }
                else {
                    node.documentParent = parent;
                }
            }
        });
        if (escaped) {
            for (const [floated, data] of escaped) {
                const { parent, appending } = data;
                const children = parent.children;
                const containerIndex = children.indexOf(floated);
                if (containerIndex !== -1) {
                    const childIndex = floated.childIndex;
                    const documentChildren = parent.naturalChildren.slice(0) as T[];
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
                        item.internalSelf(parent, depth);
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
                    for (let i = 0, length = appending.length, q = documentChildren.length; i < length; ++i) {
                        const item = appending[i];
                        const index = documentChildren.indexOf(item);
                        if (index !== -1) {
                            const siblingsLeading: T[] = [];
                            const siblingsTrailing: T[] = [];
                            for (let j = index - 1, sibling: T; j >= 0; --j) {
                                siblingsLeading.push(sibling = documentChildren[j]);
                                if (!sibling.excluded) {
                                    break;
                                }
                            }
                            for (let j = index + 1, sibling: T; j < q; ++j) {
                                siblingsTrailing.push(sibling = documentChildren[j]);
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
                    parent.floatContainer = true;
                    parent.documentChildren = documentChildren;
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
                        const order = layers[i] as Undef<T[]>;
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
                    node.each((item: T) => !children.includes(item) && children.push(item));
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
                if (parentA.actualParent === parentB.actualParent) {
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
                        (renderTemplates || beforeInside || afterInside || this._layoutInnerXmlTags.includes(controlName)
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
        return '<' + controlName + attributes + (content || this._layoutInnerXmlTags.includes(controlName) ? `>\n${content}</${controlName}>\n` : ' />\n');
    }

    protected setInputStyle(element: Element, style: CssStyleMap, disabled: boolean, width = '1px') {
        const settings = this._settingsStyle;
        this.setBorderStyle(style, settings.inputBorderStyle, width, disabled ? settings.inputDisabledBorderColor : settings.inputBorderColor);
        if (hasEmptyStyle(style.backgroundColor)) {
            const backgroundColor = (disabled ? settings.inputDisabledBackgroundColor : settings.inputBackgroundColor) || getStyle(element).backgroundColor;
            if (backgroundColor) {
                style.backgroundColor = backgroundColor;
            }
        }
    }

    protected setButtonStyle(element: HTMLInputElement | HTMLButtonElement, style: CssStyleMap, disabled: boolean) {
        const settings = this._settingsStyle;
        this.setBorderStyle(style, settings.buttonBorderStyle, settings.buttonBorderWidth, disabled ? settings.buttonDisabledBorderColor : settings.buttonBorderColor);
        if (hasEmptyStyle(style.backgroundColor)) {
            style.backgroundColor = (disabled ? element.type === 'file' && settings.inputFileDisabledBackgroundColor || settings.buttonDisabledBackgroundColor : element.type === 'file' && settings.inputFileBackgroundColor || settings.buttonBackgroundColor) || getStyle(element).backgroundColor;
        }
        style.textAlign ||= 'center';
        style.paddingTop ||= settings.buttonPaddingVertical;
        style.paddingRight ||= settings.buttonPaddingHorizontal;
        style.paddingBottom ||= settings.buttonPaddingVertical;
        style.paddingLeft ||= settings.buttonPaddingHorizontal;
    }

    protected setBorderStyle(style: CssStyleMap, ...borderAttr: string[]) {
        for (let i = 0; i < 4; ++i) {
            const border = CSS_BORDER_SET[i];
            for (let j = 0; j < 3; ++j) {
                const attr = border[j];
                const value = style[attr];
                if (!value) {
                    style[attr] = borderAttr[j];
                }
                else if (value === 'initial' || value === 'unset') {
                    style[attr] = 'revert';
                }
                else if (j === 0 && (value === 'none' || value === 'hidden')) {
                    break;
                }
            }
        }
    }

    protected setElementDimension(resourceId: number, element: DimensionElement, style: CssStyleMap) {
        setDimension(element, style, 'width');
        setDimension(element, style, 'height');
        if (!(!hasEmptyDimension(style.width) && !hasEmptyDimension(style.height))) {
            switch (element.tagName) {
                case 'IMG':
                case 'INPUT':
                case 'SOURCE':
                case 'EMBED':
                case 'IFRAME':
                case 'OBJECT': {
                    const image = this.application.resourceHandler.getImageDimension(resourceId, element instanceof HTMLObjectElement ? element.data : (element as HTMLImageElement).src);
                    if (image.width && image.height) {
                        for (const [attr, opposing, maxDimension] of DIMENSION_AUTO) {
                            const value = style[opposing];
                            if (value && isLength(value)) {
                                const valueMax = style[maxDimension];
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
                    }
                    break;
                }
            }
        }
    }

    get requireFormat() {
        return this._requireFormat;
    }
}