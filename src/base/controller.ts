import { ControllerSettings, FileAsset, LayoutResult, LayoutType, NodeTag, NodeTagXml, NodeIncludeTemplate, NodeTemplate, NodeXmlTemplate, UserSettings } from './@types/application';

import Application from './application';
import Layout from './layout';
import Node from './node';
import NodeList from './nodelist';

import { NODE_TEMPLATE } from './lib/enumeration';

const $color = squared.lib.color;
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
    public abstract processTraverseHorizontal(layout: Layout<T>, siblings?: T[]): LayoutResult<T>;
    public abstract processTraverseVertical(layout: Layout<T>, siblings?: T[]): LayoutResult<T>;
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
                float: 'none',
                clear: 'none'
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
                case 'INPUT':
                    switch ((<HTMLInputElement> element).type) {
                        case 'file': {
                            const style = $css.getStyle(element);
                            const color = $color.parseColor(style.getPropertyValue('background-color'));
                            if (color === undefined) {
                                styleMap.backgroundColor = '#DDDDDD';
                                if (style.getPropertyValue('border-style')) {
                                    for (const border of ['borderTop', 'borderRight', 'borderBottom', 'borderLeft']) {
                                        styleMap[`${border}Style`] = 'solid';
                                        styleMap[`${border}Color`] = '#DDDDDD';
                                        styleMap[`${border}Width`] = '2px';
                                    }
                                }
                            }
                        }
                        case 'reset':
                        case 'submit':
                        case 'button':
                            if (styleMap.textAlign === undefined) {
                                styleMap.textAlign = 'center';
                            }
                            break;
                    }
                    break;
                case 'BUTTON':
                    if (styleMap.textAlign === undefined) {
                        styleMap.textAlign = 'center';
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
                        styleMap.marginTop = '0px';
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
                        if (styleMap[attr] === undefined || styleMap[attr] === 'auto') {
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
                                if (attr ===  'width') {
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
                    setDimension('width', 'height');
                    setDimension('height', 'width');
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

    public hasAppendProcessing(id: number) {
        return this._beforeOutside[id] !== undefined || this._beforeInside[id] !== undefined || this._afterInside[id] !== undefined || this._afterOutside[id] !== undefined;
    }

    public includeElement(element: Element, target?: string) {
        const rect = $session.getClientRect(element, this.application.processing.sessionId);
        if (withinViewport(rect)) {
            if (rect.width > 0 && rect.height > 0) {
                return true;
            }
            const style = $css.getStyle(element, target);
            return rect.width > 0 && style.getPropertyValue('float') !== 'none' || style.getPropertyValue('display') === 'block' && (parseInt(style.getPropertyValue('margin-top')) !== 0 || parseInt(style.getPropertyValue('margin-bottom')) !== 0) || style.getPropertyValue('clear') !== 'none';
        }
        return false;
    }

    public cascadeDocument(templates: NodeTemplate<T>[], depth: number) {
        const indent = depth > 0 ? '\t'.repeat(depth) : '';
        let output = '';
        for (let i = 0; i < templates.length; i++) {
            const item = templates[i];
            if (item) {
                const node = item.node;
                switch (item.type) {
                    case NODE_TEMPLATE.XML: {
                        const { controlName, attributes } = <NodeXmlTemplate<T>> item;
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
                        const { content } = <NodeIncludeTemplate<T>> item;
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

    public getEnclosingTag(type: number, options: NodeTag<T>) {
        switch (type) {
            case NODE_TEMPLATE.XML:
                const { controlName, attributes, content } = <NodeTagXml<T>> options;
                return '<' + controlName + (attributes || '') + (content ? '>\n' + content + '</' + controlName + '>\n' : ' />\n');
        }
        return '';
    }

    get generateSessionId() {
        return new Date().getTime().toString();
    }
}