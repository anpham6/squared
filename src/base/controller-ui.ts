import Controller from './controller';
import NodeUI from './node-ui';

import { NODE_TEMPLATE } from './lib/enumeration';

const { USER_AGENT, isUserAgent } = squared.lib.client;
const { CSS_PROPERTIES, formatPX, getStyle, hasCoords, isLength, isPercent } = squared.lib.css;
const { withinViewport } = squared.lib.dom;
const { getElementCache, setElementCache } = squared.lib.session;
const { capitalize, convertFloat, iterateArray, joinArray } = squared.lib.util;

const BORDER_TOP = CSS_PROPERTIES.borderTop.value as string[];
const BORDER_RIGHT = CSS_PROPERTIES.borderRight.value as string[];
const BORDER_BOTTOM = CSS_PROPERTIES.borderBottom.value as string[];
const BORDER_LEFT = CSS_PROPERTIES.borderLeft.value as string[];

const BOX_BORDER = [BORDER_TOP, BORDER_RIGHT, BORDER_BOTTOM, BORDER_LEFT];

function setBorderStyle(styleMap: StringMap, defaultColor: string) {
    if (!styleMap.border && !(BORDER_TOP[0] in styleMap || BORDER_RIGHT[0] in styleMap || BORDER_BOTTOM[0] in styleMap || BORDER_LEFT[0] in styleMap)) {
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
        if (!backgroundColor || backgroundColor === 'initial') {
            styleMap.backgroundColor = defaultColor;
        }
    }
    if (!styleMap.textAlign) {
        styleMap.textAlign = 'center';
    }
    if (!styleMap.padding && !(CSS_PROPERTIES.padding.value as string[]).some(attr => !!styleMap[attr])) {
        styleMap.paddingTop = '2px';
        styleMap.paddingRight = '6px';
        styleMap.paddingBottom = '3px';
        styleMap.paddingLeft = '6px';
    }
}

function pushIndent(value: string, depth: number, char = '\t', indent?: string) {
    if (depth > 0) {
        if (indent === undefined) {
            indent = char.repeat(depth);
        }
        return joinArray(value.split('\n'), line => line !== '' ? indent + line : '');
    }
    return value;
}

