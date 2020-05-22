import Controller from './controller';
import NodeUI from './node-ui';

import { NODE_TEMPLATE } from './lib/enumeration';

const { USER_AGENT, isUserAgent, isWinEdge } = squared.lib.client;
const { CSS_PROPERTIES, formatPX, getStyle, isLength, isPercent } = squared.lib.css;
const { withinViewport } = squared.lib.dom;
const { capitalize, convertFloat, flatArray, isString, iterateArray, safeNestedArray } = squared.lib.util;
const { actualClientRect, getElementCache, setElementCache } = squared.lib.session;
const { pushIndent, pushIndentArray } = squared.lib.xml;

const BORDER_TOP = CSS_PROPERTIES.borderTop.value as string[];
const BORDER_RIGHT = CSS_PROPERTIES.borderRight.value as string[];
const BORDER_BOTTOM = CSS_PROPERTIES.borderBottom.value as string[];
const BORDER_LEFT = CSS_PROPERTIES.borderLeft.value as string[];

const BOX_BORDER = [BORDER_TOP, BORDER_RIGHT, BORDER_BOTTOM, BORDER_LEFT];

function positionAbsolute(style: CSSStyleDeclaration) {
    switch (style.getPropertyValue('position')) {
        case 'absolute':
        case 'fixed':
            return true;
    }
    return false;
}

function setBorderStyle(styleMap: StringMap, defaultColor: string) {
    if (!isString(styleMap.border) && !(BORDER_TOP[0] in styleMap || BORDER_RIGHT[0] in styleMap || BORDER_BOTTOM[0] in styleMap || BORDER_LEFT[0] in styleMap)) {
        styleMap.border = `1px outset ${defaultColor}`;
        let i = 0;
        while (i < 4) {
            const border = BOX_BORDER[i++];
            styleMap[border[0]] = '1px';
            styleMap[border[1]] = 'outset';
            styleMap[border[2]] = defaultColor;
        }
        return true;
    }
    return false;
}

function setButtonStyle(styleMap: StringMap, applied: boolean, defaultColor: string) {
    if (applied) {
        const backgroundColor = styleMap.backgroundColor;
        if (!isString(backgroundColor) || backgroundColor === 'initial') {
            styleMap.backgroundColor = defaultColor;
        }
    }
    if (!isString(styleMap.textAlign)) {
        styleMap.textAlign = 'center';
    }
    if (!isString(styleMap.padding) && !(CSS_PROPERTIES.padding.value as string[]).some(attr => !!styleMap[attr])) {
        styleMap.paddingTop = '2px';
        styleMap.paddingRight = '6px';
        styleMap.paddingBottom = '3px';
        styleMap.paddingLeft = '6px';
    }
}

export default abstract class ControllerUI<T extends NodeUI> extends Controller<T> implements squared.base.ControllerUI<T> {
    public abstract readonly localSettings: ControllerSettingsUI;

    private _requireFormat = false;
    private _beforeOutside: ObjectIndex<string[]> = {};
    private _beforeInside: ObjectIndex<string[]> = {};
    private _afterInside: ObjectIndex<string[]> = {};
    private _afterOutside: ObjectIndex<string[]> = {};
    private _unsupportedCascade!: Set<string>;
    private _unsupportedTagName!: Set<string>;

    public abstract processUnknownParent(layout: squared.base.LayoutUI<T>): squared.base.LayoutResult<T>;
    public abstract processUnknownChild(layout: squared.base.LayoutUI<T>): squared.base.LayoutResult<T>;
    public abstract processTraverseHorizontal(layout: squared.base.LayoutUI<T>, siblings: T[]): Undef<squared.base.LayoutUI<T>>;
    public abstract processTraverseVertical(layout: squared.base.LayoutUI<T>, siblings: T[]): Undef<squared.base.LayoutUI<T>>;
    public abstract processLayoutHorizontal(layout: squared.base.LayoutUI<T>): squared.base.LayoutUI<T>;
    public abstract createNodeGroup(node: T, children: T[], parent?: T, options?: CreateNodeGroupOptions<T>): T;
    public abstract renderNode(layout: squared.base.LayoutUI<T>): Undef<NodeTemplate<T>>;
    public abstract renderNodeGroup(layout: squared.base.LayoutUI<T>): Undef<NodeTemplate<T>>;
    public abstract sortRenderPosition(parent: T, templates: NodeTemplate<T>[]): NodeTemplate<T>[];
    public abstract setConstraints(): void;
    public abstract optimize(nodes: T[]): void;
    public abstract finalize(layouts: FileAsset[]): void;

