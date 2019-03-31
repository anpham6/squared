import { ControllerSettings, LayoutResult, LayoutType, NodeTag, NodeTagXml, NodeIncludeTemplate, NodeTemplate, NodeXmlTemplate, SessionData, UserSettings } from './@types/application';

import Application from './application';
import Layout from './layout';
import Node from './node';
import NodeList from './nodelist';

import { NODE_TEMPLATE } from './lib/enumeration';

const $color = squared.lib.color;
const $css = squared.lib.css;
const $dom = squared.lib.dom;
const $util = squared.lib.util;
const $xml = squared.lib.xml;

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
    public abstract processLayoutHorizontal(layout: Layout<T>, strictMode?: boolean): LayoutResult<T>;
    public abstract sortRenderPosition(parent: T, templates: NodeTemplate<T>[]): NodeTemplate<T>[];
    public abstract renderNode(layout: Layout<T>): NodeTemplate<T> | undefined;
    public abstract renderNodeGroup(layout: Layout<T>): NodeTemplate<T> | undefined;
    public abstract renderNodeStatic(controlName: string, options?: ExternalData, width?: string, height?: string, content?: string): string;
    public abstract setConstraints(): void;
    public abstract finalize(data: SessionData<NodeList<T>>): void;
    public abstract createNodeGroup(node: T, children: T[], parent: T): T;
    public abstract get userSettings(): UserSettings;
    public abstract get containerTypeHorizontal(): LayoutType;
    public abstract get containerTypeVertical(): LayoutType;
    public abstract get containerTypeVerticalMargin(): LayoutType;
    public abstract get afterInsertNode(): BindGeneric<T, void>;

    public reset() {
        this._beforeOutside = {};
        this._beforeInside = {};
        this._afterInside = {};
        this._afterOutside = {};
    }

    public applyDefaultStyles(element: Element) {
        const styleMap: StringMap = $dom.getElementCache(element, 'styleMap', this.application.processing.cacheIndex) || {};
        if ($util.isUserAgent($util.USER_AGENT.FIREFOX)) {
            if (styleMap.display === undefined) {
                switch (element.tagName) {
                    case 'INPUT':
                    case 'TEXTAREA':
                    case 'SELECT':
                    case 'BUTTON':
                        styleMap.display = 'inline-block';
                        break;
                }
            }
        }
        switch (element.tagName) {
            case 'INPUT':
                switch ((<HTMLInputElement> element).type) {
                    case 'file': {
                        const style = $css.getStyle(element);
                        const color = $color.parseColor(style.backgroundColor || '');
                        if (color === undefined) {
                            styleMap.backgroundColor = '#DDDDDD';
                            if (style.borderStyle === 'none') {
                                for (const border of ['borderTop', 'borderRight', 'borderBottom', 'borderLeft']) {
                                    styleMap[`${border}Style`] = 'solid';
                                    styleMap[`${border}Color`] = '#DDDDDD';
                                    styleMap[`${border}Width`] = '2px';
                                }
                            }
                        }
                        break;
                    }
                }
                break;
            case 'FORM':
                if (styleMap.marginTop === undefined) {
                    styleMap.marginTop = '0px';
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
                            styleMap[attr] = $util.formatPX($util.isPercent(match[1]) ? parseFloat(match[1]) / 100 * (element.parentElement || element).getBoundingClientRect()[attr] : match[1]);
                        }
                        else if (element.tagName === 'IFRAME') {
                            if (attr ===  'width') {
                                styleMap.width = '300px';
                            }
                            else {
                                styleMap.height = '150px';
                            }
                        }
                        else if (!(styleMap.maxWidth && $util.isPercent(styleMap.maxWidth) || styleMap.maxHeight && $util.isPercent(styleMap.maxHeight)) && (styleMap[opposing] === undefined || $util.isLength(styleMap[opposing]))) {
                            const image = this.application.session.image.get((<HTMLImageElement> element).src);
                            if (image && image.width > 0 && image.height > 0) {
                                styleMap[attr] = $util.formatPX(image[attr] * (styleMap[opposing] && $util.isLength(styleMap[opposing]) ? (parseFloat(styleMap[opposing]) / image[opposing]) : 1));
                            }
                        }
                    }
                };
                setDimension('width', 'height');
                setDimension('height', 'width');
                break;
        }
        $dom.setElementCache(element, 'styleMap', this.application.processing.cacheIndex, styleMap);
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
                        let template = indent + `<${controlName + (depth === 0 ? '{#0} ' : '') + (this.userSettings.showAttributes ? (attributes ? $xml.pushIndent(attributes, depth + 1) : node.extractAttributes(depth + 1)) : '')}`;
                        if (node.renderTemplates) {
                            const renderDepth = depth + 1;
                            template += '>\n' +
                                        this.getBeforeInsideTemplate(node.id, renderDepth) +
                                        this.cascadeDocument(this.sortRenderPosition(node, <NodeTemplate<T>[]> node.renderTemplates), renderDepth) +
                                        this.getAfterInsideTemplate(node.id, renderDepth) +
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

    get generateCacheIndex() {
        return new Date().getTime();
    }
}