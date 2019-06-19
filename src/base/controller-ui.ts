import { ControllerUISettings, FileAsset, LayoutResult, LayoutType, NodeIncludeTemplate, NodeTemplate, NodeXmlTemplate, UserUISettings } from './@types/application';

import Controller from './controller';
import LayoutUI from './layout-ui';
import NodeUI from './node-ui';

import { NODE_TEMPLATE } from './lib/enumeration';

const {
    client: $client,
    constant: $const,
    css: $css,
    dom: $dom,
    session: $session,
    util: $util,
    xml: $xml
} = squared.lib;

const withinViewport = (rect: DOMRect | ClientRect) => !(rect.left < 0 && rect.top < 0 && Math.abs(rect.left) >= rect.width && Math.abs(rect.top) >= rect.height);

export default abstract class ControllerUI<T extends NodeUI> extends Controller<T> implements squared.base.ControllerUI<T> {
    public static causesLineBreak(element: Element, sessionId: string) {
        if (element.tagName === 'BR') {
            return true;
        }
        else {
            const node = $session.getElementAsNode<NodeUI>(element, sessionId);
            if (node) {
                return !node.excluded && node.blockStatic;
            }
        }
        return false;
    }

    public abstract readonly localSettings: ControllerUISettings;

    private _requireFormat = false;
    private _beforeOutside: ObjectIndex<string[]> = {};
    private _beforeInside: ObjectIndex<string[]> = {};
    private _afterInside: ObjectIndex<string[]> = {};
    private _afterOutside: ObjectIndex<string[]> = {};

    public abstract processUnknownParent(layout: LayoutUI<T>): LayoutResult<T>;
    public abstract processUnknownChild(layout: LayoutUI<T>): LayoutResult<T>;
    public abstract processTraverseHorizontal(layout: LayoutUI<T>, siblings: T[]): LayoutUI<T>;
    public abstract processTraverseVertical(layout: LayoutUI<T>, siblings: T[]): LayoutUI<T>;
    public abstract processLayoutHorizontal(layout: LayoutUI<T>): LayoutUI<T>;
    public abstract sortRenderPosition(parent: T, templates: NodeTemplate<T>[]): NodeTemplate<T>[];
    public abstract renderNode(layout: LayoutUI<T>): NodeTemplate<T> | undefined;
    public abstract renderNodeGroup(layout: LayoutUI<T>): NodeTemplate<T> | undefined;
    public abstract renderNodeStatic(controlName: string, options?: ExternalData, width?: string, height?: string, content?: string): string;
    public abstract setConstraints(): void;
    public abstract optimize(nodes: T[]): void;
    public abstract finalize(layouts: FileAsset[]): void;
    public abstract createNodeGroup(node: T, children: T[], parent?: T, traverse?: boolean): T;
    public abstract get userSettings(): UserUISettings;
    public abstract get containerTypeHorizontal(): LayoutType;
    public abstract get containerTypeVertical(): LayoutType;
    public abstract get containerTypeVerticalMargin(): LayoutType;
    public abstract get containerTypePercent(): LayoutType;

    public reset() {
        this._requireFormat = false;
        this._beforeOutside = {};
        this._beforeInside = {};
        this._afterInside = {};
        this._afterOutside = {};
    }

    public preventNodeCascade(element: Element) {
        return this.localSettings.unsupported.cascade.has(element.tagName);
    }

