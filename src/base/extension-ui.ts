import type ApplicationUI from './application-ui';
import type ControllerUI from './controller-ui';
import type ResourceUI from './resource-ui';
import type NodeUI from './node-ui';
import type NodeList from './nodelist';

import Extension from './extension';

const { splitSome } = squared.lib.util;

export default abstract class ExtensionUI<T extends NodeUI> extends Extension<T> implements squared.base.ExtensionUI<T> {
    public static includes(source: Undef<string>, value: string) {
        return !!source && splitSome(source, item => item === value);
    }

    public static findNestedElement(node: NodeUI, name: string) {
        if (node.styleElement) {
            const systemName = node.localSettings.systemName;
            const children = (node.element as HTMLElement).children;
            for (let i = 0, length = children.length; i < length; ++i) {
                const item = children[i] as HTMLElement;
                if (this.includes(item.dataset['use' + systemName] || item.dataset.use, name)) {
                    return item;
                }
            }
        }
    }

    public readonly tagNames?: string[];
    public readonly eventOnly?: boolean;
    public readonly cascadeAll?: boolean;
    public readonly documentBase?: boolean;

    public abstract controller: ControllerUI<T>;
    public abstract resource: ResourceUI<T>;

    constructor(name: string, framework: number, options?: ExtensionUIOptions) {
        super(name, framework, options);
        this.tagNames = options && options.tagNames;
    }

    public abstract set application(value);
    public abstract get application(): ApplicationUI<T>;

    public postBaseLayout?(node: T): void;
    public postConstraints?(node: T): void;
    public postResources?(node: T): void;
    public postOptimize?(node: T, rendered: T[]): void;
    public postBoxSpacing?(node: T, rendered: T[]): void;

    public is(node: T) {
        return !this.tagNames || this.tagNames.includes(node.tagName);
    }

    public condition(node: T, parent: T) {
        return node.use ? this.included(node.element as HTMLElement) : !!this.tagNames;
    }

    public included(element: DocumentElement) {
        return ExtensionUI.includes(this.application.getDatasetName('use', element), this.name);
    }

    public processNode(node: T, parent: T): Void<ExtensionResult<T>> {}
    public processChild(node: T, parent: T): Void<ExtensionResult<T>> {}

    public addDescendant(node: T) {
        const map = this.application.session.extensionMap;
        const extensions = map.get(node);
        if (extensions) {
            if (!extensions.includes(this)) {
                extensions.push(this);
            }
        }
        else {
            map.set(node, [this]);
        }
    }

    public afterBaseLayout(sessionId: string, cache?: NodeList<T>) {}
    public afterConstraints(sessionId: string, cache?: NodeList<T>) {}
    public afterResources(sessionId: string, resourceId: number, cache?: NodeList<T>) {}
    public beforeBaseLayout(sessionId: string, cache?: NodeList<T>) {}

    public beforeFinalize(data: FinalizeDataExtensionUI<T>) {}
    public afterFinalize(data: FinalizeDataExtensionUI<T>) {}
}