    public abstract get userSettings(): UserSettingsUI;
    public abstract get screenDimension(): Dimension;
    public abstract get containerTypeHorizontal(): LayoutType;
    public abstract get containerTypeVertical(): LayoutType;
    public abstract get containerTypeVerticalMargin(): LayoutType;
    public abstract get containerTypePercent(): LayoutType;

    public init() {
        const unsupported = this.localSettings.unsupported;
        this._unsupportedCascade = unsupported.cascade;
        this._unsupportedTagName = unsupported.tagName;
    }

    public preventNodeCascade(node: T) {
        return this._unsupportedCascade.has(node.tagName);
    }

    public includeElement(element: Element) {
        const tagName = element.tagName;
        return !(this._unsupportedTagName.has(tagName) || tagName === 'INPUT' && this._unsupportedTagName.has(tagName + ':' + (element as HTMLInputElement).type)) || (element as HTMLElement).contentEditable === 'true';
    }

    public reset() {
        this._requireFormat = false;
        this._beforeOutside = {};
        this._beforeInside = {};
        this._afterInside = {};
        this._afterOutside = {};
    }

    public applyDefaultStyles(element: Element) {
        const sessionId = this.sessionId;
        let styleMap: StringMap;
        if (element.nodeName === '#text') {
            styleMap = {
                position: 'static',
                display: 'inline',
                verticalAlign: 'baseline',
                float: 'none',
                clear: 'none'
            };
        }
        else {
            styleMap = getElementCache(element, 'styleMap', sessionId) || {};
            const tagName = element.tagName;
            if (isUserAgent(USER_AGENT.FIREFOX)) {
                switch (tagName) {
                    case 'BODY':
                        if (styleMap.backgroundColor === 'rgba(0, 0, 0, 0)') {
                            styleMap.backgroundColor = 'rgb(255, 255, 255)';
                        }
                        break;
                    case 'INPUT':
                    case 'SELECT':
                    case 'BUTTON':
                    case 'TEXTAREA':
                        if (!isString(styleMap.display)) {
                            styleMap.display = 'inline-block';
                        }
                        break;
                    case 'FIELDSET':
                        if (!isString(styleMap.display)) {
                            styleMap.display = 'block';
                        }
                        break;
                }
            }
            else if (isWinEdge()) {
                switch (tagName) {
                    case 'BODY':
                        if (styleMap.backgroundColor === 'transparent') {
                            styleMap.backgroundColor = 'rgb(255, 255, 255)';
                        }
                        break;
                    case 'INPUT':
                        switch ((element as HTMLInputElement).type) {
                            case 'text':
                            case 'password':
                            case 'time':
                            case 'date':
                            case 'datetime-local':
                            case 'week':
                            case 'month':
                            case 'url':
                            case 'email':
                            case 'search':
                            case 'number':
                            case 'tel':
                                if (!isString(styleMap.fontSize)) {
                                    styleMap.fontSize = '13.3333px';
                                }
                                break;
                        }
                        break;
                    case 'CODE':
                        if (!isString(styleMap.fontFamily)) {
                            styleMap.fontFamily = 'monospace';
                        }
                        break;
                    case 'LEGEND':
                    case 'RT':
                        if (!isString(styleMap.display)) {
                            styleMap.display = 'block';
                        }
                        break;
                }
            }
            switch (tagName) {
                case 'INPUT': {
                    const type = (element as HTMLInputElement).type;
                    switch (type) {
                        case 'radio':
                        case 'checkbox':
                        case 'image':
                            break;
                        case 'week':
                        case 'month':
                        case 'time':
                        case 'date':
                        case 'datetime-local':
                            styleMap.paddingTop = formatPX(convertFloat(styleMap.paddingTop) + 1);
                            styleMap.paddingRight = formatPX(convertFloat(styleMap.paddingRight) + 1);
                            styleMap.paddingBottom = formatPX(convertFloat(styleMap.paddingBottom) + 1);
                            styleMap.paddingLeft = formatPX(convertFloat(styleMap.paddingLeft) + 1);
                            break;
                        default: {
                            const style = this.localSettings.style;
                            const result = setBorderStyle(styleMap, style.inputBorderColor);
                            switch (type) {
                                case 'file':
                                case 'reset':
                                case 'submit':
                                case 'button':
                                    setButtonStyle(styleMap, result, style.inputBackgroundColor);
                                    break;
                            }
                            break;
                        }
                    }
                    break;
                }
                case 'BUTTON': {
                    const style = this.localSettings.style;
                    setButtonStyle(styleMap, setBorderStyle(styleMap, style.inputBorderColor), style.inputBackgroundColor);
                    break;
                }
                case 'TEXTAREA':
                case 'SELECT':
                    setBorderStyle(styleMap, this.localSettings.style.inputBorderColor);
                    break;
                case 'BODY': {
                    const backgroundColor = styleMap.backgroundColor;
                    if (!isString(backgroundColor) || backgroundColor === 'initial') {
                        styleMap.backgroundColor = 'rgb(255, 255, 255)';
                    }
                    break;
                }
                case 'FORM':
                    if (!isString(styleMap.marginTop)) {
                        styleMap.marginTop = '0px';
                    }
                    break;
                case 'LI':
                    if (!isString(styleMap.listStyleImage)) {
                        const style = getStyle(element);
                        styleMap.listStyleImage = style.getPropertyValue('list-style-image');
                    }
                    break;
                case 'IFRAME':
                    if (!isString(styleMap.display)) {
                        styleMap.display = 'block';
                    }
                case 'IMG':
                case 'CANVAS':
                case 'svg':
                case 'VIDEO':
                case 'OBJECT':
                case 'EMBED': {
                    this.setElementDimension(element, tagName, styleMap, 'width', 'height');
                    this.setElementDimension(element, tagName, styleMap, 'height', 'width');
                    break;
                }
            }
        }
        setElementCache(element, 'styleMap', sessionId, styleMap);
    }

