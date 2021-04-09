import type Application from './application';
import type Controller from './controller';
import type Resource from './resource';
import type Node from './node';

export default class Extension<T extends Node> implements squared.base.Extension<T> {
    public enabled = true;
    public controller!: Controller<T>;
    public resource: Null<Resource<T>> = null;
    public readonly data = new WeakMap<T, unknown>();
    public readonly options: StandardMap = {};
    public readonly dependencies: ExtensionDependency[] = [];
    public readonly subscribers = new Set<T>();

    protected _application!: Application<T>;

    constructor(
        public readonly name: string,
        public readonly framework: number,
        options?: ExtensionOptions)
    {
        if (options) {
            const items = options.dependencies;
            if (items) {
                for (const item of items) {
                    this.dependencies.push(item);
                }
            }
            Object.assign(this.options, options);
        }
    }

    public beforeInsertNode?: (element: HTMLElement, sessionId: string) => boolean;
    public afterInsertNode?: (node: T) => boolean;

    public require(value: ExtensionDependency) {
        this.dependencies.push(value);
    }

    public reset() {
        if (this.subscribers.size) {
            this.subscribers.clear();
        }
    }

    public beforeParseDocument(sessionId: string) {}
    public afterParseDocument(sessionId: string) {}

    set application(value) {
        this._application = value;
        this.controller = value.controllerHandler;
        this.resource = value.resourceHandler;
    }
    get application() {
        return this._application;
    }
}
