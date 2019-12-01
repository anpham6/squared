const { hasBit } = squared.lib.util;

export default abstract class ExtensionManager<T extends squared.base.Node> implements squared.base.ExtensionManager<T> {
    protected constructor(public readonly application: squared.base.Application<T>) {
    }

    public include(ext: squared.base.Extension<T>) {
        const application = this.application;
        const extensions = application.extensions;
        const index = extensions.findIndex(item => item.name === ext.name);
        if (index !== -1) {
            extensions[index] = ext;
            return true;
        }
        else {
            const framework = ext.framework;
            if (framework > 0) {
                for (const item of ext.dependencies) {
                    if (item.preload && this.retrieve(item.name) === null) {
                        const extension = application.builtInExtensions[item.name];
                        if (extension) {
                            this.include(extension);
                        }
                    }
                }
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
        const extensions = this.application.extensions;
        for (let i = 0; i < extensions.length; i++) {
            if (extensions[i] === ext) {
                extensions.splice(i, 1);
                return true;
            }
        }
        return false;
    }

    public retrieve(name: string) {
        for (const ext of this.application.extensions) {
            if (ext.name === name) {
                return ext;
            }
        }
        return null;
    }

    public optionValue(name: string, attr: string) {
        const options = this.retrieve(name)?.options;
        if (typeof options === 'object') {
            return options[attr];
        }
        return undefined;
    }

    public optionValueAsObject(name: string, attr: string) {
        const value = this.optionValue(name, attr);
        if (typeof value === 'object') {
            return value as object;
        }
        return null;
    }

    public optionValueAsString(name: string, attr: string) {
        const value = this.optionValue(name, attr);
        return typeof value === 'string' ? value : '';
    }

    public optionValueAsNumber(name: string, attr: string) {
        const value = this.optionValue(name, attr);
        return typeof value === 'number' ? value : 0;
    }

    public optionValueAsBoolean(name: string, attr: string) {
        const value = this.optionValue(name, attr);
        return typeof value === 'boolean' ? value : false;
    }
}