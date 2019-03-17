import { ControllerSettings, LayoutResult, LayoutType, SessionData, UserSettings } from './@types/application';

import Application from './application';
import Layout from './layout';
import Node from './node';
import NodeList from './nodelist';

const $color = squared.lib.color;
const $css = squared.lib.css;
const $dom = squared.lib.dom;
const $util = squared.lib.util;
const $xml = squared.lib.xml;

const REGEXP_INDENT = /^({[^}]+})*(\t*)(<.*)/;
const REGEXP_PLACEHOLDER = /{[<:@#>]\d+(\^\d+)?}\n?/g;

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
    public abstract sortRenderPosition(parent: T, children: T[]): T[] | undefined;
    public abstract renderNode(layout: Layout<T>): string;
    public abstract renderNodeGroup(layout: Layout<T>): string;
    public abstract renderNodeStatic(controlName: string, depth: number, options?: {}, width?: string, height?: string, node?: T, children?: boolean): string;
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
        this._afterOutside = {};
    }

    public applyDefaultStyles(element: Element) {
        const styleMap: StringMap = $dom.getElementCache(element, 'styleMap') || {};
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
            case 'IFRAME':
                if (styleMap.display === undefined) {
                    styleMap.display = 'block';
                }
            case 'IMG':
                if (styleMap.width === undefined) {
                    const match = /width="(\d+)"/.exec(element.outerHTML);
                    if (match) {
                        styleMap.width = $util.formatPX($util.isPercent(match[1]) ? parseFloat(match[1]) / 100 * (element.parentElement || element).getBoundingClientRect().width : match[1]);
                    }
                }
                if (styleMap.height === undefined) {
                    const match = /height="(\d+)"/.exec(element.outerHTML);
                    if (match) {
                        styleMap.height = $util.formatPX($util.isPercent(match[1]) ? parseFloat(match[1]) / 100 * (element.parentElement || element).getBoundingClientRect().height : match[1]);
                    }
                }
                break;
        }
        $dom.setElementCache(element, 'styleMap', styleMap);
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

    public getBeforeOutsideTemplate(id: number): string {
        return this._beforeOutside[id] ? this._beforeOutside[id].join('') : '';
    }

    public getBeforeInsideTemplate(id: number): string {
        return this._beforeInside[id] ? this._beforeInside[id].join('') : '';
    }

    public getAfterInsideTemplate(id: number): string {
        return this._afterInside[id] ? this._afterInside[id].join('') : '';
    }

    public getAfterOutsideTemplate(id: number): string {
        return this._afterOutside[id] ? this._afterOutside[id].join('') : '';
    }

    public hasAppendProcessing(id: number) {
        return this._beforeOutside[id] !== undefined || this._beforeInside[id] !== undefined || this._afterInside[id] !== undefined || this._afterOutside[id] !== undefined;
    }

    public cascadeDocument(templates: string[], children: T[]) {
        let output = '';
        for (let i = 0; i < templates.length; i++) {
            if (templates[i] !== '') {
                const item = children[i] as T;
                let template = templates[i].replace($xml.formatPlaceholder(item.id, '@'), this.userSettings.showAttributes ? item.extractAttributes() : '');
                if (item.renderTemplates) {
                    let cascadeTemplate!: string[];
                    let cascadeChildren = this.application.session.renderPosition.get(item);
                    let valid = false;
                    cascadeChildren = cascadeChildren ? this.sortRenderPosition(item, cascadeChildren) : this.sortRenderPosition(item, item.renderChildren as T[]);
                    if (cascadeChildren) {
                        cascadeTemplate = [];
                        for (const child of cascadeChildren) {
                            const index = item.renderChildren.findIndex(node => node.id === child.id);
                            if (index !== -1) {
                                cascadeTemplate.push(item.renderTemplates[i]);
                            }
                        }
                        if (cascadeTemplate.length === item.renderTemplates.length) {
                            valid = true;
                        }
                    }
                    if (!valid) {
                        cascadeTemplate = item.renderTemplates;
                        cascadeChildren = item.renderChildren as T[];
                    }
                    template = template.replace($xml.formatPlaceholder(item.id), this.getBeforeInsideTemplate(item.id) + this.cascadeDocument(cascadeTemplate, cascadeChildren as T[]) + this.getAfterInsideTemplate(item.id));
                }
                output += this.getBeforeOutsideTemplate(item.id) + template + this.getAfterOutsideTemplate(item.id);
            }
        }
        return output;
    }

    public getEnclosingTag(controlName: string, id: number, depth: number, innerXml?: string) {
        const indent = '\t'.repeat(Math.max(0, depth));
        if (innerXml !== undefined) {
            return indent + `<${controlName}${depth === 0 ? '{#0}' : ''}{@${id}}>\n` +
                             (innerXml || $xml.formatPlaceholder(id)) +
                   indent + `</${controlName}>\n`;
        }
        else {
            return indent + `<${controlName}${depth === 0 ? '{#0}' : ''}{@${id}} />\n`;
        }
    }

    public removePlaceholders(value: string) {
        return value.replace(REGEXP_PLACEHOLDER, '').trim();
    }

    public replaceIndent(value: string, depth: number, cache: T[]) {
        value = $xml.replaceIndent(value, depth, REGEXP_INDENT);
        const pattern = /{@(\d+)}/g;
        let match: RegExpExecArray | null;
        let i = 0;
        while ((match = pattern.exec(value)) !== null) {
            const id = parseInt(match[1]);
            const node = cache.find(item => item.id === id);
            if (node) {
                if (i++ === 0) {
                    node.renderDepth = depth;
                }
                else if (node.renderParent) {
                    node.renderDepth = node.renderParent.renderDepth + 1;
                }
            }
        }
        return value;
    }
}