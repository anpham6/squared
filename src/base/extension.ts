import { ExtensionDependency } from '../../@types/base/application';

export default abstract class Extension<T extends squared.base.Node> implements squared.base.Extension<T> {
    public controller!: squared.base.Controller<T>;
    public readonly options: ExternalData = {};
    public readonly dependencies: ExtensionDependency[] = [];
    public readonly subscribers = new Set<T>();

    protected _application!: squared.base.Application<T>;

    constructor(
        public readonly name: string,
        public readonly framework: number,
        options?: ExternalData)
    {
        if (options) {
            Object.assign(this.options, options);
        }
    }

    public require(name: string, preload = false) {
        this.dependencies.push({ name, preload });
    }

    public beforeParseDocument() {}
    public afterParseDocument() {}

    set application(value) {
        this._application = value;
        this.controller = value.controllerHandler;
    }
    get application() {
        return this._application;
    }
}
