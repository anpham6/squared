const { hasBit, isObject } = squared.lib.util;

export default class ExtensionManager<T extends squared.base.Node> implements squared.base.ExtensionManager<T> {
    constructor(public readonly application: squared.base.Application<T>) {}

    public include(ext: squared.base.Extension<T> | string) {
        const application = this.application;
        const extensions = application.extensions;
        if (typeof ext === 'string') {
            const item = this.retrieve(ext);
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
            if (framework > 0) {
                const length = dependencies.length;
                let i = 0;
                while (i < length) {
                    const item = dependencies[i++];
                    if (item.preload) {
                        if (!this.retrieve(item.name)) {
                            const extension = application.builtInExtensions[item.name];
                            if (extension) {
                                this.include(extension);
                            }
                        }
                    }
                }
            }
            if ((framework === 0 || hasBit(framework, application.framework)) && dependencies.every(item => !!this.retrieve(item.name))) {
                ext.application = application;
                extensions.push(ext);
                return true;
            }
        }
        return false;
    }

    public exclude(ext: squared.base.Extension<T> | string) {
        const extensions = this.extensions;
        const length = extensions.length;
        for (let i = 0; i < length; ++i) {
            if (extensions[i] === ext || typeof ext === 'string' && this.retrieve(ext)) {
                extensions.splice(i, 1);
                return true;
            }
        }
        return false;
    }

    public retrieve(name: string, checkBuiltIn = false) {
        const extensions = this.extensions;
        const length = extensions.length;
        let i = 0;
        while (i < length) {
            const ext = extensions[i++];
            if (ext.name === name) {
                return ext;
            }
        }
        return checkBuiltIn && this.application.builtInExtensions[name] || null;
    }

    public optionValue(name: string, attr: string, fallback = undefined) {
        const options = this.retrieve(name)?.options;
        return isObject(options) ? options[attr] : fallback;
    }

    public optionValueAsObject(name: string, attr: string, fallback = null) {
        const value = this.optionValue(name, attr);
        return isObject(value) ? value : fallback;
    }

    public optionValueAsString(name: string, attr: string, fallback = '') {
        const value = this.optionValue(name, attr);
        return typeof value === 'string' ? value : fallback;
    }

    public optionValueAsNumber(name: string, attr: string, fallback = NaN) {
        const value = this.optionValue(name, attr);
        return typeof value === 'number' ? value : fallback;
    }

    public optionValueAsBoolean(name: string, attr: string, fallback = false) {
        const value = this.optionValue(name, attr);
        return typeof value === 'boolean' ? value : fallback;
    }

    get extensions() {
        return this.application.extensions;
    }
}