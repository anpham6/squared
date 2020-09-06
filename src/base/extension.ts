import type Application from './application';
import type Controller from './controller';
import type Resource from './resource';
import type Node from './node';

export default class Extension<T extends Node> implements squared.base.Extension<T> {
    public enabled = true;
    public controller!: Controller<T>;
    public resource: Null<Resource<T>> = null;
    public readonly options: StandardMap = {};
    public readonly dependencies: ExtensionDependency[] = [];
    public readonly subscribers = new Set<T>();
    public readonly data = new Map<T, unknown>();

    protected _application!: Application<T>;

    constructor(
        public readonly name: string,
        public readonly framework: number,
        options?: ExtensionOptions)
    {
        if (options) {
            const dependencies = options.dependencies;
            if (dependencies) {
                for (const item of dependencies) {
                    this.dependencies.push(item);
                }
                delete options.dependencies;
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
        this.subscribers.clear();
        this.data.clear();
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
