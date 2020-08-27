import * as client from './lib/client';
import * as color from './lib/color';
import * as css from './lib/css';
import * as dom from './lib/dom';
import * as error from './lib/error';
import * as math from './lib/math';
import * as regex from './lib/regex';
import * as session from './lib/session';
import * as util from './lib/util';

import Container from './lib/base/container';
import ArrayIterator from './lib/base/arrayiterator';
import ListIterator from './lib/base/listiterator';
import Pattern from './lib/base/pattern';

type Node = squared.base.Node;
type Main = squared.base.Application<Node>;
type Framework = squared.base.AppFramework<Node>;
type Extension = squared.base.Extension<Node>;
type ExtensionRequest = Undef<Extension | string>;
type FileActionOptions = squared.FileActionOptions;

const extensionsQueue = new Set<Extension>();
const extensionsExternal = new Set<Extension>();
const optionsQueue = new Map<string, StandardMap>();
const prototypeMap = new Map<number, squared.ExtendPrototypeMap>();
const settings = {} as UserSettings;
const system = {} as FunctionMap<any>;

let main: Null<Main> = null;
let framework: Null<Framework> = null;
let extensionManager: Null<squared.base.ExtensionManager<Node>> = null;

function clearProperties(data: StandardMap) {
    for (const attr in data) {
        delete data[attr];
    }
}

function extendPrototype(id: number) {
    const proto = main!.Node.prototype;
    for (const [value, functionMap] of prototypeMap.entries()) {
        if (value === 0 || util.hasBit(value, id)) {
            for (const method in functionMap) {
                const item = functionMap[method];
                if (util.isPlainObject(item)) {
                    const property: ObjectMap<FunctionType<any>> = {};
                    let valid: Undef<boolean>;
                    if (typeof item.get === 'function') {
                        property.get = item.get;
                        valid = true;
                    }
                    if (typeof item.set === 'function') {
                        property.set = item.set;
                        valid = true;
                    }
                    if (valid) {
                        Object.defineProperty(proto, method, property);
                        continue;
                    }
                }
                proto[method] = item;
            }
        }
    }
}

function setupExtensions(list: string[]) {
    const { builtInExtensions, extensions } = main!;
    extensions.length = 0;
    for (let i = 0, length = list.length; i < length; ++i) {
        let name = list[i],
            ext = builtInExtensions.get(name);
        if (ext) {
            ext.application = main!;
            extensions.push(ext);
        }
        else {
            const namespace = name + '.';
            for ([name, ext] of builtInExtensions.entries()) {
                if (name.startsWith(namespace) && !extensions.includes(ext)) {
                    ext.application = main!;
                    extensions.push(ext);
                }
            }
        }
    }
}

function loadExtensions() {
    if (extensionManager) {
        if (extensionsQueue.size) {
            for (const item of extensionsQueue) {
                extensionManager.include(item);
            }
            extensionsQueue.clear();
        }
    }
    if (optionsQueue.size) {
        for (const [name, options] of optionsQueue.entries()) {
            configure(name, options);
        }
        optionsQueue.clear();
    }
}

function findElement(element: HTMLElement, sync: boolean, cache: boolean) {
    if (cache) {
        const result = main!.elementMap.get(element);
        if (result) {
            return sync ? result : Promise.resolve(result);
        }
    }
    return sync ? main!.parseDocumentSync(element) as Node : main!.parseDocument(element) as Promise<Node>;
}

async function findElementAsync(element: HTMLElement, cache: boolean) {
    if (cache) {
        const result = main!.elementMap.get(element);
        if (result) {
            return Promise.resolve([result]);
        }
    }
    return [await main!.parseDocument(element) as Node];
}

function findElementAll(query: NodeListOf<Element>, length: number) {
    let incomplete: Undef<boolean>;
    const elementMap = main!.elementMap;
    const result: Node[] = new Array(length);
    for (let i = 0; i < length; ++i) {
        const element = query[i] as HTMLElement;
        const item = elementMap.get(element) || main!.parseDocumentSync(element) as Node;
        if (item) {
            result[i] = item;
        }
        else {
            incomplete = true;
        }
    }
    return !incomplete ? result : util.flatArray<Node>(result, 0);
}

async function findElementAllAsync(query: NodeListOf<Element>, length: number) {
    let incomplete: Undef<boolean>;
    const elementMap = main!.elementMap;
    const result: Node[] = new Array(length);
    for (let i = 0; i < length; ++i) {
        const element = query[i] as HTMLElement;
        const item = elementMap.get(element) || await main!.parseDocument(element) as Node;
        if (item) {
            result[i] = item;
        }
        else {
            incomplete = true;
        }
    }
    return !incomplete ? result : util.flatArray<Node>(result, 0);
}

const checkWritable = (app: Null<Main>): app is Main => app ? !app.initializing && app.length > 0 : false;
const checkFrom = (value: string, options: FileActionOptions) => checkWritable(main) && util.isString(value) && util.isPlainObject<FileActionOptions>(options) && options.assets && options.assets.length > 0;

