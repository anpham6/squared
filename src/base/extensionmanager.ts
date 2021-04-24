import type Application from './application';
import type Node from './node';

import Extension from './extension';

const { findSet, isObject } = squared.lib.util;

export default class ExtensionManager<T extends Node> implements squared.base.ExtensionManager<T> {
    public readonly cache: Set<Extension<T>> = new Set();

    constructor(public readonly application: Application<T>) {}

    public add(ext: Extension<T> | string) {
        if (typeof ext === 'string' && !(ext = this.get(ext, true) as Extension<T>)) {
            return false;
        }
        if (ext instanceof Extension) {
            const { application, extensions } = this;
            if (ext.framework === 0 || ext.framework & application.framework) {
                ext.application = application;
                if (!extensions.includes(ext)) {
                    extensions.push(ext);
                }
                return true;
            }
        }
        return false;
    }

    public remove(ext: Extension<T> | string) {
        if (typeof ext === 'string' && !(ext = this.get(ext, true) as Extension<T>)) {
            return false;
        }
        if (ext instanceof Extension) {
            const name = ext.name;
            const index = this.extensions.findIndex(item => item.name === name);
            if (index !== -1) {
                this.extensions.splice(index, 1);
                return true;
            }
        }
        return false;
    }

    public get(name: string, builtIn?: boolean): Undef<Extension<T>> {
        return this.extensions.find(item => item.name === name) || findSet(this.cache, item => item.name === name) || (builtIn ? this.application.builtInExtensions.get(name) : undefined);
    }

    public checkDependencies() {
        const { application, extensions } = this;
        let result: Undef<string[]>;
        for (let i = 0; i < extensions.length; ++i) {
            const items = extensions[i].dependencies;
            for (let j = 0, k = 1, q = items.length; j < q; ++j) {
                const item = items[j];
                const name = item.name;
                const index = extensions.findIndex(ext => ext.name === name);
                if (index === -1) {
                    const ext = application.builtInExtensions.get(name);
                    if (ext) {
                        ext.application = application;
                        if (item.leading) {
                            extensions.splice(i - 1, 0, ext);
                        }
                        else if (item.trailing) {
                            extensions.splice(i + k++, 0, ext);
                        }
                        else {
                            extensions.push(ext);
                        }
                        continue;
                    }
                }
                if (index !== -1) {
                    if (item.leading) {
                        if (index > i) {
                            extensions.splice(i - 1, 0, extensions.splice(index, 1)[0]);
                        }
                    }
                    else if (item.trailing) {
                        if (index < i) {
                            extensions.splice(i + 1 + k++, 0, extensions.splice(index, 1)[0]);
                        }
                    }
                }
                else {
                    (result ||= []).push(extensions[i].name + `[${name}]`);
                    extensions.splice(i--, 1);
                    break;
                }
            }
        }
        return result;
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