import { ExtensionDependency } from './@types/application';

import Application from './application';
import Node from './node';

const $util = squared.lib.util;

export default abstract class Extension<T extends Node> implements squared.base.Extension<T> {
    public tagNames: string[];
    public eventOnly = false;
    public preloaded = false;
    public documentBase = false;
    public application!: Application<T>;
    public readonly options: ExternalData = {};
    public readonly dependencies: ExtensionDependency[] = [];
    public readonly subscribers = new Set<T>();

    protected constructor(
        public readonly name: string,
        public readonly framework: number,
        tagNames?: string[],
        options?: ExternalData)
    {
        this.tagNames = Array.isArray(tagNames) ? $util.replaceMap<string, string>(tagNames, value => value.trim().toUpperCase()) : [];
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

    public postParseDocument(node: T) {}
    public beforeParseDocument() {}
    public afterParseDocument() {}

    get installed() {
        return !!this.application && this.application.extensions.includes(this);
    }
}