export function setHostname(value: string) {
    if (main) {
        const fileHandler = main.resourceHandler?.fileHandler;
        if (fileHandler) {
            const match = regex.FILE.PROTOCOL.exec(value);
            if (match && match[1].startsWith('http')) {
                fileHandler.hostname = match[1] + match[2] + (match[3] || '');
            }
        }
    }
}

export function setFramework(value: Framework, options?: squared.FrameworkOptions) {
    const reloading = framework !== null;
    let userSettings: Undef<StandardMap>,
        saveAs: Undef<string>,
        loadAs: Undef<string>,
        cache: Undef<boolean>;
    if (options) {
        ({ settings: userSettings, saveAs, loadAs, cache } = options);
    }
    const mergeSettings = (baseSettings: UserSettings, frameworkId: number) => {
        if (loadAs) {
            try {
                const storedSettings = localStorage.getItem(loadAs + '-' + frameworkId);
                if (storedSettings) {
                    Object.assign(baseSettings, JSON.parse(storedSettings));
                }
            } catch {
            }
        }
        if (!framework) {
            Object.assign(baseSettings, settings);
        }
        if (util.isPlainObject(userSettings)) {
            Object.assign(baseSettings, userSettings);
        }
        if (saveAs) {
            try {
                localStorage.setItem(saveAs + '-' + frameworkId, JSON.stringify(baseSettings));
            } catch {
            }
        }
    };
    if (framework !== value || cache === false) {
        const appBase = cache ? value.cached() : value.create();
        mergeSettings(appBase.userSettings, appBase.framework);
        clearProperties(settings);
        Object.assign(settings, appBase.userSettings);
        main = appBase.application;
        main.userSettings = settings;
        extensionManager = main.extensionManager;
        extendPrototype(main.framework);
        setupExtensions(settings.builtInExtensions);
        if (reloading) {
            clearProperties(system);
        }
        Object.assign(system, value.system);
        framework = value;
    }
    else if (options) {
        mergeSettings(main!.userSettings, main!.framework);
    }
    if (reloading) {
        reset();
    }
}

export function parseDocument(...elements: (HTMLElement | string)[]) {
    if (main) {
        loadExtensions();
        if (!main.closed) {
            return main.parseDocument(...elements);
        }
        else if (!settings.showErrorMessages || confirm(error.DOCUMENT_IS_CLOSED)) {
            main.reset();
            return main.parseDocument(...elements);
        }
    }
    return session.frameworkNotInstalled();
}

export function parseDocumentSync(...elements: (HTMLElement | string)[]) {
    if (main) {
        loadExtensions();
        if (!main.closed) {
            return main.parseDocumentSync(...elements);
        }
        else if (!settings.showErrorMessages || confirm(error.DOCUMENT_IS_CLOSED)) {
            main.reset();
            return main.parseDocumentSync(...elements);
        }
    }
}

