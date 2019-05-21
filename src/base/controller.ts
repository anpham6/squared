import { ControllerSettings, FileAsset, LayoutResult, LayoutType, NodeIncludeTemplate, NodeTemplate, NodeXmlTemplate, UserSettings } from './@types/application';

import Application from './application';
import Layout from './layout';
import Node from './node';
import NodeList from './nodelist';

import { CSS_BORDER } from './lib/constant';
import { NODE_TEMPLATE } from './lib/enumeration';

const $color = squared.lib.color;
const $const = squared.lib.constant;
const $client = squared.lib.client;
const $css = squared.lib.css;
const $session = squared.lib.session;
const $util = squared.lib.util;
const $xml = squared.lib.xml;

const withinViewport = (rect: DOMRect | ClientRect) => !(rect.left < 0 && rect.top < 0 && Math.abs(rect.left) >= rect.width && Math.abs(rect.top) >= rect.height);

export default abstract class Controller<T extends Node> implements squared.base.Controller<T> {
    public abstract readonly localSettings: ControllerSettings;

    private _beforeOutside: ObjectIndex<string[]> = {};
    private _beforeInside: ObjectIndex<string[]> = {};
    private _afterInside: ObjectIndex<string[]> = {};
    private _afterOutside: ObjectIndex<string[]> = {};

    protected constructor(
        public application: Application<T>,
        public cache: NodeList<T>)
    {
    }

    public abstract processUnknownParent(layout: Layout<T>): LayoutResult<T>;
    public abstract processUnknownChild(layout: Layout<T>): LayoutResult<T>;
    public abstract processTraverseHorizontal(layout: Layout<T>, siblings: T[]): LayoutResult<T>;
    public abstract processTraverseVertical(layout: Layout<T>, siblings: T[]): LayoutResult<T>;
    public abstract processLayoutHorizontal(layout: Layout<T>): LayoutResult<T>;
    public abstract sortRenderPosition(parent: T, templates: NodeTemplate<T>[]): NodeTemplate<T>[];
    public abstract renderNode(layout: Layout<T>): NodeTemplate<T> | undefined;
    public abstract renderNodeGroup(layout: Layout<T>): NodeTemplate<T> | undefined;
    public abstract renderNodeStatic(controlName: string, options?: ExternalData, width?: string, height?: string, content?: string): string;
    public abstract setConstraints(): void;
    public abstract optimize(nodes: T[]): void;
    public abstract finalize(layouts: FileAsset[]): void;
    public abstract createNodeGroup(node: T, children: T[], parent: T): T;
    public abstract get userSettings(): UserSettings;
    public abstract get containerTypeHorizontal(): LayoutType;
    public abstract get containerTypeVertical(): LayoutType;
    public abstract get containerTypeVerticalMargin(): LayoutType;
    public abstract get containerTypePercent(): LayoutType;
    public abstract get afterInsertNode(): BindGeneric<T, void>;

    public reset() {
        this._beforeOutside = {};
        this._beforeInside = {};
        this._afterInside = {};
        this._afterOutside = {};
    }

