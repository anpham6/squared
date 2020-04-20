const { hasBit, isObject } = squared.lib.util;

export default abstract class ExtensionManager<T extends squared.base.Node> implements squared.base.ExtensionManager<T> {
    protected constructor(public readonly application: squared.base.Application<T>) {}

    public include(ext: squared.base.Extension<T>) {
        const application = this.application;
        const extensions = application.extensions;
        let name = ext.name;
        const index = extensions.findIndex(item => item.name === name);
        if (index !== -1) {
            extensions[index] = ext;
            return true;
        }
        else {
            const framework = ext.framework;
            if (framework > 0) {
                ext.dependencies.forEach(item => {
                    if (item.preload) {
                        name = item.name;
                        if (this.retrieve(name) === null) {
                            const extension = application.builtInExtensions[name];
                            if (extension) {
                                this.include(extension);
                            }
                        }
                    }
                });
            }
            if ((framework === 0 || hasBit(framework, application.framework)) && ext.dependencies.every(item => !!this.retrieve(item.name))) {
                ext.application = application;
                extensions.push(ext);
                return true;
            }
        }
        return false;
    }

    public exclude(ext: squared.base.Extension<T>) {
        const extensions = this.extensions;
        const length = extensions.length;
        for (let i = 0; i < length; ++i) {
            if (extensions[i] === ext) {
                extensions.splice(i, 1);
                return true;
            }
        }
        return false;
    }

    public retrieve(name: string) {
        const extensions = this.extensions;
        const length = extensions.length;
        let i = 0;
        while (i < length) {
            const ext = extensions[i++];
            if (ext.name === name) {
                return ext;
            }
        }
        return null;
    }

    public optionValue(name: string, attr: string) {
        const options = this.retrieve(name)?.options;
        return isObject(options) ? options[attr] : undefined;
    }

    public optionValueAsObject(name: string, attr: string) {
        const value = this.optionValue(name, attr);
        return isObject(value) ? value : null;
    }

    public optionValueAsString(name: string, attr: string) {
        const value = this.optionValue(name, attr);
        return typeof value === 'string' ? value : '';
    }

    public optionValueAsNumber(name: string, attr: string) {
        const value = this.optionValue(name, attr);
        return typeof value === 'number' ? value : NaN;
    }

    public optionValueAsBoolean(name: string, attr: string) {
        const value = this.optionValue(name, attr);
        return typeof value === 'boolean' ? value : false;
    }

    get extensions() {
        return this.application.extensions;
    }
}