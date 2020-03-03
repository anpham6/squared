import { ControllerUISettings, FileAsset, LayoutResult, LayoutType, NodeIncludeTemplate, NodeTemplate, NodeXmlTemplate, UserUISettings } from '../../@types/base/application';

import Controller from './controller';

import { NODE_TEMPLATE } from './lib/enumeration';

type NodeUI = squared.base.NodeUI;

const $lib = squared.lib;

const { USER_AGENT, isUserAgent, isWinEdge } = $lib.client;
const { BOX_BORDER, BOX_PADDING, formatPX, getStyle, isLength, isPercent } = $lib.css;
const { isTextNode, withinViewport } = $lib.dom;
const { capitalize, convertFloat, flatArray, iterateArray, safeNestedArray } = $lib.util;
const { actualClientRect, getElementCache, setElementCache } = $lib.session;
const { pushIndent, pushIndentArray } = $lib.xml;

function positionAbsolute(style: CSSStyleDeclaration) {
    switch (style.getPropertyValue('position')) {
        case 'absolute':
        case 'fixed':
            return true;
    }
    return false;
}

const getNumberValue = (style: CSSStyleDeclaration, attr: string) => parseInt(style.getPropertyValue(attr));

export default abstract class ControllerUI<T extends NodeUI> extends Controller<T> implements squared.base.ControllerUI<T> {
    public abstract readonly localSettings: ControllerUISettings;

    private _requireFormat = false;
    private _beforeOutside: ObjectIndex<string[]> = {};
    private _beforeInside: ObjectIndex<string[]> = {};
    private _afterInside: ObjectIndex<string[]> = {};
    private _afterOutside: ObjectIndex<string[]> = {};
    private _unsupportedCascade!: Set<string>;
    private _unsupportedTagName!: Set<string>;

    public abstract processUnknownParent(layout: squared.base.LayoutUI<T>): LayoutResult<T>;
    public abstract processUnknownChild(layout: squared.base.LayoutUI<T>): LayoutResult<T>;
    public abstract processTraverseHorizontal(layout: squared.base.LayoutUI<T>, siblings: T[]): squared.base.LayoutUI<T>;
    public abstract processTraverseVertical(layout: squared.base.LayoutUI<T>, siblings: T[]): squared.base.LayoutUI<T>;
    public abstract processLayoutHorizontal(layout: squared.base.LayoutUI<T>): squared.base.LayoutUI<T>;
    public abstract sortRenderPosition(parent: T, templates: NodeTemplate<T>[]): NodeTemplate<T>[];
    public abstract renderNode(layout: squared.base.LayoutUI<T>): Undef<NodeTemplate<T>>;
    public abstract renderNodeGroup(layout: squared.base.LayoutUI<T>): Undef<NodeTemplate<T>>;
    public abstract setConstraints(): void;
    public abstract optimize(nodes: T[]): void;
    public abstract finalize(layouts: FileAsset[]): void;
    public abstract createNodeGroup(node: T, children: T[], parent?: T, traverse?: boolean): T;

    public abstract get userSettings(): UserUISettings;
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

    public reset() {
        this._requireFormat = false;
        this._beforeOutside = {};
        this._beforeInside = {};
        this._afterInside = {};
        this._afterOutside = {};
    }

    public preventNodeCascade(element: Element) {
        return this._unsupportedCascade.has(element.tagName);
    }

