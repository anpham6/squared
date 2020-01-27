import { ControllerUISettings, FileAsset, LayoutResult, LayoutType, NodeIncludeTemplate, NodeTemplate, NodeXmlTemplate, UserUISettings } from '../../@types/base/application';

import Controller from './controller';

import { NODE_TEMPLATE } from './lib/enumeration';

const $lib = squared.lib;
const { USER_AGENT, isUserAgent } = $lib.client;
const { BOX_BORDER, BOX_PADDING, formatPX, getStyle, isLength, isPercent } = $lib.css;
const { isTextNode } = $lib.dom;
const { capitalize, convertFloat, flatArray } = $lib.util;
const { actualClientRect, getElementCache, setElementCache } = $lib.session;
const { pushIndent, pushIndentArray } = $lib.xml;

type NodeUI = squared.base.NodeUI;

const withinViewport = (rect: DOMRect | ClientRect) => !(rect.top + window.scrollY + rect.height < 0 || rect.left + window.scrollX + rect.width < 0);

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
    public abstract renderNode(layout: squared.base.LayoutUI<T>): NodeTemplate<T> | undefined;
    public abstract renderNodeGroup(layout: squared.base.LayoutUI<T>): NodeTemplate<T> | undefined;
    public abstract setConstraints(): void;
    public abstract optimize(nodes: T[]): void;
    public abstract finalize(layouts: FileAsset[]): void;
    public abstract createNodeGroup(node: T, children: T[], parent?: T, traverse?: boolean): T;

    public abstract get userSettings(): UserUISettings;
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
                if (styleMap.border === undefined && checkBorderAttribute(0)) {
                    const inputBorderColor = this.localSettings.style.inputBorderColor;
                    styleMap.border = 'outset 1px ' + inputBorderColor;
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
            const setButtonStyle = (appliedBorder: boolean) => {
                if (appliedBorder) {
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
            const checkBorderAttribute = (index: number) => !(styleMap[BOX_BORDER[0][index]] || styleMap[BOX_BORDER[1][index]] || styleMap[BOX_BORDER[2][index]] || styleMap[BOX_BORDER[3][index]]);
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
        let template = this._beforeOutside[id];
        if (template === undefined) {
            template = [];
            this._beforeOutside[id] = template;
        }
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
        let template = this._beforeInside[id];
        if (template === undefined) {
            template = [];
            this._beforeInside[id] = template;
        }
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
        let template = this._afterInside[id];
        if (template === undefined) {
            template = [];
            this._afterInside[id] = template;
        }
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
        let template = this._afterOutside[id];
        if (template === undefined) {
            template = [];
            this._afterOutside[id] = template;
        }
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

    public visibleElement(element: Element) {
        const rect = actualClientRect(element, this.sessionId);
        if (withinViewport(rect)) {
            const style = getStyle(element);
            if (rect.width > 0 && rect.height > 0) {
                if (style.getPropertyValue('visibility') === 'visible') {
                    return true;
                }
                const position = style.getPropertyValue('position');
                return position !== 'absolute' && position !== 'fixed';
            }
            return element.tagName === 'IMG' && style.getPropertyValue('display') !== 'none' ||
                rect.width > 0 && style.getPropertyValue('float') !== 'none' ||
                style.getPropertyValue('clear') !== 'none' ||
                style.getPropertyValue('display') === 'block' && (parseInt(style.getPropertyValue('margin-top')) !== 0 || parseInt(style.getPropertyValue('margin-bottom')) !== 0) ||
                element.className === '__squared.pseudo';
        }
        return false;
    }

    public evaluateNonStatic(documentRoot: T, cache: squared.base.NodeList<T>) {
        const altered = new Set<T>();
        for (const node of cache) {
            if (!node.documentRoot) {
                const actualParent = node.parent as T;
                const absoluteParent = node.absoluteParent as T;
                let parent: T | undefined;
                switch (node.css('position')) {
                    case 'relative':
                        if (!actualParent.layoutElement && node === actualParent.lastChild) {
                            let valid = false;
                            const box = actualParent.box;
                            if (node.outsideX(box)) {
                                if (!actualParent.hasPX('width') || actualParent.css('overflowX') === 'hidden') {
                                    continue;
                                }
                                valid = true;
                            }
                            if (node.outsideY(box)) {
                                if (!actualParent.hasHeight && !actualParent.hasPX('height') || actualParent.css('overflowY') === 'hidden') {
                                    continue;
                                }
                                valid = true;
                            }
                            if (valid) {
                                parent = actualParent.actualParent as T;
                                do {
                                    if (node.withinX(parent.box) && node.withinY(parent.box) || parent.css('overflow') === 'hidden') {
                                        break;
                                    }
                                    parent = parent.actualParent as T;
                                }
                                while (parent && parent !== documentRoot);
                                if (parent) {
                                    node.css('position', 'absolute', true);
                                    node.setBounds(false);
                                }
                            }
                        }
                        break;
                    case 'fixed':
                        if (!node.positionAuto) {
                            parent = documentRoot;
                            break;
                        }
                    case 'absolute':
                        if (absoluteParent) {
                            parent = absoluteParent;
                            if (node.positionAuto) {
                                if (!node.siblingsLeading.some(item => item.multiline || item.excluded && !item.blockStatic)) {
                                    node.cssApply({ display: 'inline-block', verticalAlign: 'top' }, true);
                                }
                                else {
                                    node.positionAuto = false;
                                }
                                parent = actualParent;
                            }
                            else if (this.userSettings.supportNegativeLeftTop) {
                                const box = parent.box;
                                let outside = false;
                                while (parent && parent !== documentRoot) {
                                    if (!outside) {
                                        const overflowX = parent.css('overflowX') === 'hidden';
                                        const overflowY = parent.css('overflowY') === 'hidden';
                                        if (overflowX && overflowY || parseFloat(node.cssInitial('top')) === 0 || parseFloat(node.cssInitial('right')) === 0 || parseFloat(node.cssInitial('bottom')) === 0 || parseFloat(node.cssInitial('left')) === 0) {
                                            break;
                                        }
                                        else {
                                            const outsideX = !overflowX && node.outsideX(box);
                                            const outsideY = !overflowY && node.outsideY(box);
                                            if (!overflowY && node.linear.top < Math.floor(box.top) && (node.top < 0 || node.marginTop < 0)) {
                                                outside = true;
                                            }
                                            else if (outsideX && !node.hasPX('left') && node.right > 0 || outsideY && !node.hasPX('top') && node.bottom !== 0) {
                                                outside = true;
                                            }
                                            else if (outsideX && outsideY && (!parent.pageFlow || (parent.actualParent as T).documentBody) && (node.top > 0 || node.left > 0)) {
                                                outside = true;
                                            }
                                            else if (!overflowX && node.outsideX(parent.linear) && !node.pseudoElement && (node.left < 0 || node.marginLeft < 0 || !node.hasPX('left') && node.right < 0 && node.linear.left >= parent.linear.right)) {
                                                outside = true;
                                            }
                                            else if (!overflowX && !overflowY && !node.intersectX(box) && !node.intersectY(box)) {
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
                                    else if (node.withinX(box) && node.withinY(box)) {
                                        break;
                                    }
                                    parent = parent.actualParent as T;
                                }
                            }
                        }
                        break;
                }
                if (parent === undefined) {
                    parent = !node.pageFlow ? documentRoot : actualParent;
                }
                if (parent !== actualParent) {
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
                    while (current && current !== parent) {
                        opacity *= current.toFloat('opacity', 1);
                        current = current.actualParent as T;
                    }
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
                    for (const adjacent of node.children as T[]) {
                        let valid = adjacent.naturalElements.includes(item);
                        if (!valid) {
                            const nested = adjacent.cascade();
                            valid = item.ascend({ condition: child => nested.includes(child) }).length > 0;
                        }
                        if (valid) {
                            const index = adjacent.containerIndex + (item.zIndex >= 0 || adjacent !== item.actualParent ? 1 : 0);
                            let layer = layers[index];
                            if (layer === undefined) {
                                layer = [];
                                layers[index] = layer;
                            }
                            layer.push(item);
                            break;
                        }
                    }
                }
                else if (item.containerIndex > maxIndex) {
                    maxIndex = item.containerIndex;
                }
            });
            const length = layers.length;
            if (length) {
                const children = node.children as T[];
                for (let j = 0, k = 0, l = 1; j < length; j++, k++) {
                    const order = layers[j];
                    if (order) {
                        order.sort((a, b) => {
                            if (a.parent === b.parent) {
                                if (a.zIndex === b.zIndex) {
                                    return a.id < b.id ? -1 : 1;
                                }
                                return a.zIndex < b.zIndex ? -1 : 1;
                            }
                            return 0;
                        });
                        for (const item of order) {
                            item.containerIndex = maxIndex + l++;
                        }
                        for (let m = 0; m < children.length; m++) {
                            if (order.includes(children[m])) {
                                children[m] = undefined as any;
                            }
                        }
                        children.splice(k, 0, ...order);
                        k += order.length;
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
        const indent = depth > 0 ? '\t'.repeat(depth) : '';
        let output = '';
        for (const item of templates) {
            if (item) {
                const node = item.node;
                switch (item.type) {
                    case NODE_TEMPLATE.XML: {
                        const { controlName, attributes } = <NodeXmlTemplate<T>> item;
                        const { id, renderTemplates } = node;
                        const renderDepth = depth + 1;
                        const beforeInside = this.getBeforeInsideTemplate(id, renderDepth);
                        const afterInside = this.getAfterInsideTemplate(id, renderDepth);
                        let template = indent + `<${controlName + (depth === 0 ? '{#0}' : '') + (showAttributes ? (attributes ? pushIndent(attributes, renderDepth) : node.extractAttributes(renderDepth)) : '')}`;
                        if (renderTemplates || beforeInside !== '' || afterInside !== '') {
                            template += '>\n' +
                                        beforeInside +
                                        (renderTemplates ? this.cascadeDocument(this.sortRenderPosition(node, <NodeTemplate<T>[]> renderTemplates), renderDepth) : '') +
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
        }
        return output;
    }

    public getEnclosingXmlTag(controlName: string, attributes?: string, content?: string) {
        return '<' + controlName + (attributes || '') + (content ? '>\n' + content + '</' + controlName + '>\n' : ' />\n');
    }

    get generateSessionId() {
        return new Date().getTime().toString();
    }
}