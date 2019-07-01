import { AppFramework, UserSettings } from './base/@types/application';

import Container from './lib/base/container';

import * as color from './lib/color';
import * as constant from './lib/constant';
import * as client from './lib/client';
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

const extensionsAsync = new Set<Extension>();
const optionsAsync = new Map<string, ExternalData>();
let main: Application;
let framework: AppFramework<Node>;
let settings = <UserSettings> {};
let system = <FunctionMap<any>> {};

const checkMain = () => !!main && !main.initializing && main.length > 0;

export function setFramework(value: AppFramework<Node>, cached = false) {
    const reloading = framework !== undefined;
    if (framework !== value) {
        const appBase = cached ? value.cached() : value.create();
        if (framework === undefined) {
            Object.assign(appBase.userSettings, settings);
        }
        settings = appBase.userSettings;
        main = appBase.application;
        main.userSettings = settings;
        const builtInExtensions = main.builtInExtensions;
        const extensions = main.extensions;
        function includeExtension(extension: Extension) {
            if (!extensions.includes(extension)) {
                extension.application = <Application> main;
                extensions.push(extension);
            }
        }
        extensions.length = 0;
        for (const namespace of settings.builtInExtensions) {
            const extension = builtInExtensions[namespace];
            if (extension) {
                includeExtension(extension);
            }
            else {
                for (const name in builtInExtensions) {
                    if (name.startsWith(`${namespace}.`)) {
                        includeExtension(builtInExtensions[name]);
                    }
                }
            }
        }
        framework = value;
        system = value.system;
    }
    if (reloading) {
        reset();
    }
}

export function parseDocument(...elements: (string | HTMLElement)[]): squared.PromiseResult {
    if (main) {
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

export function include(value: any, options?: {}) {
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

export function includeAsync(value: any, options?: {}) {
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

export function exclude(value: any) {
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

export function configure(value: any, options: {}) {
    if (util.isPlainObject(options)) {
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

export function apply(value: any, options: {}) {
    return include(value, options);
}

export function retrieve(value: string) {
    return main && main.extensionManager.retrieve(value);
}

export function reset() {
    if (main) {
        main.reset();
    }
}

export function ready() {
    return !!main && !main.initializing && !main.closed;
}

export function close() {
    if (checkMain()) {
        main.finalize();
    }
}

export function copyToDisk(value: string) {
    if (checkMain() && util.isString(value)) {
        if (!main.closed) {
            main.finalize();
        }
        main.copyToDisk(value);
    }
}

export function saveToArchive(value?: string) {
    if (checkMain()) {
        if (!main.closed) {
            main.finalize();
        }
        main.saveToArchive(value || settings.outputArchiveName);
    }
}

export function saveAllToDisk() {
    saveToArchive();
}

export function toString() {
    return main ? main.toString() : '';
}

const lib = {
    base: {
        Container
    },
    color,
    constant,
    client,
    css,
    dom,
    math,
    regex,
    session,
    util,
    xml
};

export { lib, system, settings };