    public applyDefaultStyles(element: Element) {
        let styleMap: StringMap;
        if (element.nodeName === '#text') {
            styleMap = {
                position: 'static',
                display: 'inline',
                verticalAlign: 'baseline',
                float: $const.CSS.NONE,
                clear: $const.CSS.NONE
            };
        }
        else {
            styleMap = $session.getElementCache(element, 'styleMap', this.application.processing.sessionId) || {};
            if ($client.isUserAgent($client.USER_AGENT.FIREFOX)) {
                switch (element.tagName) {
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
            switch (element.tagName) {
                case 'INPUT': {
                    const style = $css.getStyle(element);
                    switch ((<HTMLInputElement> element).type) {
                        case 'file':
                        case 'reset':
                        case 'submit':
                        case 'button':
                            const color = $color.parseColor(style.getPropertyValue('background-color'));
                            if (color === undefined) {
                                styleMap.backgroundColor = 'rgb(221, 221, 221)';
                            }
                            if (styleMap.textAlign === undefined) {
                                styleMap.textAlign = $const.CSS.CENTER;
                            }
                            break;
                    }
                    if (style.getPropertyValue('border-style') === $const.CSS.NONE) {
                        for (let i = 0; i < 4; i++) {
                            styleMap[CSS_BORDER[i][0]] = 'outset';
                            styleMap[CSS_BORDER[i][1]] = '2px';
                            styleMap[CSS_BORDER[i][2]] = 'rgb(221, 221, 221)';
                        }
                    }
                    break;
                }
                case 'BUTTON':
                    if (styleMap.textAlign === undefined) {
                        styleMap.textAlign = $const.CSS.CENTER;
                    }
                    break;
                case 'TEXTAREA':
                case 'SELECT':
                    if (styleMap.verticalAlign === undefined && (element.tagName !== 'SELECT' || (<HTMLSelectElement> element).size > 1)) {
                        styleMap.verticalAlign = 'text-bottom';
                    }
                    break;
                case 'FORM':
                    if (styleMap.marginTop === undefined) {
                        styleMap.marginTop = $const.CSS.PX_0;
                    }
                    break;
                case 'LI':
                    if (styleMap.listStyleImage === undefined) {
                        const style = $css.getStyle(element);
                        styleMap.listStyleImage = style.getPropertyValue('list-style-image');
                    }
                    break;
                case 'IFRAME':
                    if (styleMap.display === undefined) {
                        styleMap.display = 'block';
                    }
                case 'IMG':
                    const setDimension = (attr: string, opposing: string) => {
                        if (styleMap[attr] === undefined || styleMap[attr] === $const.CSS.AUTO) {
                            const match = new RegExp(`\\s+${attr}="([^"]+)"`).exec(element.outerHTML);
                            if (match) {
                                if ($css.isLength(match[1])) {
                                    styleMap[attr] = $css.formatPX(match[1]);
                                }
                                else if ($css.isPercent(match[1])) {
                                    styleMap[attr] = match[1];
                                }
                            }
                            else if (element.tagName === 'IFRAME') {
                                if (attr ===  $const.CSS.WIDTH) {
                                    styleMap.width = '300px';
                                }
                                else {
                                    styleMap.height = '150px';
                                }
                            }
                            else if (styleMap[opposing] && $css.isLength(styleMap[opposing])) {
                                const attrMax = `max${$util.capitalize(attr)}`;
                                if (styleMap[attrMax] === undefined || !$css.isPercent(attrMax)) {
                                    const image = this.application.resourceHandler.getImage((<HTMLImageElement> element).src);
                                    if (image && image.width > 0 && image.height > 0) {
                                        styleMap[attr] = $css.formatPX(image[attr] * parseFloat(styleMap[opposing]) / image[opposing]);
                                    }
                                }
                            }
                        }
                    };
                    setDimension($const.CSS.WIDTH, $const.CSS.HEIGHT);
                    setDimension($const.CSS.HEIGHT, $const.CSS.WIDTH);
                    break;
            }
        }
        $session.setElementCache(element, 'styleMap', this.application.processing.sessionId, styleMap);
    }

    public addBeforeOutsideTemplate(id: number, value: string, index = -1) {
        if (this._beforeOutside[id] === undefined) {
            this._beforeOutside[id] = [];
        }
        if (index !== -1 && index < this._beforeOutside[id].length) {
            this._beforeOutside[id].splice(index, 0, value);
        }
        else {
            this._beforeOutside[id].push(value);
        }
    }

    public addBeforeInsideTemplate(id: number, value: string, index = -1) {
        if (this._beforeInside[id] === undefined) {
            this._beforeInside[id] = [];
        }
        if (index !== -1 && index < this._beforeInside[id].length) {
            this._beforeInside[id].splice(index, 0, value);
        }
        else {
            this._beforeInside[id].push(value);
        }
    }

    public addAfterInsideTemplate(id: number, value: string, index = -1) {
        if (this._afterInside[id] === undefined) {
            this._afterInside[id] = [];
        }
        if (index !== -1 && index < this._afterInside[id].length) {
            this._afterInside[id].splice(index, 0, value);
        }
        else {
            this._afterInside[id].push(value);
        }
    }

    public addAfterOutsideTemplate(id: number, value: string, index = -1) {
        if (this._afterOutside[id] === undefined) {
            this._afterOutside[id] = [];
        }
        if (index !== -1 && index < this._afterOutside[id].length) {
            this._afterOutside[id].splice(index, 0, value);
        }
        else {
            this._afterOutside[id].push(value);
        }
    }

    public getBeforeOutsideTemplate(id: number, depth = 0): string {
        return this._beforeOutside[id] ? $xml.pushIndentArray(this._beforeOutside[id], depth) : '';
    }

    public getBeforeInsideTemplate(id: number, depth = 0): string {
        return this._beforeInside[id] ? $xml.pushIndentArray(this._beforeInside[id], depth) : '';
    }

    public getAfterInsideTemplate(id: number, depth = 0): string {
        return this._afterInside[id] ? $xml.pushIndentArray(this._afterInside[id], depth) : '';
    }

    public getAfterOutsideTemplate(id: number, depth = 0): string {
        return this._afterOutside[id] ? $xml.pushIndentArray(this._afterOutside[id], depth) : '';
    }

    public hasAppendProcessing(id?: number) {
        if (id === undefined) {
            return Object.keys(this._beforeOutside).length > 0 || Object.keys(this._beforeInside).length > 0 || Object.keys(this._afterInside).length > 0 || Object.keys(this._afterOutside).length > 0;
        }
        return this._beforeOutside[id] !== undefined || this._beforeInside[id] !== undefined || this._afterInside[id] !== undefined || this._afterOutside[id] !== undefined;
    }

    public includeElement(element: Element) {
        return !this.localSettings.unsupported.tagName.has(element.tagName) || element.tagName === 'INPUT' && !this.localSettings.unsupported.tagName.has(`${element.tagName}:${(<HTMLInputElement> element).type}`) || element['contentEditable'] === 'true';
    }

    public visibleElement(element: Element) {
        if (element.className === '__squared.pseudo') {
            return true;
        }
        const rect = $session.getClientRect(element, this.application.processing.sessionId);
        if (withinViewport(rect)) {
            if (rect.width > 0 && rect.height > 0) {
                return true;
            }
            const style = $css.getStyle(element);
            return rect.width > 0 && style.getPropertyValue('float') !== $const.CSS.NONE || style.getPropertyValue('display') === 'block' && (parseInt(style.getPropertyValue('margin-top')) !== 0 || parseInt(style.getPropertyValue('margin-bottom')) !== 0) || style.getPropertyValue('clear') !== $const.CSS.NONE;
        }
        return false;
    }

    public evaluateNonStatic(documentRoot: T, cache: NodeList<T>) {
        const alteredParent = new Set<T>();
        for (const node of cache) {
            if (!node.documentRoot) {
                const actualParent = node.parent as T;
                const absoluteParent = node.absoluteParent as T;
                let parent: T | undefined;
                switch (node.css('position')) {
                    case 'relative':
                        if (node === actualParent.lastChild) {
                            let valid = false;
                            if (node.outsideX(actualParent.box)) {
                                if (!actualParent.has($const.CSS.WIDTH) || actualParent.css('overflowX') === 'hidden') {
                                    continue;
                                }
                                valid = true;
                            }
                            if (node.outsideY(actualParent.box)) {
                                if (!actualParent.hasHeight && !actualParent.has($const.CSS.HEIGHT) || actualParent.css('overflowY') === 'hidden') {
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
                                    parent = actualParent.actualParent as T;
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
                                if (!node.previousSiblings().some(item => item.multiline || item.excluded && !item.blockStatic)) {
                                    node.cssApply({ display: 'inline-block', verticalAlign: $const.CSS.TOP }, true);
                                }
                                else {
                                    node.positionAuto = false;
                                }
                                parent = actualParent;
                            }
                            else if (this.userSettings.supportNegativeLeftTop) {
                                let outside = false;
                                while (parent && parent !== documentRoot) {
                                    if (!outside) {
                                        const overflowX = parent.css('overflowX') === 'hidden';
                                        const overflowY = parent.css('overflowY') === 'hidden';
                                        if (overflowX && overflowY || node.cssInitial($const.CSS.TOP) === $const.CSS.PX_0 || node.cssInitial($const.CSS.RIGHT) === $const.CSS.PX_0 || node.cssInitial($const.CSS.BOTTOM) === $const.CSS.PX_0 || node.cssInitial($const.CSS.LEFT) === $const.CSS.PX_0) {
                                            break;
                                        }
                                        else {
                                            const outsideX = !overflowX && node.outsideX(parent.box);
                                            const outsideY = !overflowY && node.outsideY(parent.box);
                                            if (!overflowY && node.linear.top < Math.floor(parent.box.top) && (node.top < 0 || node.marginTop < 0)) {
                                                outside = true;
                                            }
                                            else if (outsideX && !node.has($const.CSS.LEFT) && node.right > 0 || outsideY && !node.has($const.CSS.TOP) && node.bottom !== 0) {
                                                outside = true;
                                            }
                                            else if (outsideX && outsideY && (!parent.pageFlow || parent.actualParent && parent.actualParent.documentBody) && (node.top > 0 || node.left > 0)) {
                                                outside = true;
                                            }
                                            else if (!overflowX && node.outsideX(parent.linear) && !node.pseudoElement && (node.left < 0 || node.marginLeft < 0 || !node.has($const.CSS.LEFT) && node.right < 0 && node.linear.left >= parent.linear.right)) {
                                                outside = true;
                                            }
                                            else if (!overflowX && !overflowY && !node.intersectX(parent.box) && !node.intersectY(parent.box)) {
                                                outside = true;
                                            }
                                            else {
                                                break;
                                            }
                                        }
                                    }
                                    else if (parent.layoutElement) {
                                        parent = absoluteParent as T;
                                        break;
                                    }
                                    else if (node.withinX(parent.box) && node.withinY(parent.box)) {
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
                    if (absoluteParent && absoluteParent.positionRelative && parent !== absoluteParent) {
                        const bounds = node.bounds;
                        if (absoluteParent.left !== 0) {
                            bounds.left += absoluteParent.left;
                            bounds.right += absoluteParent.left;
                        }
                        else if (!absoluteParent.has($const.CSS.LEFT) && absoluteParent.right !== 0) {
                            bounds.left -= absoluteParent.right;
                            bounds.right -= absoluteParent.right;
                        }
                        if (absoluteParent.top !== 0) {
                            bounds.top += absoluteParent.top;
                            bounds.bottom += absoluteParent.top;
                        }
                        else if (!absoluteParent.has($const.CSS.TOP) && absoluteParent.bottom !== 0) {
                            bounds.top -= absoluteParent.bottom;
                            bounds.bottom -= absoluteParent.bottom;
                        }
                        node.unsafe('box', true);
                        node.unsafe('linear', true);
                    }
                    let opacity = node.toFloat('opacity', false, 1);
                    let current = actualParent;
                    while (current && current !== parent) {
                        opacity *= current.toFloat('opacity', false, 1);
                        current = current.actualParent as T;
                    }
                    node.css('opacity', opacity.toString());
                    node.parent = parent;
                    node.siblingIndex = Number.POSITIVE_INFINITY;
                    alteredParent.add(parent as T);
                }
                node.documentParent = parent;
            }
        }
        for (const node of cache) {
            if (alteredParent.has(node)) {
                const layers: Array<T[]> = [];
                let maxIndex = -1;
                node.each((item: T) => {
                    if (item.siblingIndex === Number.POSITIVE_INFINITY) {
                        for (const adjacent of node.children) {
                            let valid = adjacent.actualChildren.includes(item);
                            if (!valid) {
                                const nested = adjacent.cascade();
                                valid = item.ascend(false, child => nested.includes(child)).length > 0;
                            }
                            if (valid) {
                                const index = adjacent.siblingIndex + (item.zIndex >= 0 || adjacent !== item.actualParent ? 1 : 0);
                                if (layers[index] === undefined) {
                                    layers[index] = [];
                                }
                                layers[index].push(item);
                                break;
                            }
                        }
                    }
                    else if (item.siblingIndex > maxIndex) {
                        maxIndex = item.siblingIndex;
                    }
                });
                if (layers.length) {
                    const children = node.children as T[];
                    for (let j = 0, k = 0, l = 1; j < layers.length; j++, k++) {
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
                                item.siblingIndex = maxIndex + l++;
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
                    node.retain($util.flatArray(children));
                }
            }
        }
    }

    public cascadeDocument(templates: NodeTemplate<T>[], depth: number) {
        const indent = depth > 0 ? '\t'.repeat(depth) : '';
        let output = '';
        for (const item of templates) {
            if (item) {
                const node = item.node;
                switch (item.type) {
                    case NODE_TEMPLATE.XML: {
                        const controlName = (<NodeXmlTemplate<T>> item).controlName;
                        const attributes = (<NodeXmlTemplate<T>> item).attributes;
                        const renderDepth = depth + 1;
                        const beforeInside = this.getBeforeInsideTemplate(node.id, renderDepth);
                        const afterInside = this.getAfterInsideTemplate(node.id, renderDepth);
                        let template = indent + `<${controlName + (depth === 0 ? '{#0}' : '') + (this.userSettings.showAttributes ? (attributes ? $xml.pushIndent(attributes, renderDepth) : node.extractAttributes(renderDepth)) : '')}`;
                        if (node.renderTemplates || beforeInside !== '' || afterInside !== '') {
                            template += '>\n' +
                                        beforeInside +
                                        (node.renderTemplates ? this.cascadeDocument(this.sortRenderPosition(node, <NodeTemplate<T>[]> node.renderTemplates), renderDepth) : '') +
                                        afterInside +
                                        indent + `</${controlName}>\n`;
                        }
                        else {
                            template += ' />\n';
                        }
                        output += this.getBeforeOutsideTemplate(node.id, depth) +
                                  template +
                                  this.getAfterOutsideTemplate(node.id, depth);
                        break;
                    }
                    case NODE_TEMPLATE.INCLUDE: {
                        const content = (<NodeIncludeTemplate<T>> item).content;
                        if (content) {
                            output += $xml.pushIndent(content, depth);
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