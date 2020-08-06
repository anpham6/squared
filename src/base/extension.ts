export default abstract class Extension<T extends squared.base.Node> implements squared.base.Extension<T> {
    public enabled = true;
    public readonly options: StandardMap = {};
    public readonly dependencies: ExtensionDependency[] = [];
    public readonly subscribers = new Set<T>();
    public readonly data = new Map<T, unknown>();

    protected _application!: squared.base.Application<T>;
    protected _controller!: squared.base.Controller<T>;

    protected constructor(
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

    public require(name: string, preload = false) {
        this.dependencies.push({ name, preload });
    }

    public reset() {
        this.subscribers.clear();
        this.data.clear();
    }

    public beforeParseDocument(sessionId: string) {}
    public afterParseDocument(sessionId: string) {}

    set application(value) {
        this._application = value;
        this._controller = value.controllerHandler;
    }
    get application() {
        return this._application;
    }

    get controller() {
        return this._controller;
    }
}
