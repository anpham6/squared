import { ControllerSettings, LayoutResult, LayoutType, SessionData, UserSettings } from './@types/application';

import Application from './application';
import Layout from './layout';
import Node from './node';
import NodeList from './nodelist';

const $xml = squared.lib.xml;

export default abstract class Controller<T extends Node> implements squared.base.Controller<T> {
    public abstract readonly localSettings: ControllerSettings;

    private _before: ObjectIndex<string[]> = {};
    private _after: ObjectIndex<string[]> = {};

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
    public abstract sortRenderPosition(parent: T, children: T[]): T[];
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
        this._before = {};
        this._after = {};
    }

    public replaceRenderQueue(output: string) {
        for (const id in this._before) {
            output = output.replace(`{<${id}}`, this._before[id].join(''));
        }
        for (const id in this._after) {
            output = output.replace(`{>${id}}`, this._after[id].join(''));
        }
        return output;
    }

    public prependBefore(id: number, output: string, index = -1) {
        if (this._before[id] === undefined) {
            this._before[id] = [];
        }
        if (index !== -1 && index < this._before[id].length) {
            this._before[id].splice(index, 0, output);
        }
        else {
            this._before[id].push(output);
        }
    }

    public appendAfter(id: number, output: string, index = -1) {
        if (this._after[id] === undefined) {
            this._after[id] = [];
        }
        if (index !== -1 && index < this._after[id].length) {
            this._after[id].splice(index, 0, output);
        }
        else {
            this._after[id].push(output);
        }
    }

    public hasAppendProcessing(id: number) {
        return this._before[id] !== undefined || this._after[id] !== undefined;
    }

    public getEnclosingTag(controlName: string, id: number, depth: number, xml = '') {
        const indent = '\t'.repeat(Math.max(0, depth));
        let result = `{<${id}}`;
        if (xml !== '') {
            result += indent + `<${controlName}${depth === 0 ? '{#0}' : ''}{@${id}}>\n` +
                               xml +
                      indent + `</${controlName}>\n`;
        }
        else {
            result += indent + `<${controlName}${depth === 0 ? '{#0}' : ''}{@${id}} />\n`;
        }
        result += `{>${id}}\n`;
        return result;
    }

    public removePlaceholders(value: string) {
        return value.replace(/{[<:@#>]\d+(\^\d+)?}\n?/g, '').trim();
    }

    public replaceIndent(value: string, depth: number, cache: T[]) {
        value = $xml.replaceIndent(value, depth, /^({[^}]+})(\t*)(<.*)/);
        if (cache) {
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
        }
        return value;
    }
}