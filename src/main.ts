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
type ExtensionRequest = squared.ExtensionRequest;
type ExtensionRequestObject = squared.ExtensionRequestObject;
type Extension = squared.base.Extension<Node>;
type ExtensionManager = squared.base.ExtensionManager<Node>;
type Framework = squared.base.AppFramework<Node>;
type FrameworkOptions = squared.FrameworkOptions;
type FileActionOptions = squared.FileActionOptions;
type ExtendPrototypeMap = ObjectMap<FunctionType<any> | { get?: () => any, set?: (value: any) => void }>;

const addQueue = new Set<ExtensionRequest>();
const removeQueue = new Set<ExtensionRequest>();
const optionsQueue = new Map<string, PlainObject>();
const extensionCache = new Set<Extension>();
const prototypeMap = new Map<number, ExtendPrototypeMap>();
const settings = {} as UserSettings;

let main: Null<Main> = null;
let framework: Null<Framework> = null;
let extensionManager: Null<ExtensionManager> = null;

function clearProperties(data: PlainObject) {
    for (const attr in data) {
        delete data[attr];
    }
}

function extendPrototype(id: number) {
    const proto = main!.Node.prototype;
    for (const data of prototypeMap) {
        if (data[0] === 0 || util.hasBit(data[0], id)) {
            const functionMap = data[1];
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

function loadExtensions() {
    if (extensionManager) {
        if (addQueue.size) {
            for (const item of addQueue) {
                extensionManager.add(item);
            }
            addQueue.clear();
        }
        if (removeQueue.size) {
            for (const item of removeQueue) {
                extensionManager.remove(item);
            }
            removeQueue.clear();
        }
        if (optionsQueue.size) {
            for (const data of optionsQueue) {
                apply(data[0], data[1]);
            }
            optionsQueue.clear();
        }
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
    return !incomplete ? result : result.filter(item => item);
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
    return !incomplete ? result : result.filter(item => item);
}

const checkWritable = (app: Null<Main>): app is Main => app ? !app.initializing && app.length > 0 : false;
const checkFrom = (value: string, options: FileActionOptions) => checkWritable(main) && util.isString(value) && util.isPlainObject<FileActionOptions>(options) && !!options.assets && options.assets.length > 0;
const findExtension = (value: string) => extensionManager!.get(value, true) || util.findSet(extensionCache, item => item.name === value);

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

export function setFramework(value: Framework, options?: FrameworkOptions) {
    const reloading = framework !== null;
    let userSettings: Undef<PlainObject>,
        saveAsLocal: Undef<string>,
        loadAs: Undef<string>,
        cache: Undef<boolean>;
    if (options) {
        ({ settings: userSettings, saveAs: saveAsLocal, loadAs, cache } = options);
    }
    const mergeSettings = (baseSettings: UserSettings, name: string) => {
        if (loadAs) {
            try {
                const storedSettings = localStorage.getItem(loadAs + '-' + name);
                if (storedSettings) {
                    Object.assign(baseSettings, JSON.parse(storedSettings));
                }
            }
            catch {
            }
        }
        if (!framework) {
            Object.assign(baseSettings, settings);
        }
        if (util.isPlainObject(userSettings)) {
            Object.assign(baseSettings, userSettings);
        }
        if (saveAsLocal) {
            try {
                localStorage.setItem(saveAsLocal + '-' + name, JSON.stringify(baseSettings));
            }
            catch {
            }
        }
    };
    if (!main || framework !== value || cache === false) {
        if (reloading && framework !== value) {
            clearProperties(settings);
        }
        const appBase = cache ? value.cached() : value.create();
        main = appBase.application;
        extensionManager = main.extensionManager;
        mergeSettings(appBase.userSettings, main.systemName);
        Object.assign(settings, appBase.userSettings);
        main.userSettings = settings;
        main.setExtensions();
        extendPrototype(main.framework);
        framework = value;
    }
    else if (options) {
        mergeSettings(main.userSettings, main.systemName);
    }
    if (reloading) {
        main.reset();
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

export function add(...values: ExtensionRequestObject[]) {
    let success = 0;
    for (let i = 0, length = values.length; i < length; ++i) {
        let value = values[i],
            options: Undef<PlainObject>;
        if (Array.isArray(value)) {
            [value, options] = value;
        }
        if (typeof value === 'string') {
            const ext = get(value);
            if (ext) {
                value = ext as Extension;
            }
            else {
                addQueue.add(value);
                if (options) {
                    apply(value, options);
                }
                continue;
            }
        }
        if (squared.base && value instanceof squared.base.Extension) {
            extensionCache.add(value);
            if (!extensionManager || !extensionManager.add(value)) {
                addQueue.add(value);
            }
            if (options) {
                apply(value, options);
            }
            ++success;
        }
    }
    return success;
}

export function remove(...values: ExtensionRequest[]) {
    let success = 0;
    for (let i = 0, length = values.length; i < length; ++i) {
        let value = values[i];
        if (typeof value === 'string') {
            if (extensionManager) {
                const ext = extensionManager.get(value);
                if (ext) {
                    value = ext;
                }
                else {
                    ++success;
                    continue;
                }
            }
            else {
                addQueue.delete(value);
                removeQueue.add(value);
                ++success;
                continue;
            }
        }
        if (squared.base && value instanceof squared.base.Extension) {
            addQueue.delete(value);
            if (!extensionManager || !extensionManager.remove(value)) {
                removeQueue.add(value);
            }
            ++success;
        }
    }
    return success;
}

export function get(...values: string[]) {
    if (extensionManager) {
        const length = values.length;
        if (length === 1) {
            return findExtension(values[0]);
        }
        else {
            const result: Extension[] = [];
            for (let i = 0; i < length; ++i) {
                const item = findExtension(values[i]);
                if (item) {
                    result.push(item);
                }
            }
            return result;
        }
    }
}

export function apply(value: ExtensionRequest, options: FrameworkOptions) {
    if (util.isPlainObject(options)) {
        const mergeSettings = (name: string) => {
            const { loadAs, saveAs: saveAsLocal } = options;
            const result: PlainObject = {};
            if (loadAs) {
                try {
                    const storedSettings = localStorage.getItem(loadAs + '-' + name);
                    if (storedSettings) {
                        Object.assign(result, JSON.parse(storedSettings));
                    }
                }
                catch {
                }
            }
            Object.assign(result, options.settings);
            if (saveAsLocal) {
                try {
                    localStorage.setItem(saveAsLocal + '-' + name, JSON.stringify(result));
                }
                catch {
                }
            }
            return result;
        };
        if (typeof value === 'string') {
            const extension = extensionManager && extensionManager.get(value, true) || util.findSet(addQueue, item => typeof item !== 'string' && item.name === value);
            if (!extension) {
                optionsQueue.set(value, mergeSettings(value));
                return true;
            }
            else {
                value = extension;
            }
        }
        if (squared.base && value instanceof squared.base.Extension) {
            Object.assign(value.options, mergeSettings(value.name));
            return true;
        }
    }
    return false;
}

export function extend(functionMap: PlainObject, value = 0) {
    prototypeMap.set(value, Object.assign(prototypeMap.get(value) || {}, functionMap));
}

export function latest(value = 1) {
    if (main && value) {
        const active = main.session.active;
        if (active.size) {
            let items = Array.from(active.keys());
            items = value < 0 ? items.slice(0, Math.abs(value)) : items.slice(Math.max(0, active.size - value)).reverse();
            return Math.abs(value) === 1 ? items[0] : items;
        }
    }
    return '';
}

export function close() {
    return checkWritable(main) && main.finalize();
}

export function save() {
    return saveAs('');
}

export function reset() {
    if (main) {
        main.reset();
    }
}

export function saveAs(value: string, options?: FileActionOptions) {
    if (main) {
        return close() ? main.saveAs(value, options) : Promise.reject(new Error(error.UNABLE_TO_FINALIZE_DOCUMENT));
    }
    return session.frameworkNotInstalled();
}

export function appendTo(value: string, options?: FileActionOptions) {
    if (main) {
        return util.isString(value) && close() ? main.appendTo(value, options) : Promise.reject(new Error(error.UNABLE_TO_FINALIZE_DOCUMENT));
    }
    return session.frameworkNotInstalled();
}

export function copyTo(value: string, options?: FileActionOptions) {
    if (main) {
        return util.isString(value) && close() ? main.copyTo(value, options) : Promise.reject(new Error(error.UNABLE_TO_FINALIZE_DOCUMENT));
    }
    return session.frameworkNotInstalled();
}

export function saveFiles(value: string, options: FileActionOptions) {
    if (main) {
        return checkFrom(value, options) ? main.saveFiles(value, options) : Promise.reject(new Error(error.INVALID_ASSET_REQUEST));
    }
    return session.frameworkNotInstalled();
}

export function appendFiles(value: string, options: FileActionOptions) {
    if (main) {
        return checkFrom(value, options) ? main.appendFiles(value, options) : Promise.reject(new Error(error.INVALID_ASSET_REQUEST));
    }
    return session.frameworkNotInstalled();
}

export function copyFiles(value: string, options: FileActionOptions) {
    if (main) {
        return checkFrom(value, options) ? main.copyFiles(value, options) : Promise.reject(new Error(error.INVALID_ASSET_REQUEST));
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

export function fromCache(...elements: (Element | string)[]) {
    if (main) {
        const result = new Map<Element, Node | Node[]>();
        const multiple = main.session.active.size > 1;
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
                        if (multiple) {
                            if (result.has(element)) {
                                (result.get(element) as Node[]).push(node);
                            }
                            else {
                                result.set(element, [node]);
                            }
                        }
                        else {
                            if (length === 1) {
                                return node;
                            }
                            result.set(element, node);
                        }
                    }
                }
            }
        }
        if (length <= 1) {
            if (result.size) {
                return result.values().next().value as Node[];
            }
        }
        else {
            return result;
        }
    }
}

export function resetCache() {
    if (main) {
        main.elementMap = new WeakMap();
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

export { lib, settings };