    public addBeforeOutsideTemplate(id: number, value: string, format = true, index = -1) {
        const template = safeNestedArray(this._beforeOutside, id);
        if (index !== -1 && index < template.length) {
            template.splice(index, 0, value);
        }
        else {
            template.push(value);
        }
        if (format) {
            this._requireFormat = true;
        }
    }

    public addBeforeInsideTemplate(id: number, value: string, format = true, index = -1) {
        const template = safeNestedArray(this._beforeInside, id);
        if (index !== -1 && index < template.length) {
            template.splice(index, 0, value);
        }
        else {
            template.push(value);
        }
        if (format) {
            this._requireFormat = true;
        }
    }

    public addAfterInsideTemplate(id: number, value: string, format = true, index = -1) {
        const template = safeNestedArray(this._afterInside, id);
        if (index !== -1 && index < template.length) {
            template.splice(index, 0, value);
        }
        else {
            template.push(value);
        }
        if (format) {
            this._requireFormat = true;
        }
    }

    public addAfterOutsideTemplate(id: number, value: string, format = true, index = -1) {
        const template = safeNestedArray(this._afterOutside, id);
        if (index !== -1 && index < template.length) {
            template.splice(index, 0, value);
        }
        else {
            template.push(value);
        }
        if (format) {
            this._requireFormat = true;
        }
    }

    public getBeforeOutsideTemplate(id: number, depth: number): string {
        const template = this._beforeOutside[id];
        return template ? pushIndentArray(template, depth) : '';
    }

    public getBeforeInsideTemplate(id: number, depth: number): string {
        const template = this._beforeInside[id];
        return template ? pushIndentArray(template, depth) : '';
    }

    public getAfterInsideTemplate(id: number, depth: number): string {
        const template = this._afterInside[id];
        return template ? pushIndentArray(template, depth) : '';
    }

    public getAfterOutsideTemplate(id: number, depth: number): string {
        const template = this._afterOutside[id];
        return template ? pushIndentArray(template, depth) : '';
    }

    public hasAppendProcessing(id?: number) {
        return id === undefined
            ? this._requireFormat
            : id in this._beforeOutside || id in this._beforeInside || id in this._afterInside || id in this._afterOutside;
    }

