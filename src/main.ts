import { AppFramework, UserSettings } from './base/@types/application';

import Container from './lib/base/container';

import * as color from './lib/color';
import * as dom from './lib/dom';
import * as util from './lib/util';
import * as xml from './lib/xml';

type T = squared.base.Node;
type Application = squared.base.Application<T>;
type Extension = squared.base.Extension<T>;

let main: Application | undefined;
let framework: AppFramework<T> | undefined;
let settings = {} as UserSettings;
let system = {} as FunctionMap<any>;

const extensionsAsync = new Set<Extension>();
const optionsAsync = new Map<string, ExternalData>();

export function setFramework(value: AppFramework<T>, cached = false) {
    if (framework !== value) {
        const appBase = cached ? value.cached() : value.create();
        if (framework === undefined) {
            Object.assign(appBase.userSettings, settings);
        }
        settings = appBase.userSettings;
        main = appBase.application;
        main.userSettings = settings;
        if (Array.isArray(settings.builtInExtensions)) {
            const register = new Set<Extension>();
            for (let namespace of settings.builtInExtensions) {
                namespace = namespace.trim();
                if (main.builtInExtensions[namespace]) {
                    register.add(main.builtInExtensions[namespace]);
                }
                else {
                    for (const extension in main.builtInExtensions) {
                        if (extension.startsWith(`${namespace}.`)) {
                            register.add(main.builtInExtensions[extension]);
                        }
                    }
                }
            }
            for (const extension of register) {
                main.extensionManager.include(extension);
            }
        }
        framework = value;
        system = value.system;
    }
    reset();
}

export function parseDocument(...elements: (string | HTMLElement)[]): FunctionMap<void> {
    if (main && !main.closed) {
        if (settings.handleExtensionsAsync) {
            for (const item of extensionsAsync) {
                main.extensionManager.include(item);
            }
            for (const [name, options] of optionsAsync.entries()) {
                configure(name, options);
            }
            extensionsAsync.clear();
            optionsAsync.clear();
        }
        return main.parseDocument(...elements);
    }
    return {
        then: (callback: () => void) => {
            if (!main) {
                alert('ERROR: Framework not installed.');
            }
            else if (main.closed) {
                if (confirm('ERROR: Document is closed. Reset and rerun?')) {
                    main.reset();
                    parseDocument.call(null, ...elements).then(callback);
                }
            }
        }
    };
}

export function include(value: Extension | string) {
    if (main) {
        if (value instanceof squared.base.Extension) {
            return main.extensionManager.include(value);
        }
        else if (typeof value === 'string') {
            value = value.trim();
            const extension = main.builtInExtensions[value] || retrieve(value);
            if (extension) {
                return main.extensionManager.include(extension);
            }
        }
    }
    return false;
}

export function includeAsync(value: Extension | string) {
    if (include(value)) {
        return true;
    }
    else if (value instanceof squared.base.Extension) {
        extensionsAsync.add(value);
        if (settings.handleExtensionsAsync) {
            return true;
        }
    }
    return false;
}

export function exclude(value: Extension | string) {
    if (main) {
        if (value instanceof squared.base.Extension) {
            if (extensionsAsync.has(value)) {
                extensionsAsync.delete(value);
                main.extensionManager.exclude(value);
                return true;
            }
            else {
                return main.extensionManager.exclude(value);
            }
        }
        else if (typeof value === 'string') {
            value = value.trim();
            const extension = main.extensionManager.retrieve(value);
            if (extension) {
                return main.extensionManager.exclude(extension);
            }
        }
    }
    return false;
}

export function configure(value: Extension | string, options: {}) {
    if (typeof options === 'object') {
        if (value instanceof squared.base.Extension) {
            Object.assign(value.options, options);
            return true;
        }
        else if (typeof value === 'string') {
            if (main) {
                value = value.trim();
                const extension = main.extensionManager.retrieve(value) || Array.from(extensionsAsync).find(item => item.name === value);
                if (extension) {
                    Object.assign(extension.options, options);
                    return true;
                }
                else {
                    optionsAsync.set(value, options);
                    if (settings.handleExtensionsAsync) {
                        return true;
                    }
                }
            }
        }
    }
    return false;
}

export function apply(value: Extension | string, options?: ExternalData) {
    if (value instanceof squared.base.Extension) {
        return include(value);
    }
    else if (typeof value === 'string') {
        value = value.trim();
        if (typeof options === 'object') {
            return configure(value, options);
        }
        else {
            return retrieve(value);
        }
    }
    return false;
}

export function retrieve(value: string) {
    return main && main.extensionManager.retrieve(value);
}

export function ready() {
    return !!main && !main.initialized && !main.closed;
}

export function close() {
    if (main && !main.initialized && main.size) {
        main.finalize();
    }
}

export function reset() {
    if (main) {
        main.reset();
    }
}

export function saveAllToDisk() {
    if (main && !main.initialized && main.size) {
        if (!main.closed) {
            main.finalize();
        }
        main.saveAllToDisk();
    }
}

export function toString() {
    return main ? main.toString() : '';
}

const lib = {
    base: {
        Container
    },
    color,
    dom,
    util,
    xml
};

export { lib, system, settings };