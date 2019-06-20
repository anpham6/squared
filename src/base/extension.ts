import { ExtensionDependency } from './@types/application';

import Application from './application';
import Node from './node';

export default abstract class Extension<T extends Node> implements squared.base.Extension<T> {
    public eventOnly = false;
    public preloaded = false;
    public documentBase = false;
    public application!: Application<T>;
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

    get installed() {
        return !!this.application && this.application.extensions.includes(this);
    }
}
