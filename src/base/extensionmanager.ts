import type Application from './application';
import type Extension from './extension';
import type Node from './node';

const { hasBit, isObject } = squared.lib.util;

export default class ExtensionManager<T extends Node> implements squared.base.ExtensionManager<T> {
    constructor(public readonly application: Application<T>) {}

    public add(ext: Extension<T> | string) {
        const { application, extensions } = this;
        if (typeof ext === 'string') {
            const item = this.get(ext, true);
            if (!item) {
                return false;
            }
            ext = item;
        }
        const name = ext.name;
        const index = extensions.findIndex(item => item.name === name);
        if (index !== -1) {
            extensions[index] = ext;
            return true;
        }
        else {
            const { framework, dependencies } = ext;
            if (framework) {
                for (let i = 0, length = dependencies.length; i < length; ++i) {
                    const item = dependencies[i];
                    if (item.preload && !this.get(item.name)) {
                        const extension = application.builtInExtensions.get(item.name);
                        if (extension) {
                            this.add(extension);
                        }
                    }
                }
            }
            if ((framework === 0 || hasBit(framework, application.framework)) && dependencies.every(item => !!this.get(item.name))) {
                ext.application = application;
                extensions.push(ext);
                return true;
            }
        }
        return false;
    }

    public remove(ext: Extension<T> | string) {
        const extensions = this.extensions;
        if (typeof ext === 'string') {
            ext = this.get(ext, true) as Extension<T>;
            if (!ext) {
                return false;
            }
        }
        for (let i = 0, length = extensions.length; i < length; ++i) {
            if (extensions[i] === ext) {
                extensions.splice(i, 1);
                return true;
            }
        }
        return false;
    }

    public get(name: string, builtIn?: boolean) {
        const extensions = this.extensions;
        for (let i = 0, length = extensions.length; i < length; ++i) {
            const ext = extensions[i];
            if (ext.name === name) {
                return ext;
            }
        }
        if (builtIn) {
            return this.application.builtInExtensions.get(name);
        }
    }

    public valueOf<U = unknown>(name: string, attr: string, fallback?: U): Undef<U> {
        const options = this.get(name, true)?.options;
        return isObject(options) ? options[attr] as U : fallback;
    }

    public valueAsObject(name: string, attr: string, fallback = null) {
        const value = this.valueOf(name, attr);
        return isObject(value) ? value : fallback;
    }

    public valueAsString(name: string, attr: string, fallback = '') {
        const value = this.valueOf(name, attr);
        return typeof value === 'string' ? value : fallback;
    }

    public valueAsNumber(name: string, attr: string, fallback = NaN) {
        const value = this.valueOf(name, attr);
        return typeof value === 'number' ? value : fallback;
    }

    public valueAsBoolean(name: string, attr: string, fallback = false) {
        const value = this.valueOf(name, attr);
        return typeof value === 'boolean' ? value : fallback;
    }

    get extensions() {
        return this.application.extensions;
    }
}