    public applyDefaultStyles(element: Element) {
        let styleMap: StringMap;
        if ($dom.isPlainText(element)) {
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
            function checkBorderAttribute(index: number) {
                for (let i = 0; i < 4; i++) {
                    if (styleMap[$css.BOX_BORDER[i][index]]) {
                        return false;
                    }
                }
                return true;
            }
            const setBorderStyle = () => {
                if (styleMap.border === undefined) {
                    if (checkBorderAttribute(0)) {
                        const inputBorderColor = this.localSettings.style.inputBorderColor;
                        styleMap.border = `outset 1px ${inputBorderColor}`;
                        for (let i = 0; i < 4; i++) {
                            styleMap[$css.BOX_BORDER[i][0]] = 'outset';
                            styleMap[$css.BOX_BORDER[i][1]] = '1px';
                            styleMap[$css.BOX_BORDER[i][2]] = inputBorderColor;
                        }
                        return true;
                    }
                }
                return false;
            };
            const setButtonStyle = (appliedBorder: boolean) => {
                if (appliedBorder && styleMap.backgroundColor === undefined) {
                    styleMap.backgroundColor = this.localSettings.style.inputBackgroundColor;
                }
                if (styleMap.textAlign === undefined) {
                    styleMap.textAlign = $const.CSS.CENTER;
                }
                if (styleMap.padding === undefined && !$css.BOX_PADDING.some(attr => !!styleMap[attr])) {
                    styleMap.paddingTop = '2px';
                    styleMap.paddingRight = '6px';
                    styleMap.paddingBottom = '3px';
                    styleMap.paddingLeft = '6px';
                }
            };
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
                    const type = (<HTMLInputElement> element).type;
                    switch (type) {
                        case 'radio':
                        case 'checkbox':
                            break;
                        case 'week':
                        case 'month':
                        case 'time':
                        case 'date':
                        case 'datetime-local':
                            styleMap.paddingTop = $css.formatPX($util.convertFloat(styleMap.paddingTop) + 1);
                            styleMap.paddingRight = $css.formatPX($util.convertFloat(styleMap.paddingRight) + 1);
                            styleMap.paddingBottom = $css.formatPX($util.convertFloat(styleMap.paddingBottom) + 1);
                            styleMap.paddingLeft = $css.formatPX($util.convertFloat(styleMap.paddingLeft) + 1);
                            break;
                        case 'image':
                            if (styleMap.verticalAlign === undefined) {
                                styleMap.verticalAlign = 'text-bottom';
                            }
                            break;
                        default:
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
                    break;
                }
                case 'BUTTON':
                    setButtonStyle(setBorderStyle());
                    break;
                case 'TEXTAREA':
                case 'SELECT':
                    setBorderStyle();
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
                                    styleMap[attr] = `${match[1]}px`;
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

    public addBeforeOutsideTemplate(id: number, value: string, format = true, index = -1) {
        if (this._beforeOutside[id] === undefined) {
            this._beforeOutside[id] = [];
        }
        if (index !== -1 && index < this._beforeOutside[id].length) {
            this._beforeOutside[id].splice(index, 0, value);
        }
        else {
            this._beforeOutside[id].push(value);
        }
        if (format) {
            this._requireFormat = true;
        }
    }

    public addBeforeInsideTemplate(id: number, value: string, format = true, index = -1) {
        if (this._beforeInside[id] === undefined) {
            this._beforeInside[id] = [];
        }
        if (index !== -1 && index < this._beforeInside[id].length) {
            this._beforeInside[id].splice(index, 0, value);
        }
        else {
            this._beforeInside[id].push(value);
        }
        if (format) {
            this._requireFormat = true;
        }
    }

    public addAfterInsideTemplate(id: number, value: string, format = true, index = -1) {
        if (this._afterInside[id] === undefined) {
            this._afterInside[id] = [];
        }
        if (index !== -1 && index < this._afterInside[id].length) {
            this._afterInside[id].splice(index, 0, value);
        }
        else {
            this._afterInside[id].push(value);
        }
        if (format) {
            this._requireFormat = true;
        }
    }

    public addAfterOutsideTemplate(id: number, value: string, format = true, index = -1) {
        if (this._afterOutside[id] === undefined) {
            this._afterOutside[id] = [];
        }
        if (index !== -1 && index < this._afterOutside[id].length) {
            this._afterOutside[id].splice(index, 0, value);
        }
        else {
            this._afterOutside[id].push(value);
        }
        if (format) {
            this._requireFormat = true;
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
            return this._requireFormat;
        }
        return this._beforeOutside[id] !== undefined || this._beforeInside[id] !== undefined || this._afterInside[id] !== undefined || this._afterOutside[id] !== undefined;
    }

    public includeElement(element: Element) {
        return !this.localSettings.unsupported.tagName.has(element.tagName) || element.tagName === 'INPUT' && !this.localSettings.unsupported.tagName.has(`${element.tagName}:${(<HTMLInputElement> element).type}`) || (<HTMLElement> element).contentEditable === 'true';
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
            return element.tagName === 'IMG' && style.getPropertyValue('display') !== $const.CSS.NONE || rect.width > 0 && style.getPropertyValue('float') !== $const.CSS.NONE || style.getPropertyValue('display') === 'block' && (parseInt(style.getPropertyValue('margin-top')) !== 0 || parseInt(style.getPropertyValue('margin-bottom')) !== 0) || style.getPropertyValue('clear') !== $const.CSS.NONE;
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
                        if (node === actualParent.lastChild) {
                            let valid = false;
                            if (node.outsideX(actualParent.box)) {
                                if (!actualParent.hasPX($const.CSS.WIDTH) || actualParent.css('overflowX') === 'hidden') {
                                    continue;
                                }
                                valid = true;
                            }
                            if (node.outsideY(actualParent.box)) {
                                if (!actualParent.hasHeight && !actualParent.hasPX($const.CSS.HEIGHT) || actualParent.css('overflowY') === 'hidden') {
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
                                if (!node.siblingsLeading.some(item => item.multiline || item.excluded && !item.blockStatic)) {
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
                                            else if (outsideX && !node.hasPX($const.CSS.LEFT) && node.right > 0 || outsideY && !node.hasPX($const.CSS.TOP) && node.bottom !== 0) {
                                                outside = true;
                                            }
                                            else if (outsideX && outsideY && (!parent.pageFlow || parent.actualParent && parent.actualParent.documentBody) && (node.top > 0 || node.left > 0)) {
                                                outside = true;
                                            }
                                            else if (!overflowX && node.outsideX(parent.linear) && !node.pseudoElement && (node.left < 0 || node.marginLeft < 0 || !node.hasPX($const.CSS.LEFT) && node.right < 0 && node.linear.left >= parent.linear.right)) {
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
                        else if (!absoluteParent.hasPX($const.CSS.LEFT) && absoluteParent.right !== 0) {
                            bounds.left -= absoluteParent.right;
                            bounds.right -= absoluteParent.right;
                        }
                        if (absoluteParent.top !== 0) {
                            bounds.top += absoluteParent.top;
                            bounds.bottom += absoluteParent.top;
                        }
                        else if (!absoluteParent.hasPX($const.CSS.TOP) && absoluteParent.bottom !== 0) {
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
                    node.containerIndex = Number.POSITIVE_INFINITY;
                    altered.add(parent as T);
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
                            valid = item.ascend(child => nested.includes(child)).length > 0;
                        }
                        if (valid) {
                            const index = adjacent.containerIndex + (item.zIndex >= 0 || adjacent !== item.actualParent ? 1 : 0);
                            if (layers[index] === undefined) {
                                layers[index] = [];
                            }
                            layers[index].push(item);
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
                node.retain($util.flatArray(children));
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
                    if (parentA.depth !== parentA.depth) {
                        return parentA.depth < parentA.depth ? -1 : 1;
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
                        output += this.getBeforeOutsideTemplate(node.id, depth) + template + this.getAfterOutsideTemplate(node.id, depth);
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