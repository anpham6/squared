import Extension from './extension';

type NodeUI = squared.base.NodeUI;

const { capitalize, includes } = squared.lib.util;

export default abstract class ExtensionUI<T extends NodeUI> extends Extension<T> implements squared.base.ExtensionUI<T> {
    public static findNestedElement(node: NodeUI, name: string) {
        if (node.styleElement) {
            const systemName = capitalize(node.localSettings.systemName);
            const children = (node.element as HTMLElement).children;
            const length = children.length;
            let i = 0;
            while (i < length) {
                const item = children[i++] as HTMLElement;
                if (includes(item.dataset['use' + systemName] || item.dataset.use, name)) {
                    return item;
                }
            }
        }
        return null;
    }

    public init?: (element: HTMLElement, sessionId: string) => boolean;

    public readonly tagNames: string[];
    public readonly eventOnly?: boolean;
    public readonly documentBase?: boolean;
    public readonly cascadeAll?: boolean;

    protected _application!: squared.base.ApplicationUI<T>;
    protected _controller!: squared.base.ControllerUI<T>;
    protected _resource?: squared.base.ResourceUI<T>;

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
        return node.use ? this.included(node.element as HTMLElement) : !this._isAll;
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
        const extensions = map.get(node.id);
        if (extensions) {
            if (!extensions.includes(this)) {
                extensions.push(this);
            }
        }
        else {
            map.set(node.id, [this]);
        }
    }

    public postBaseLayout(node: T) {}
    public postConstraints(node: T) {}
    public postOptimize(node: T, rendered: T[]) {}

    public afterBaseLayout(sessionId: string) {}
    public afterConstraints(sessionId: string) {}
    public afterResources(sessionId: string) {}

    public beforeBaseLayout(sessionId: string) {}

    public beforeCascade(rendered: T[], documentRoot: squared.base.LayoutRoot<T>[]) {}
    public afterFinalize() {}

    set application(value) {
        this._application = value;
        this._controller = value.controllerHandler;
        this._resource = value.resourceHandler;
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
}