export function include(value: ExtensionRequest, options?: squared.FrameworkOptions) {
    if (typeof value === 'string') {
        value = main && main.builtInExtensions.get(value) || retrieve(value);
    }
    if (value instanceof squared.base.Extension) {
        extensionsExternal.add(value);
        if (extensionManager && !extensionManager.include(value)) {
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
    if (extensionManager) {
        if (typeof value === 'string') {
            value = extensionManager.retrieve(value);
        }
        if (value instanceof squared.base.Extension) {
            extensionsQueue.delete(value);
            extensionsExternal.delete(value);
            return extensionManager.exclude(value);
        }
    }
    return false;
}

export function configure(value: ExtensionRequest, options: squared.FrameworkOptions) {
    if (util.isPlainObject<squared.FrameworkOptions>(options)) {
        const mergeSettings = (name: string) => {
            const { loadAs, saveAs } = options;
            const result: PlainObject = {};
            if (loadAs) {
                try {
                    const storedSettings = localStorage.getItem(loadAs + '-' + name);
                    if (storedSettings) {
                        Object.assign(result, JSON.parse(storedSettings));
                    }
                } catch {
                }
            }
            Object.assign(result, options.settings);
            if (saveAs) {
                try {
                    localStorage.setItem(saveAs + '-' + name, JSON.stringify(result));
                } catch {
                }
            }
            return result;
        };
        if (typeof value === 'string') {
            const extension = extensionManager && extensionManager.retrieve(value) || util.findSet(extensionsQueue, item => item.name === value);
            if (!extension) {
                optionsQueue.set(value, mergeSettings(value));
                return true;
            }
            else {
                value = extension;
            }
        }
        if (value instanceof squared.base.Extension) {
            Object.assign(value.options, mergeSettings(value.name));
            return true;
        }
    }
    return false;
}

export function retrieve(value: string) {
    if (extensionManager) {
        const result = extensionManager.retrieve(value);
        if (result) {
            return result;
        }
        for (const ext of extensionsExternal) {
            if (ext.name === value) {
                return ext;
            }
        }
    }
}

export function extend(functionMap: squared.ExtendPrototypeMap, value = 0) {
    prototypeMap.set(value, Object.assign(prototypeMap.get(value) || {}, functionMap));
}

export function get(...elements: (Element | string)[]) {
    if (main) {
        const result = new Map<Element, Node[]>();
        const length = elements.length;
        for (const sessionId of main.session.active.keys()) {
            for (let i = 0; i < length; ++i) {
                let element = elements[i];
                if (typeof element === 'string') {
                    element = document.getElementById(element) as HTMLElement;
                }
                if (element instanceof Element) {
                    const node = session.getElementAsNode<Node>(element, sessionId);
                    if (node) {
                        if (result.has(element)) {
                            result.get(element)!.push(node);
                        }
                        else {
                            result.set(element, [node]);
                        }
                    }
                }
            }
        }
        if (length <= 1) {
            if (result.size === 1) {
                return result.values().next().value as Node[];
            }
        }
        else {
            return result;
        }
    }
}

export function latest(value = 1) {
    if (main && value > 0) {
        const active = main.session.active;
        if (active.size) {
            return Array.from(active.keys()).slice(Math.max(0, active.size - value)).reverse().join(',');
        }
    }
    return '';
}

export function reset() {
    if (main) {
        main.reset();
    }
}

export function ready() {
    return main ? !main.initializing && !main.closed : false;
}

export function close() {
    return checkWritable(main) && main.finalize();
}

export function copyToDisk(value: string, options?: FileActionOptions) {
    if (main) {
        return util.isString(value) && close() ? main.copyToDisk(value, options) : Promise.reject(new Error(error.UNABLE_TO_FINALIZE_DOCUMENT));
    }
    return session.frameworkNotInstalled();
}

export function appendToArchive(value: string, options?: FileActionOptions) {
    if (main) {
        return util.isString(value) && close() ? main.appendToArchive(value, options) : Promise.reject(new Error(error.UNABLE_TO_FINALIZE_DOCUMENT));
    }
    return session.frameworkNotInstalled();
}

export function saveToArchive(value?: string, options?: FileActionOptions) {
    if (main) {
        return close() ? main.saveToArchive(value, options) : Promise.reject(new Error(error.UNABLE_TO_FINALIZE_DOCUMENT));
    }
    return session.frameworkNotInstalled();
}

export function createFrom(value: string, options: FileActionOptions) {
    if (main) {
        return checkFrom(value, options) ? main.createFrom(value, options) : Promise.reject(new Error(error.INVALID_ASSET_REQUEST));
    }
    return session.frameworkNotInstalled();
}

export function appendFromArchive(value: string, options: FileActionOptions) {
    if (main) {
        return checkFrom(value, options) ? main.appendFromArchive(value, options) : Promise.reject(new Error(error.INVALID_ASSET_REQUEST));
    }
    return session.frameworkNotInstalled();
}

export function getElementById(value: string, sync = false, cache = true) {
    if (main) {
        const element = document.getElementById(value);
        if (element) {
            return findElement(element, sync, cache);
        }
    }
    return sync ? null : Promise.resolve(null);
}

export function querySelector(value: string, sync = false, cache = true) {
    if (main) {
        const element = document.querySelector(value);
        if (element) {
            return findElement(element as HTMLElement, sync, cache);
        }
    }
    return sync ? null : Promise.resolve(null);
}

export function querySelectorAll(value: string, sync = false, cache = true) {
    if (main) {
        const query = document.querySelectorAll(value);
        const length = query.length;
        if (length) {
            if (sync) {
                if (length === 1) {
                    return [findElement(query[0] as HTMLElement, true, cache) as Node];
                }
                else if (cache) {
                    return findElementAll(query, length);
                }
                return main.parseDocumentSync(...Array.from(query) as HTMLElement[]) as Node[];
            }
            else {
                if (length === 1) {
                    return util.promisify<Node[]>(findElementAsync)(query[0] as HTMLElement, cache);
                }
                else if (cache) {
                    return util.promisify<Node[]>(findElementAllAsync)(query, length);
                }
                return main.parseDocument(...Array.from(query) as HTMLElement[]) as Promise<Node[]>;
            }
        }
    }
    return sync ? [] : Promise.resolve([]);
}

export function fromElement(element: HTMLElement, sync = false, cache = false) {
    if (main) {
        return findElement(element, sync, cache);
    }
    return sync ? null : Promise.resolve(null);
}

export function getElementMap() {
    return main ? main.elementMap : new Map<Element, Node>();
}

export function clearElementMap() {
    if (main) {
        main.elementMap.clear();
    }
}

export function toString() {
    return main ? main.toString() : '';
}

const lib = {
    base: {
        Container,
        ArrayIterator,
        ListIterator,
        Pattern
    },
    client,
    color,
    css,
    dom,
    error,
    math,
    regex,
    session,
    util
};

export { lib, system, settings };