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

    public controller!: squared.base.ControllerUI<T>;
    public resource!: squared.base.ResourceUI<T>;
    public tagNames: string[];
    public readonly eventOnly = false;
    public readonly documentBase = false;
    public readonly cascadeAll = false;
    public readonly removeIs = false;

    protected _application!: squared.base.ApplicationUI<T>;

    constructor(
        name: string,
        framework: number,
        options?: ExternalData,
        tagNames: string[] = [])
    {
        super(name, framework, options);
        this.tagNames = tagNames;
    }

    public condition(node: T, parent?: T) {
        if (node.styleElement) {
            return node.dataset.use ? this.included(<HTMLElement> node.element) : this.tagNames.length > 0;
        }
        return false;
    }

    public is(node: T) {
        return node.styleElement ? this.tagNames.length === 0 || this.tagNames.includes(node.toElementString('tagName')) : false;
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
        this.controller = value.controllerHandler;
        this.resource = value.resourceHandler;
    }
    get application() {
        return this._application;
    }
}