    public visibleElement(element: Element, pseudoElt?: string) {
        let style: CSSStyleDeclaration;
        let width: number, height: number;
        if (pseudoElt) {
            const parentElement = element.parentElement;
            style = parentElement ? getStyle(parentElement, pseudoElt) : getStyle(element);
            width = 1;
            height = 1;
        }
        else {
            style = getStyle(element);
            if (style.getPropertyValue('display') !== 'none') {
                const rect = actualClientRect(element, this.sessionId);
                if (!withinViewport(rect)) {
                    return false;
                }
                ({ width, height } = rect);
            }
            else {
                return false;
            }
        }
        if (width > 0 && height > 0) {
            return style.getPropertyValue('visibility') === 'visible' || !positionAbsolute(style);
        }
        else if (!pseudoElt && (iterateArray(element.children, (item: HTMLElement) => this.visibleElement(item)) === Infinity || element.tagName === 'IMG' && style.getPropertyValue('display') !== 'none')) {
            return true;
        }
        return !positionAbsolute(style) && (
            width > 0 && style.getPropertyValue('float') !== 'none' ||
            isString(pseudoElt) && style.getPropertyValue('clear') !== 'none' ||
            style.getPropertyValue('display') === 'block' && (parseInt(style.getPropertyValue('margin-top')) !== 0 || parseInt(style.getPropertyValue('margin-bottom')) !== 0)
        );
    }

