import { AppFramework } from '../@types/base/internal';
import { FileActionOptions, UserSettings } from '../@types/base/application';

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
type ExtensionRequest = Null<Extension | string>;

const extensionsQueue = new Set<Extension>();
const optionsQueue = new Map<string, StandardMap>();
const settings = <UserSettings> {};
const extensionsExternal = new Set<Extension>();
const system = <FunctionMap<any>> {};
let main: Undef<Application>;
let framework: AppFramework<Node>;

function includeExtension(extensions: Extension[], ext: Extension) {
    if (main && !extensions.includes(ext)) {
        ext.application = main;
        extensions.push(ext);
    }
}

const checkWritable = (app: Undef<Application>): app is Application => app?.initializing === false && app.length > 0;

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
        extensions.length = 0;
        settings.builtInExtensions.forEach(namespace => {
            const ext = builtInExtensions[namespace];
            if (ext) {
                includeExtension(extensions, ext);
            }
            else {
                namespace += '.';
                for (const name in builtInExtensions) {
                    if (name.startsWith(namespace)) {
                        includeExtension(extensions, builtInExtensions[name]);
                    }
                }
            }
        });
        framework = value;
        if (reloading) {
            Object.keys(system).forEach(attr => delete system[attr]);
        }
        Object.assign(system, value.system);
    }
    if (reloading) {
        reset();
    }
}

export function setViewModel(data?: {}) {
    if (main) {
        main.viewModel = data;
    }
}

export function parseDocument(...elements: (HTMLElement | string)[]): PromiseObject {
    if (main) {
        const extensionManager = main.extensionManager;
        for (const item of extensionsQueue) {
            extensionManager.include(item);
        }
        for (const [name, options] of optionsQueue.entries()) {
            configure(name, options);
        }
        extensionsQueue.clear();
        optionsQueue.clear();
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
    return new class {
        public then(callback: FunctionVoid) {
            return this;
        }
        public catch(callback: (error: Error) => void) {
            callback(new Error('Framework not installed.'));
            return this;
        }
        public finally(callback: FunctionVoid) {
            return this;
        }
    }();
}

export async function parseDocumentAsync(...elements: (HTMLElement | string)[]): Promise<PromiseObject> {
    return await parseDocument(...elements);
}

export function include(value: ExtensionRequest, options?: {}) {
    if (main) {
        if (typeof value === 'string') {
            value = value.trim();
            value = main.builtInExtensions[value] || retrieve(value);
        }
        if (value instanceof squared.base.Extension) {
            extensionsExternal.add(value);
            if (!main.extensionManager.include(value)) {
                extensionsQueue.add(value);
            }
            if (options) {
                configure(value, options);
            }
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
            extensionsQueue.delete(value);
            extensionsExternal.delete(value);
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
                const extension = main.extensionManager.retrieve(value) || util.findSet(extensionsQueue, item => item.name === value);
                if (extension) {
                    Object.assign(extension.options, options);
                    return true;
                }
                else {
                    optionsQueue.set(value, options);
                    return true;
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
    let result: Null<Extension> = null;
    if (main) {
        result = main.extensionManager.retrieve(value);
        if (result === null) {
            for (const ext of extensionsExternal) {
                if (ext.name === value) {
                    return ext;
                }
            }
        }
    }
    return result;
}

export function reset() {
    main?.reset();
}

export function ready() {
    return main?.initializing === false && !main.closed;
}

export function close() {
    if (checkWritable(main)) {
        main.finalize();
    }
}

export function copyToDisk(value: string, options?: FileActionOptions) {
    if (checkWritable(main) && util.isString(value)) {
        main.finalize();
        main.copyToDisk(value, options);
    }
}

export function appendToArchive(value: string, options?: FileActionOptions) {
    if (checkWritable(main) && util.isString(value)) {
        main.finalize();
        main.appendToArchive(value, options);
    }
}

export function saveToArchive(value?: string, options?: FileActionOptions) {
    if (checkWritable(main)) {
        main.finalize();
        main.saveToArchive(value, options);
    }
}

export function createFrom(value: string, options: FileActionOptions) {
    if (checkWritable(main) && util.isString(value) && util.isPlainObject(options) && options.assets?.length) {
        main.createFrom(value, options);
    }
}

export function appendFromArchive(value: string, options: FileActionOptions) {
    if (checkWritable(main) && util.isString(value) && util.isPlainObject(options) && options.assets?.length) {
        main.appendFromArchive(value, options);
    }
}

export function toString() {
    return main?.toString() || '';
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