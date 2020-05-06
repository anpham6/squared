import { AppFramework } from '../@types/base/internal';
import { FileActionOptions, UserSettings } from '../@types/base/application';

import Container from './lib/base/container';
import ArrayIterator from './lib/base/arrayiterator';
import ListIterator from './lib/base/listiterator';

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

function deleteProperties(data: {}) {
    for (const attr in data) {
        delete data[attr];
    }
}

const checkWritable = (app: Undef<Application>): app is Application => app?.initializing === false && app.length > 0;

export function setHostname(value: string) {
    if (main?.fileHandler) {
        const match = regex.COMPONENT.PROTOCOL.exec(value);
        if (match && match[1].startsWith('http')) {
            main.fileHandler.hostname = match[1] + match[2] + (match[3] || '');
        }
    }
}

export function setFramework(value: AppFramework<Node>, options?: ObjectMap<any>, cached = false) {
    const reloading = framework !== undefined;
    if (framework !== value) {
        const appBase = cached ? value.cached() : value.create();
        if (util.isPlainObject(options)) {
            Object.assign(appBase.userSettings, options);
        }
        deleteProperties(settings);
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
        if (reloading) {
            deleteProperties(system);
        }
        Object.assign(system, value.system);
        framework = value;
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

export function parseDocument(...elements: (HTMLElement | string)[]) {
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
    return session.frameworkNotInstalled<void>();
}

export function include(value: ExtensionRequest, options?: {}) {
    if (typeof value === 'string') {
        value = value.trim();
        value = main?.builtInExtensions[value] || retrieve(value);
    }
    if (value instanceof squared.base.Extension) {
        extensionsExternal.add(value);
        if (!(main?.extensionManager.include(value) === true)) {
            extensionsQueue.add(value);
        }
        if (options) {
            configure(value, options);
        }
        return true;
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
            value = value.trim();
            const extension = main?.extensionManager.retrieve(value) || util.findSet(extensionsQueue, item => item.name === value);
            if (extension) {
                Object.assign(extension.options, options);
            }
            else {
                optionsQueue.set(value, options);
            }
            return true;
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
        return main.copyToDisk(value, options);
    }
    return session.frameworkNotInstalled();
}

export function appendToArchive(value: string, options?: FileActionOptions) {
    if (checkWritable(main) && util.isString(value)) {
        main.finalize();
        return main.appendToArchive(value, options);
    }
    return session.frameworkNotInstalled();
}

export function saveToArchive(value?: string, options?: FileActionOptions) {
    if (checkWritable(main)) {
        main.finalize();
        return main.saveToArchive(value, options);
    }
    return session.frameworkNotInstalled();
}

export function createFrom(value: string, options: FileActionOptions) {
    if (checkWritable(main) && util.isString(value) && util.isPlainObject(options) && options.assets?.length) {
        return main.createFrom(value, options);
    }
    return session.frameworkNotInstalled();
}

export function appendFromArchive(value: string, options: FileActionOptions) {
    if (checkWritable(main) && util.isString(value) && util.isPlainObject(options) && options.assets?.length) {
        return main.appendFromArchive(value, options);
    }
    return session.frameworkNotInstalled();
}

export function toString() {
    return main?.toString() || '';
}

const lib = {
    base: {
        Container,
        ArrayIterator,
        ListIterator
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