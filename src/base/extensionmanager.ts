import Application from './application';
import Extension from './extension';
import Node from './node';

const $util = squared.lib.util;

export default abstract class ExtensionManager<T extends Node> implements squared.base.ExtensionManager<T> {
    protected constructor(public readonly application: Application<T>) {
    }

    public include(ext: Extension<T>) {
        const found = this.retrieve(ext.name);
        if (found) {
            if (Array.isArray(ext.tagNames)) {
                found.tagNames = ext.tagNames;
            }
            Object.assign(found.options, ext.options);
            return true;
        }
        else {
            const application = this.application;
            if ((ext.framework === 0 || $util.hasBit(ext.framework, application.framework)) && ext.dependencies.every(item => !!this.retrieve(item.name))) {
                ext.application = application;
                if (!application.extensions.includes(ext)) {
                    application.extensions.push(ext);
                }
                return true;
            }
        }
        return false;
    }

    public exclude(ext: Extension<T>) {
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
        const ext = this.retrieve(name);
        if (ext && typeof ext.options === 'object') {
            return ext.options[attr];
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