function pushIndentArray(values: string[], depth: number, char = '\t', separator = '') {
    if (depth > 0) {
        let result = '';
        const indent = char.repeat(depth);
        const length = values.length;
        let i = 0;
        while (i < length) {
            result += (i > 0 ? separator : '') + pushIndent(values[i++], depth, char, indent);
        }
        return result;
    }
    return values.join(separator);
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
    private _settingsStyle!: ControllerSettingsStyleUI;

    public abstract processUnknownParent(layout: squared.base.LayoutUI<T>): squared.base.LayoutUI<T>;
    public abstract processUnknownChild(layout: squared.base.LayoutUI<T>): squared.base.LayoutUI<T>;
    public abstract processTraverseHorizontal(layout: squared.base.LayoutUI<T>, siblings: T[]): Undef<squared.base.LayoutUI<T>>;
    public abstract processTraverseVertical(layout: squared.base.LayoutUI<T>, siblings: T[]): Undef<squared.base.LayoutUI<T>>;
    public abstract processLayoutHorizontal(layout: squared.base.LayoutUI<T>): squared.base.LayoutUI<T>;
    public abstract createNodeGroup(node: T, children: T[], parent?: T, options?: CreateNodeGroupUIOptions<T>): T;
    public abstract renderNode(layout: squared.base.LayoutUI<T>): Undef<NodeTemplate<T>>;
    public abstract renderNodeGroup(layout: squared.base.LayoutUI<T>): Undef<NodeTemplate<T>>;
    public abstract sortRenderPosition(parent: T, templates: NodeTemplate<T>[]): NodeTemplate<T>[];
    public abstract setConstraints(cache: squared.base.NodeList<T>): void;
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
        this._settingsStyle = this.localSettings.style;
    }

    public preventNodeCascade(node: T) {
        return this._unsupportedCascade.has(node.tagName);
    }

    public includeElement(element: HTMLElement) {
        const tagName = element.tagName;
        return !(this._unsupportedTagName.has(tagName) || tagName === 'INPUT' && this._unsupportedTagName.has(tagName + ':' + (element as HTMLInputElement).type)) || element.contentEditable === 'true';
    }

    public reset() {
        this._requireFormat = false;
        this._beforeOutside = {};
        this._beforeInside = {};
        this._afterInside = {};
        this._afterOutside = {};
    }

    public applyDefaultStyles(element: Element, sessionId: string) {
        let styleMap: StringSafeMap;
        if (element.nodeName === '#text') {
            styleMap = {
                position: 'static',
                display: 'inline',
                verticalAlign: 'baseline',
                float: 'none'
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
                        if (!styleMap.display) {
                            styleMap.display = 'inline-block';
                        }
                        break;
                    case 'FIELDSET':
                        if (!styleMap.display) {
                            styleMap.display = 'block';
                        }
                        break;
                }
            }
            switch (tagName) {
                case 'A':
                    if (!styleMap.color) {
                        styleMap.color = this._settingsStyle.anchorFontColor;
                    }
                    break;
                case 'INPUT': {
                    if (!styleMap.fontSize) {
                        styleMap.fontSize = this._settingsStyle.formFontSize;
                    }
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
                            const result = setBorderStyle(styleMap, this._settingsStyle.inputBorderColor);
                            switch (type) {
                                case 'file':
                                case 'reset':
                                case 'submit':
                                case 'button':
                                    setButtonStyle(styleMap, result, this._settingsStyle.inputBackgroundColor);
                                    break;
                            }
                            break;
                        }
                    }
                    break;
                }
                case 'BUTTON':
                    if (!styleMap.fontSize) {
                        styleMap.fontSize = this._settingsStyle.formFontSize;
                    }
                    setButtonStyle(styleMap, setBorderStyle(styleMap, this._settingsStyle.inputBorderColor), this._settingsStyle.inputBackgroundColor);
                    break;
                case 'TEXTAREA':
                case 'SELECT':
                    if (!styleMap.fontSize) {
                        styleMap.fontSize = this._settingsStyle.formFontSize;
                    }
                    setBorderStyle(styleMap, this._settingsStyle.inputBorderColor);
                    break;
                case 'BODY': {
                    const backgroundColor = styleMap.backgroundColor;
                    if (!backgroundColor || backgroundColor === 'initial') {
                        styleMap.backgroundColor = 'rgb(255, 255, 255)';
                    }
                    break;
                }
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
                    if (!styleMap.fontSize) {
                        styleMap.fontSize = '1.5em';
                    }
                    break;
                case 'H3':
                    if (!styleMap.fontSize) {
                        styleMap.fontSize = '1.17em';
                    }
                    break;
                case 'H4':
                    if (!styleMap.fontSize) {
                        styleMap.fontSize = '1em';
                    }
                    break;
                case 'H5':
                    if (!styleMap.fontSize) {
                        styleMap.fontSize = '0.83em';
                    }
                    break;
                case 'H6':
                    if (!styleMap.fontSize) {
                        styleMap.fontSize = '0.67em';
                    }
                    break;
                case 'FORM':
                    if (!styleMap.marginTop) {
                        styleMap.marginTop = '0px';
                    }
                    break;
                case 'LI':
                    if (!styleMap.listStyleImage) {
                        styleMap.listStyleImage = 'inherit';
                    }
                    break;
                case 'SUP':
                case 'SUB':
                case 'SMALL':
                    if (!styleMap.fontSize) {
                        styleMap.fontSize = 'smaller';
                    }
                    break;
                case 'RT':
                    if (!styleMap.fontSize && element.parentElement!.tagName === 'RUBY') {
                        styleMap.fontSize = '50%';
                    }
                    break;
                case 'IFRAME':
                    if (!styleMap.display) {
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
        const template = this._beforeOutside[id] ?? (this._beforeOutside[id] = []);
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
        const template = this._beforeInside[id] ?? (this._beforeInside[id] = []);
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
        const template = this._afterInside[id] ?? (this._afterInside[id] = []);
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
        const template = this._afterOutside[id] ?? (this._afterOutside[id] = []);
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

    public visibleElement(element: HTMLElement, sessionId: string, pseudoElt?: string) {
        let style: CSSStyleDeclaration,
            width: number,
            height: number;
        if (pseudoElt) {
            const parentElement = element.parentElement;
            style = parentElement ? getStyle(parentElement, pseudoElt) : getStyle(element);
            width = 1;
            height = 1;
        }
        else {
            style = getStyle(element);
            if (style.getPropertyValue('display') !== 'none') {
                const rect = element.getBoundingClientRect();
                if (!withinViewport(rect)) {
                    return false;
                }
                ({ width, height } = rect);
                setElementCache(element, 'clientRect', sessionId, rect);
            }
            else {
                return false;
            }
        }
        if (width > 0 && height > 0) {
            return style.getPropertyValue('visibility') === 'visible' || !hasCoords(style.getPropertyValue('position'));
        }
        else if (!pseudoElt && (element.tagName === 'IMG' && style.getPropertyValue('display') !== 'none' || iterateArray(element.children, (item: HTMLElement) => this.visibleElement(item, sessionId)) === Infinity)) {
            return true;
        }
        return !hasCoords(style.getPropertyValue('position')) && (
            width > 0 && style.getPropertyValue('float') !== 'none' ||
            pseudoElt && style.getPropertyValue('clear') !== 'none' ||
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
                    let parent: Null<T> = actualParent,
                        previousParent: Undef<T>;
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
                        if (node.autoPosition) {
                            if (!node.siblingsLeading.some(item => item.multiline || item.excluded && !item.blockStatic)) {
                                node.cssApply({ display: 'inline-block', verticalAlign: 'top' }, true);
                            }
                            else {
                                node.autoPosition = false;
                            }
                            parent = actualParent;
                        }
                        else {
                            parent = absoluteParent;
                            if (this.userSettings.supportNegativeLeftTop && !(node.hasPX('top') && node.hasPX('bottom') || node.hasPX('left') && node.hasPX('right'))) {
                                let outside: Undef<boolean>;
                                while (parent && parent.bounds.height > 0) {
                                    if (parent.layoutElement) {
                                        parent = absoluteParent;
                                        break;
                                    }
                                    else if (parent !== documentRoot && (!parent.rightAligned && !parent.centerAligned || !parent.pageFlow)) {
                                        const linear = parent.linear;
                                        if (!outside) {
                                            const overflowX = parent.css('overflowX') === 'hidden';
                                            const overflowY = parent.css('overflowY') === 'hidden';
                                            if (overflowX && overflowY) {
                                                break;
                                            }
                                            const outsideX = !overflowX && node.outsideX(linear);
                                            const outsideY = !overflowY && node.outsideY(linear);
                                            if (outsideX && (node.left < 0 || node.right > 0) ||
                                                outsideY && (node.top < 0 || node.bottom !== 0) ||
                                                outsideX && outsideY && (!parent.pageFlow || parent.actualParent!.documentRoot && (node.top > 0 || node.left > 0)) ||
                                                !overflowX && ((node.left < 0 || node.right > 0) && Math.ceil(node.bounds.right) < linear.left || (node.left > 0 || node.right < 0) && Math.floor(node.bounds.left) > linear.right) && parent.some(item => item.pageFlow) ||
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
                    let opacity = node.toFloat('opacity', 1),
                        current = actualParent;
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
                    item.init(parent, depth);
                    item.documentParent = parent;
                    const clear = item.css('clear');
                    switch (clear) {
                        case 'left':
                        case 'right':
                        case 'both':
                            notFound: {
                                let clearing: Undef<string>;
                                let n = l - 1;
                                while (n >= 0) {
                                    const sibling = documentChildren[n--];
                                    if (sibling.floating) {
                                        const float = sibling.float;
                                        if (clear === 'both' || float === clear) {
                                            (this.application as squared.base.ApplicationUI<T>).clearMap.set(item, clear);
                                            let nextSibling = item.nextElementSibling as Null<T>;
                                            while (nextSibling !== null) {
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
                let i = 0, j: number;
                while (i < appending.length) {
                    const item = appending[i++];
                    const index = documentChildren.findIndex(child => child === item);
                    if (index !== -1) {
                        const siblingsLeading: T[] = [];
                        const siblingsTrailing: T[] = [];
                        j = index - 1;
                        while (j >= 0) {
                            const sibling = documentChildren[j--] as T;
                            siblingsLeading.push(sibling);
                            if (!sibling.excluded) {
                                break;
                            }
                        }
                        j = index + 1;
                        while (j < length) {
                            const sibling = documentChildren[j++] as T;
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
                    let floating: Undef<boolean>;
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
                            const index = adjacent.containerIndex + (item.zIndex >= 0 || adjacent !== item.actualParent ? 1 : 0);
                            (layers[index] ?? (layers[index] = [])).push(item);
                        }
                        return valid;
                    });
                }
                else if (item.containerIndex > maxIndex) {
                    maxIndex = item.containerIndex;
                }
            });
            const length = layers.length;
            if (length > 0) {
                let children: T[] = [];
                for (let i = 0, j = 1; i < length; ++i) {
                    const order = layers[i];
                    if (order) {
                        order.sort((a, b) => {
                            if (a.parent === b.parent) {
                                const zA = a.zIndex;
                                const zB = b.zIndex;
                                if (zA === zB) {
                                    return a.id < b.id ? -1 : 1;
                                }
                                return zA < zB ? -1 : 1;
                            }
                            return 0;
                        });
                        for (const item of order) {
                            item.containerIndex = maxIndex + j++;
                        }
                        children = children.concat(order);
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

    public sortInitialCache(cache: squared.base.NodeList<T>) {
        cache.sort((a, b) => {
            if (a.depth !== b.depth) {
                return a.depth < b.depth ? -1 : 1;
            }
            else {
                const parentA = a.documentParent;
                const parentB = b.documentParent;
                if (parentA !== parentB) {
                    const depthA = parentA.depth;
                    const depthB = parentB.depth;
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

    public cascadeDocument(templates: NodeTemplate<T>[], depth: number, showAttributes: boolean) {
        const indent = '\t'.repeat(depth);
        let output = '';
        const length = templates.length;
        let i = 0;
        while (i < length) {
            const item = templates[i++];
            switch (item.type) {
                case NODE_TEMPLATE.XML: {
                    const { node, controlName, attributes } = item as NodeXmlTemplate<T>;
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
                                    (renderTemplates ? this.cascadeDocument(this.sortRenderPosition(node, renderTemplates as NodeTemplate<T>[]), next, showAttributes) : '') +
                                    afterInside +
                                    indent + `</${controlName}>\n`;
                    }
                    else {
                        template += ' />\n';
                    }
                    output += this.getBeforeOutsideTemplate(id, previous) + template + this.getAfterOutsideTemplate(id, previous);
                    break;
                }
                case NODE_TEMPLATE.INCLUDE:
                    output += pushIndent((item as NodeIncludeTemplate<T>).content, depth);
                    break;
            }
        }
        return output;
    }

    public getEnclosingXmlTag(controlName: string, attributes = '', content?: string) {
        return '<' + controlName + attributes + (content ? `>\n${content}</${controlName}>\n` : ' />\n');
    }

    private setElementDimension(element: Element, tagName: string, styleMap: StringMap, attr: string, opposing: string) {
        const dimension = styleMap[attr];
        if (!dimension || dimension === 'auto') {
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
            else if (element.clientWidth === 300 && element.clientHeight === 150) {
                if (attr === 'width') {
                    styleMap.width = '300px';
                }
                else {
                    styleMap.height = '150px';
                }
            }
            else {
                const image = this.application.resourceHandler?.getImage((element as HTMLImageElement).src);
                if (image && image.width > 0 && image.height > 0) {
                    const value = styleMap[opposing];
                    if (value && isLength(value)) {
                        const attrMax = `max${capitalize(attr)}`;
                        if (!styleMap[attrMax] || !isPercent(attrMax)) {
                            styleMap[attr] = formatPX(image[attr] * parseFloat(value) / image[opposing]);
                        }
                    }
                }
            }
        }
    }
}