    public evaluateNonStatic(documentRoot: T, cache: squared.base.NodeList<T>) {
        const altered = new Set<T>();
        const removed = new Set<T>();
        const escaped = new Map<T, { parent: T; appending: T[] }>();
        cache.each(node => {
            if (node.floating) {
                if (node.float === 'left') {
                    const actualParent = node.actualParent as T;
                    let parent: Null<T> = actualParent;
                    let previousParent: Undef<T>;
                    while (parent?.tagName === 'P' && !parent.documentRoot) {
                        previousParent = parent;
                        parent = parent.actualParent as Null<T>;
                    }
                    if (parent && previousParent && parent !== actualParent && parent.tagName === 'DIV') {
                        if (escaped.has(previousParent)) {
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
                switch (node.css('position')) {
                    case 'fixed':
                        if (!node.autoPosition) {
                            parent = documentRoot;
                            break;
                        }
                    case 'absolute': {
                        parent = absoluteParent;
                        if (node.autoPosition) {
                            if (!node.siblingsLeading.some(item => item.multiline || item.excluded && !item.blockStatic)) {
                                node.cssApply({ display: 'inline-block', verticalAlign: 'top' }, true);
                            }
                            else {
                                node.autoPosition = false;
                            }
                            parent = actualParent;
                        }
                        else if (this.userSettings.supportNegativeLeftTop) {
                            let outside = false;
                            while (parent && parent !== documentRoot && (!parent.rightAligned && !parent.centerAligned || !parent.pageFlow)) {
                                const linear = parent.linear;
                                if (!outside) {
                                    if (node.hasPX('top') && node.hasPX('bottom') || node.hasPX('left') && node.hasPX('right')) {
                                        break;
                                    }
                                    else {
                                        const overflowX = parent.css('overflowX') === 'hidden';
                                        const overflowY = parent.css('overflowY') === 'hidden';
                                        if (overflowX && overflowY) {
                                            break;
                                        }
                                        const outsideX = !overflowX && node.outsideX(linear);
                                        const outsideY = !overflowY && node.outsideY(linear);
                                        if (outsideX && (node.left < 0 || node.right > 0) || outsideY && (node.top < 0 || node.bottom !== 0)) {
                                            outside = true;
                                        }
                                        else if (!overflowX && ((node.left < 0 || node.right > 0) && Math.ceil(node.bounds.right) < linear.left || (node.left > 0 || node.right < 0) && Math.floor(node.bounds.left) > linear.right) && parent.some(item => item.pageFlow)) {
                                            outside = true;
                                        }
                                        else if (!overflowY && ((node.top < 0 || node.bottom > 0) && Math.ceil(node.bounds.bottom) < parent.bounds.top || (node.top > 0 || node.bottom < 0) && Math.floor(node.bounds.top) > parent.bounds.bottom)) {
                                            outside = true;
                                        }
                                        else if (outsideX && outsideY && (!parent.pageFlow || parent.actualParent!.documentRoot && (node.top > 0 || node.left > 0))) {
                                            outside = true;
                                        }
                                        else if (!overflowX && !overflowY && !node.intersectX(linear) && !node.intersectY(linear)) {
                                            outside = true;
                                        }
                                        else {
                                            break;
                                        }
                                    }
                                }
                                else if (parent.layoutElement) {
                                    parent = absoluteParent;
                                    break;
                                }
                                else if (node.withinX(linear) && node.withinY(linear)) {
                                    break;
                                }
                                parent = parent.actualParent as T;
                            }
                        }
                        break;
                    }
                }
                if (!parent) {
                    parent = documentRoot;
                }
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
                        node.unset('box');
                        node.unset('linear');
                    }
                    let opacity = node.toFloat('opacity', 1);
                    let current = actualParent;
                    do {
                        opacity *= current.toFloat('opacity', 1);
                        current = current.actualParent as T;
                    }
                    while (current && current !== parent);
                    node.css('opacity', opacity.toString());
                    node.parent = parent;
                    node.containerIndex = Infinity;
                    altered.add(parent);
                    removed.add(actualParent);
                }
                node.documentParent = parent;
            }
        });
        for (const node of removed) {
            node.each((item: T, index) => item.containerIndex = index);
        }
        for (const [previousParent, data] of escaped.entries()) {
            const { parent, appending } = data;
            const children = parent.children as T[];
            if (children.includes(previousParent)) {
                const actualParent = new Set<T>();
                const { childIndex, containerIndex } = previousParent;
                const documentChildren = parent.naturalChildren.slice(0);
                const target = children[containerIndex];
                const depth = parent.depth + 1;
                for (let i = 0, j = 0, k = 0, prepend = false; i < appending.length; ++i) {
                    const item = appending[i];
                    if (item.containerIndex === 0) {
                        prepend = true;
                    }
                    else if (prepend) {
                        const previous = appending[i - 1];
                        prepend = (item.containerIndex - previous.containerIndex === 1) && item.actualParent === previous.actualParent;
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
                    item.$parent = parent;
                    item.depth = depth;
                    item.documentParent = parent;
                    const clear = item.css('clear');
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
                                            (this.application as squared.base.ApplicationUI<T>).session.clearMap.set(item, clear);
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
                                        const clearBefore = sibling.css('clear');
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
                parent.each((item: T, index) => item.containerIndex = index);
                parent.floatContainer = true;
                const length = documentChildren.length;
                for (let i = 0; i < appending.length; ++i) {
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
                        for (let j = index + 1; j < length; ++j) {
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
                    let floating = false;
                    item.each((child: T, index) => {
                        if (child.floating) {
                            floating = true;
                        }
                        child.containerIndex = index;
                    });
                    if (!floating) {
                        item.floatContainer = false;
                    }
                }
            }
        }
        for (const node of altered) {
            const layers: Array<T[]> = [];
            let maxIndex = -1;
            node.each((item: T) => {
                if (item.containerIndex === Infinity) {
                    node.some((adjacent: T) => {
                        let valid = adjacent.naturalElements.includes(item);
                        if (!valid) {
                            const nested = adjacent.cascade();
                            valid = item.ascend({ condition: child => nested.includes(child) }).length > 0;
                        }
                        if (valid) {
                            safeNestedArray(layers, adjacent.containerIndex + (item.zIndex >= 0 || adjacent !== item.actualParent ? 1 : 0)).push(item);
                        }
                        return valid;
                    });
                }
                else if (item.containerIndex > maxIndex) {
                    maxIndex = item.containerIndex;
                }
            });
            const length = layers.length;
            if (length) {
                const children = node.children as T[];
                for (let i = 0, j = 0, k = 1; i < length; ++i, ++j) {
                    const order = layers[i];
                    if (order) {
                        order.sort((a, b) => {
                            if (a.parent === b.parent) {
                                const zA = a.zIndex, zB = b.zIndex;
                                if (zA === zB) {
                                    return a.id < b.id ? -1 : 1;
                                }
                                return zA < zB ? -1 : 1;
                            }
                            return 0;
                        })
                        .forEach(item => item.containerIndex = maxIndex + k++);
                        const q = children.length;
                        for (let l = 0; l < q; ++l) {
                            if (order.includes(children[l])) {
                                children[l] = undefined as any;
                            }
                        }
                        children.splice(j, 0, ...order);
                        j += order.length;
                    }
                }
                node.retainAs(flatArray(children));
            }
        }
    }

    public sortInitialCache(cache?: squared.base.NodeList<T>) {
        (cache || this.cache).sort((a, b) => {
            if (a.depth !== b.depth) {
                return a.depth < b.depth ? -1 : 1;
            }
            else {
                const parentA = a.documentParent, parentB = b.documentParent;
                if (parentA !== parentB) {
                    const depthA = parentA.depth, depthB = parentB.depth;
                    if (depthA !== depthB) {
                        return depthA < depthB ? -1 : 1;
                    }
                    else if (parentA.actualParent === parentB.actualParent) {
                        return parentA.childIndex < parentB.childIndex ? -1 : 1;
                    }
                    return parentA.id < parentB.id ? -1 : 1;
                }
            }
            return 0;
        });
    }

    public cascadeDocument(templates: NodeTemplate<T>[], depth: number) {
        const showAttributes = this.userSettings.showAttributes;
        const indent = '\t'.repeat(depth);
        let output = '';
        const length = templates.length;
        let i = 0;
        while (i < length) {
            const item = templates[i++];
            const node = item.node;
            switch (item.type) {
                case NODE_TEMPLATE.XML: {
                    const { controlName, attributes } = item as NodeXmlTemplate<T>;
                    const { id, renderTemplates } = node;
                    const next = depth + 1;
                    const previous = node.depth < 0 ? depth + node.depth : depth;
                    const beforeInside = this.getBeforeInsideTemplate(id, next);
                    const afterInside = this.getAfterInsideTemplate(id, next);
                    let template = indent + '<' +
                        controlName +
                        (depth === 0 ? '{#0}' : '') +
                        (showAttributes
                            ? attributes
                                ? pushIndent(attributes, next)
                                : node.extractAttributes(next)
                            : ''
                        );
                    if (renderTemplates || beforeInside !== '' || afterInside !== '') {
                        template += '>\n' +
                                    beforeInside +
                                    (renderTemplates ? this.cascadeDocument(this.sortRenderPosition(node, renderTemplates as NodeTemplate<T>[]), next) : '') +
                                    afterInside +
                                    indent + `</${controlName}>\n`;
                    }
                    else {
                        template += ' />\n';
                    }
                    output += this.getBeforeOutsideTemplate(id, previous) + template + this.getAfterOutsideTemplate(id, previous);
                    break;
                }
                case NODE_TEMPLATE.INCLUDE: {
                    const content = (item as NodeIncludeTemplate<T>).content;
                    if (content) {
                        output += pushIndent(content, depth);
                    }
                    break;
                }
            }
        }
        return output;
    }

    public getEnclosingXmlTag(controlName: string, attributes = '', content?: string) {
        return '<' + controlName + attributes + (content ? `>\n${content}</${controlName}>\n` : ' />\n');
    }

    private setElementDimension(element: Element, tagName: string, styleMap: StringMap, attr: string, opposing: string) {
        const dimension = styleMap[attr];
        if (!isString(dimension) || dimension === 'auto') {
            const match = new RegExp(`\\s+${attr}="([^"]+)"`).exec(element.outerHTML);
            if (match) {
                const value = match[1];
                if (isLength(value)) {
                    styleMap[attr] = value + 'px';
                }
                else if (isPercent(value)) {
                    styleMap[attr] = value;
                }
            }
            else if (tagName === 'IFRAME') {
                if (attr === 'width') {
                    styleMap.width = '300px';
                }
                else {
                    styleMap.height = '150px';
                }
            }
            else {
                const value = styleMap[opposing];
                if (value && isLength(value)) {
                    const attrMax = `max${capitalize(attr)}`;
                    if (!isString(styleMap[attrMax]) || !isPercent(attrMax)) {
                        const image = this.application.resourceHandler.getImage((element as HTMLImageElement).src);
                        if (image && image.width > 0 && image.height > 0) {
                            styleMap[attr] = formatPX(image[attr] * parseFloat(value) / image[opposing]);
                        }
                    }
                }
            }
        }
    }

    get generateSessionId() {
        return new Date().getTime().toString();
    }
}