    public applyDefaultStyles(element: Element) {
        const sessionId = this.sessionId;
        let styleMap: StringMap;
        if (isTextNode(element)) {
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
            const setBorderStyle = () => {
                if (styleMap.border === undefined && checkBorderAttribute()) {
                    const inputBorderColor = this.localSettings.style.inputBorderColor;
                    styleMap.border = `outset 1px ${inputBorderColor}`;
                    for (let i = 0; i < 4; i++) {
                        const border = BOX_BORDER[i];
                        styleMap[border[0]] = 'outset';
                        styleMap[border[1]] = '1px';
                        styleMap[border[2]] = inputBorderColor;
                    }
                    return true;
                }
                return false;
            };
            const setButtonStyle = (applied: boolean) => {
                if (applied) {
                    const backgroundColor = styleMap.backgroundColor;
                    if (backgroundColor === undefined || backgroundColor === 'initial') {
                        styleMap.backgroundColor = this.localSettings.style.inputBackgroundColor;
                    }
                }
                if (styleMap.textAlign === undefined) {
                    styleMap.textAlign = 'center';
                }
                if (styleMap.padding === undefined && !BOX_PADDING.some(attr => !!styleMap[attr])) {
                    styleMap.paddingTop = '2px';
                    styleMap.paddingRight = '6px';
                    styleMap.paddingBottom = '3px';
                    styleMap.paddingLeft = '6px';
                }
            };
            const checkBorderAttribute = () => !(BOX_BORDER[0][0] in styleMap || BOX_BORDER[1][0] in styleMap || BOX_BORDER[2][0] in styleMap || BOX_BORDER[3][0] in styleMap);
            const tagName = element.tagName;
            if (isUserAgent(USER_AGENT.FIREFOX)) {
                switch (tagName) {
                    case 'INPUT':
                    case 'SELECT':
                    case 'BUTTON':
                    case 'TEXTAREA':
                        if (styleMap.display === undefined) {
                            styleMap.display = 'inline-block';
                        }
                        break;
                    case 'FIELDSET':
                        if (styleMap.display === undefined) {
                            styleMap.display = 'block';
                        }
                        break;
                }
            }
            else if (isWinEdge()) {
                switch (tagName) {
                    case 'INPUT':
                        switch ((<HTMLInputElement> element).type) {
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
                                if (styleMap.fontSize === undefined) {
                                    styleMap.fontSize = '13.3333px';
                                }
                                break;
                        }
                        break;
                    case 'CODE':
                        if (styleMap.fontFamily === undefined) {
                            styleMap.fontFamily = 'monospace';
                        }
                        break;
                    case 'LEGEND':
                    case 'RT':
                        if (styleMap.display === undefined) {
                            styleMap.display = 'block';
                        }
                        break;
                }
            }
            switch (tagName) {
                case 'INPUT': {
                    const type = (<HTMLInputElement> element).type;
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
                            const result = setBorderStyle();
                            switch (type) {
                                case 'file':
                                case 'reset':
                                case 'submit':
                                case 'button':
                                    setButtonStyle(result);
                                    break;
                            }
                            break;
                        }
                    }
                    break;
                }
                case 'BUTTON':
                    setButtonStyle(setBorderStyle());
                    break;
                case 'TEXTAREA':
                case 'SELECT':
                    setBorderStyle();
                    break;
                case 'BODY': {
                    const backgroundColor = styleMap.backgroundColor;
                    if (backgroundColor === undefined || backgroundColor === 'initial') {
                        styleMap.backgroundColor = 'rgb(255, 255, 255)';
                    }
                    break;
                }
                case 'FORM':
                    if (styleMap.marginTop === undefined) {
                        styleMap.marginTop = '0px';
                    }
                    break;
                case 'LI':
                    if (styleMap.listStyleImage === undefined) {
                        const style = getStyle(element);
                        styleMap.listStyleImage = style.getPropertyValue('list-style-image');
                    }
                    break;
                case 'IFRAME':
                    if (styleMap.display === undefined) {
                        styleMap.display = 'block';
                    }
                case 'IMG': {
                    const setDimension = (attr: string, opposing: string) => {
                        const dimension = styleMap[attr];
                        if (dimension === undefined || dimension === 'auto') {
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
                                    const attrMax = 'max' + capitalize(attr);
                                    if (styleMap[attrMax] === undefined || !isPercent(attrMax)) {
                                        const image = this.application.resourceHandler.getImage((<HTMLImageElement> element).src);
                                        if (image && image.width > 0 && image.height > 0) {
                                            styleMap[attr] = formatPX(image[attr] * parseFloat(value) / image[opposing]);
                                        }
                                    }
                                }
                            }
                        }
                    };
                    setDimension('width', 'height');
                    setDimension('height', 'width');
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
        return id === undefined ? this._requireFormat : (id in this._beforeOutside || id in this._beforeInside || id in this._afterInside || id in this._afterOutside);
    }

    public includeElement(element: Element) {
        return !(this._unsupportedTagName.has(element.tagName) || element.tagName === 'INPUT' && this._unsupportedTagName.has(element.tagName + ':' + (<HTMLInputElement> element).type)) || (<HTMLElement> element).contentEditable === 'true';
    }

    public visibleElement(element: Element, pseudoElt?: string) {
        let style: CSSStyleDeclaration;
        let width: number;
        let height: number;
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
        else if (!pseudoElt) {
            if (iterateArray(element.children, (item: HTMLElement) => this.visibleElement(item)) === Number.POSITIVE_INFINITY) {
                return true;
            }
            if (element.tagName === 'IMG' && style.getPropertyValue('display') !== 'none') {
                return true;
            }
        }
        if (!positionAbsolute(style)) {
            return (
                width > 0 && style.getPropertyValue('float') !== 'none' ||
                !!pseudoElt && style.getPropertyValue('clear') !== 'none' ||
                style.getPropertyValue('display') === 'block' && (getNumberValue(style, 'margin-top') !== 0 || getNumberValue(style, 'margin-bottom') !== 0)
            );
        }
        return false;
    }

    public evaluateNonStatic(documentRoot: T, cache: squared.base.NodeList<T>) {
        const altered = new Set<T>();
        for (const node of cache) {
            if (!node.documentRoot) {
                const actualParent = node.parent as T;
                let parent: Undef<T>;
                switch (node.css('position')) {
                    case 'fixed':
                        if (!node.autoPosition) {
                            parent = documentRoot;
                            break;
                        }
                    case 'absolute': {
                        const absoluteParent = node.absoluteParent as T;
                        if (absoluteParent) {
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
                                            else if (!overflowX && (node.left < 0 || node.right > 0) && Math.floor(node.bounds.right) < linear.left || !overflowY && (node.top < 0 || node.bottom > 0) && Math.floor(node.bounds.bottom) < linear.top) {
                                                outside = true;
                                            }
                                            else if (outsideX && outsideY && (!parent.pageFlow || (parent.actualParent as T).documentRoot) && (node.top > 0 || node.left > 0)) {
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
                        }
                        break;
                    }
                }
                if (parent === undefined) {
                    parent = !node.pageFlow ? documentRoot : actualParent;
                }
                if (parent !== actualParent) {
                    const absoluteParent = node.absoluteParent as T;
                    if (absoluteParent?.positionRelative && parent !== absoluteParent) {
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
                    node.containerIndex = Number.POSITIVE_INFINITY;
                    altered.add(parent);
                }
                node.documentParent = parent;
            }
        }
        for (const node of altered) {
            const layers: Array<T[]> = [];
            let maxIndex = -1;
            node.each((item: T) => {
                if (item.containerIndex === Number.POSITIVE_INFINITY) {
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
                for (let i = 0, j = 0, k = 1; i < length; i++, j++) {
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
                            item.containerIndex = maxIndex + k++;
                        }
                        const q = children.length;
                        for (let l = 0; l < q; l++) {
                            if (order.includes(children[l])) {
                                children[l] = undefined as any;
                            }
                        }
                        children.splice(j, 0, ...order);
                        j += order.length;
                    }
                }
                node.retain(flatArray(children));
            }
        }
    }

    public sortInitialCache(cache?: squared.base.NodeList<T>) {
        (cache || this.cache).sort((a, b) => {
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

    public cascadeDocument(templates: NodeTemplate<T>[], depth: number) {
        const showAttributes = this.userSettings.showAttributes;
        const indent = '\t'.repeat(depth);
        let output = '';
        for (const item of templates) {
            const node = item.node;
            switch (item.type) {
                case NODE_TEMPLATE.XML: {
                    const { controlName, attributes } = <NodeXmlTemplate<T>> item;
                    const { id, renderTemplates } = node;
                    const depthA = depth + 1;
                    const beforeInside = this.getBeforeInsideTemplate(id, depthA);
                    const afterInside = this.getAfterInsideTemplate(id, depthA);
                    let template = indent + `<${controlName + (depth === 0 ? '{#0}' : '') + (showAttributes ? (attributes ? pushIndent(attributes, depthA) : node.extractAttributes(depthA)) : '')}`;
                    if (renderTemplates || beforeInside !== '' || afterInside !== '') {
                        template += '>\n' +
                                    beforeInside +
                                    (renderTemplates ? this.cascadeDocument(this.sortRenderPosition(node, <NodeTemplate<T>[]> renderTemplates), depthA) : '') +
                                    afterInside +
                                    indent + `</${controlName}>\n`;
                    }
                    else {
                        template += ' />\n';
                    }
                    output += this.getBeforeOutsideTemplate(id, depth) + template + this.getAfterOutsideTemplate(id, depth);
                    break;
                }
                case NODE_TEMPLATE.INCLUDE: {
                    const content = (<NodeIncludeTemplate<T>> item).content;
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

    get generateSessionId() {
        return new Date().getTime().toString();
    }
}