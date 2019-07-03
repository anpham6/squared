import { ExtensionDependency } from '../../@types/base/application';

export default abstract class Extension<T extends squared.base.Node> implements squared.base.Extension<T> {
    public application!: squared.base.Application<T>;
    public readonly options: ExternalData = {};
    public readonly dependencies: ExtensionDependency[] = [];
    public readonly subscribers = new Set<T>();

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
}
