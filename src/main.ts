import { AppFramework, UserSettings } from '../@types/base/application';

import Container from './lib/base/container';

import * as client from './lib/client';
import * as color from './lib/color';
import * as css from './lib/css';
import * as dom from './lib/dom';
import * as math from './lib/math';
import * as regex from './lib/regex';
import * as session from './lib/session';
import * as util from './lib/util';
import * as xml from './lib/xml';

type Node = squared.base.Node;
type Application = squared.base.Application<Node>;
type Extension = squared.base.Extension<Node>;
type ExtensionRequest = Extension | string | null;

const extensionsAsync = new Set<Extension>();
const optionsAsync = new Map<string, ExternalData>();
const settings = <UserSettings> {};
const system = <FunctionMap<any>> {};
let main: Application;
let framework: AppFramework<Node>;

const checkMain = () => main?.initializing === false && main.length > 0;

export function setFramework(value: AppFramework<Node>, cached = false) {
    const reloading = framework !== undefined;
    if (framework !== value) {
        const appBase = cached ? value.cached() : value.create();
        if (!reloading) {
            Object.assign(appBase.userSettings, settings);
        }
        Object.assign(settings, appBase.userSettings);
        main = appBase.application;
        main.userSettings = settings;
        const { builtInExtensions, extensions } = main;
        function includeExtension(extension: Extension) {
            if (!extensions.includes(extension)) {
                extension.application = main;
                extensions.push(extension);
            }
        }
        extensions.length = 0;
        for (let namespace of settings.builtInExtensions) {
            const extension = builtInExtensions[namespace];
            if (extension) {
                includeExtension(extension);
            }
            else {
                namespace += '.';
                for (const name in builtInExtensions) {
                    if (name.startsWith(namespace)) {
                        includeExtension(builtInExtensions[name]);
                    }
                }
            }
        }
        framework = value;
        if (reloading) {
            for (const attr of Object.keys(system)) {
                delete system[attr];
            }
        }
        Object.assign(system, value.system);
    }
    if (reloading) {
        reset();
    }
}

export function parseDocument(...elements: (HTMLElement | string)[]): squared.PromiseResult {
    if (main) {
        if (settings.handleExtensionsAsync) {
            const extensionManager = main.extensionManager;
            for (const item of extensionsAsync) {
                extensionManager.include(item);
            }
            for (const [name, options] of optionsAsync.entries()) {
                configure(name, options);
            }
            extensionsAsync.clear();
            optionsAsync.clear();
        }
        if (!main.closed) {
            return main.parseDocument(...elements);
        }
        else if (!settings.showErrorMessages || confirm('ERROR: Document is closed. Reset and rerun?')) {
            main.reset();
            return main.parseDocument(...elements);
        }
    }
    else if (settings.showErrorMessages) {
        alert('ERROR: Framework not installed.');
    }
    const PromiseResult = class {
        public then(resolve: () => void) {}
    };
    return new PromiseResult();
}

export function include(value: ExtensionRequest, options?: {}) {
    if (main) {
        if (typeof value === 'string') {
            value = value.trim();
            value = main.builtInExtensions[value] || retrieve(value);
        }
        if (value instanceof squared.base.Extension && main.extensionManager.include(value)) {
            if (options) {
                configure(value, options);
            }
            return true;
        }
    }
    return false;
}

export function includeAsync(value: ExtensionRequest, options?: {}) {
    if (include(value, options)) {
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

export function exclude(value: ExtensionRequest) {
    if (main) {
        const extensionManager = main.extensionManager;
        if (typeof value === 'string') {
            value = extensionManager.retrieve(value.trim());
        }
        if (value instanceof squared.base.Extension) {
            extensionsAsync.delete(value);
            return extensionManager.exclude(value);
        }
    }
    return false;
}

export function configure(value: ExtensionRequest, options: {}) {
    if (util.isPlainObject(options)) {
        if (typeof value === 'string') {
            if (main) {
                value = value.trim();
                const extension = main.extensionManager.retrieve(value) || util.findSet(extensionsAsync, item => item.name === value);
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
        else if (value instanceof squared.base.Extension) {
            Object.assign(value.options, options);
            return true;
        }
    }
    return false;
}

export function retrieve(value: string) {
    return main?.extensionManager.retrieve(value) || null;
}

export function reset() {
    main?.reset();
}

export function ready() {
    return main?.initializing === false && !main.closed;
}

export function close() {
    if (checkMain()) {
        main.finalize();
    }
}

export function copyToDisk(value: string, callback?: CallbackResult) {
    if (checkMain() && util.isString(value)) {
        if (!main.closed) {
            main.finalize();
        }
        main.copyToDisk(value, callback);
    }
}

export function appendToArchive(value: string) {
    if (checkMain() && util.isString(value)) {
        if (!main.closed) {
            main.finalize();
        }
        main.appendToArchive(value);
    }
}

export function saveToArchive(value?: string) {
    if (checkMain()) {
        if (!main.closed) {
            main.finalize();
        }
        main.saveToArchive(value);
    }
}

export function toString() {
    return main?.toString() || '';
}

export function apply(value: any, options: {}) {
    return include(value, options);
}

export function saveAllToDisk() {
    saveToArchive();
}

const lib = {
    base: {
        Container
    },
    client,
    color,
    css,
    dom,
    math,
    regex,
    session,
    util,
    xml
};

export { lib, system, settings };