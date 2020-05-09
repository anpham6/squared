import { ExtensionResult, LayoutRoot } from '../../@types/base/application';

import Extension from './extension';

type NodeUI = squared.base.NodeUI;

const { capitalize, includes } = squared.lib.util;

export default abstract class ExtensionUI<T extends NodeUI> extends Extension<T> implements squared.base.ExtensionUI<T> {
    public static findNestedElement(node: NodeUI, name: string) {
        if (node.styleElement) {
            const systemName = capitalize(node.localSettings.systemName);
            const children = (<HTMLElement> node.element).children;
            const length = children.length;
            let i = 0;
            while (i < length) {
                const item = <HTMLElement> children[i++];
                if (includes(item.dataset['use' + systemName] || item.dataset.use, name)) {
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

    private readonly _isAll: boolean;

    constructor(
        name: string,
        framework: number,
        options?: StandardMap,
        tagNames: string[] = [])
    {
        super(name, framework, options);
        this.tagNames = tagNames;
        this._isAll = tagNames.length === 0;
    }

    public is(node: T) {
        return this._isAll || this.tagNames.includes(node.tagName);
    }

    public condition(node: T, parent?: T) {
        return node.use ? this.included(<HTMLElement> node.element) : !this._isAll;
    }

    public included(element: HTMLElement) {
        return includes(this.application.getDatasetName('use', element), this.name);
    }

    public processNode(node: T, parent: T): Undef<ExtensionResult<T>> {
        return undefined;
    }

    public processChild(node: T, parent: T): Undef<ExtensionResult<T>> {
        return undefined;
    }

    public addDescendant(node: T) {
        const map = this.application.session.extensionMap;
        const id = node.id;
        const extensions = map.get(id);
        if (extensions) {
            if (!extensions.includes(this)) {
                extensions.push(this);
            }
        }
        else {
            map.set(id, [this]);
        }
    }

    public postBaseLayout(node: T) {}
    public postConstraints(node: T) {}
    public postOptimize(node: T) {}

    public afterBaseLayout() {}
    public afterConstraints() {}
    public afterResources() {}

    public beforeBaseLayout() {}
    public beforeCascade(documentRoot: LayoutRoot<T>[]) {}
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