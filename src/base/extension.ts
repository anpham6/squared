import { ExtensionDependency, ExtensionResult } from './@types/application';

import Application from './application';
import Node from './node';

const $dom = squared.lib.dom;
const $util = squared.lib.util;

export default abstract class Extension<T extends Node> implements squared.base.Extension<T> {
    public static findNestedByName(element: Element | null, name: string) {
        if ($dom.hasComputedStyle(element)) {
            for (let i = 0; i < element.children.length; i++) {
                const item = <HTMLElement> element.children[i];
                if ($util.includes(item.dataset.use, name)) {
                    return item;
                }
            }
        }
        return null;
    }

    public tagNames: string[] = [];
    public documentRoot = false;
    public eventOnly = false;
    public preloaded = false;
    public readonly options: ExternalData = {};
    public readonly dependencies: ExtensionDependency[] = [];
    public readonly subscribers = new Set<T>();
    public readonly subscribersChild = new Set<T>();

    private _application?: Application<T>;

    protected constructor(
        public readonly name: string,
        public readonly framework: number,
        tagNames?: string[],
        options?: ExternalData)
    {
        if (Array.isArray(tagNames)) {
            this.tagNames = $util.replaceMap<string, string>(tagNames, value => value.trim().toUpperCase());
        }
        if (options) {
            Object.assign(this.options, options);
        }
    }

    public is(node: T) {
        return node.styleElement ? this.tagNames.length === 0 || this.tagNames.includes((<HTMLElement> node.element).tagName) : false;
    }

    public require(name: string, preload = false) {
        this.dependencies.push({ name, preload });
    }

    public included(element: HTMLElement) {
        return $util.includes(element.dataset.use, this.name);
    }

    public beforeInit(element: HTMLElement, recursive = false) {
        if (!recursive && this.included(element)) {
            for (const item of this.dependencies) {
                if (item.preload) {
                    const ext = this.application.extensionManager.retrieve(item.name);
                    if (ext && !ext.preloaded) {
                        ext.beforeInit(element, true);
                        ext.preloaded = true;
                    }
                }
            }
        }
    }

    public init(element: HTMLElement) {
        return false;
    }

    public afterInit(element: HTMLElement, recursive = false) {
        if (!recursive && this.included(element)) {
            for (const item of this.dependencies) {
                if (item.preload) {
                    const ext = this.application.extensionManager.retrieve(item.name);
                    if (ext && ext.preloaded) {
                        ext.afterInit(element, true);
                        ext.preloaded = false;
                    }
                }
            }
        }
    }

    public condition(node: T, parent?: T) {
        if ($dom.hasComputedStyle(node.element)) {
            return node.dataset.use ? this.included(node.element) : this.tagNames.length > 0;
        }
        return false;
    }

    public processNode(node: T, parent: T): ExtensionResult<T> {
        return { output: '', complete: false };
    }

    public processChild(node: T, parent: T): ExtensionResult<T> {
        return { output: '', complete: false };
    }

    public postBaseLayout(node: T) {}
    public postConstraints(node: T) {}
    public postParseDocument(node: T) {}
    public postProcedure(node: T) {}

    public beforeParseDocument() {}
    public afterDepthLevel() {}
    public afterBaseLayout() {}
    public afterConstraints() {}
    public afterResources() {}
    public afterParseDocument() {}
    public afterProcedure() {}
    public afterFinalize() {}

    set application(value) {
        this._application = value;
    }
    get application() {
        return this._application || {} as Application<T>;
    }

    get installed() {
        return this.application.extensions ? this.application.extensions.has(this) : false;
    }
}
