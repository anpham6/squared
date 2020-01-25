import { ExtensionResult } from '../../@types/base/application';

import Extension from './extension';

const $lib = squared.lib;
const { hasComputedStyle } = $lib.css;
const { includes } = $lib.util;

export default abstract class ExtensionUI<T extends squared.base.NodeUI> extends Extension<T> implements squared.base.ExtensionUI<T> {
    public static findNestedElement(element: Element | null, name: string) {
        if (element && hasComputedStyle(element)) {
            const children = element.children;
            const length = children.length;
            for (let i = 0; i < length; i++) {
                const item = <HTMLElement> children[i];
                if (includes(item.dataset.use, name)) {
                    return item;
                }
            }
        }
        return null;
    }

    public init?: (element: HTMLElement) => boolean;

    public tagNames: string[];
    public readonly eventOnly = false;
    public readonly documentBase = false;
    public readonly cascadeAll = false;
    public readonly removeIs = false;

    protected _application!: squared.base.ApplicationUI<T>;
    protected _controller!: squared.base.ControllerUI<T>;
    protected _resource!: squared.base.ResourceUI<T>;
    protected _cache!: squared.base.NodeList<T>;
    protected _cacheProcessing!: squared.base.NodeList<T>;

    private _isAll = false;

    constructor(
        name: string,
        framework: number,
        options?: ExternalData,
        tagNames: string[] = [])
    {
        super(name, framework, options);
        this.tagNames = tagNames;
        this._isAll = tagNames.length === 0;
    }

    public condition(node: T, parent?: T) {
        return node.dataset.use ? this.included(<HTMLElement> node.element) : !this._isAll;
    }

    public is(node: T) {
        return this._isAll || this.tagNames.includes(node.tagName);
    }

    public included(element: HTMLElement) {
        return includes(element.dataset.use, this.name);
    }

    public processNode(node: T, parent: T): ExtensionResult<T> | undefined {
        return undefined;
    }

    public processChild(node: T, parent: T): ExtensionResult<T> | undefined {
        return undefined;
    }

    public addDescendant(node: T) {
        const map = this.application.session.extensionMap;
        const id = node.id;
        const extensions = map.get(id) || [];
        if (!extensions.includes(this)) {
            extensions.push(this);
        }
        map.set(id, extensions);
    }

    public postBaseLayout(node: T) {}
    public postConstraints(node: T) {}
    public postOptimize(node: T) {}

    public afterBaseLayout() {}
    public afterConstraints() {}
    public afterResources() {}

    public beforeBaseLayout() {}
    public beforeCascade() {}
    public afterFinalize() {}

    set application(value) {
        this._application = value;
        this._controller = value.controllerHandler;
        this._resource = value.resourceHandler;
        this._cache = value.session.cache;
        this._cacheProcessing = value.processing.cache;
    }
    get application() {
        return this._application;
    }

    get controller() {
        return this._controller;
    }

    get resource() {
        return this._resource;
    }

    get cache() {
        return this._cache;
    }

    get cacheProcessing() {
        return this._cacheProcessing;
    }
}