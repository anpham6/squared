import * as client from './lib/client';
import * as color from './lib/color';
import * as css from './lib/css';
import * as dom from './lib/dom';
import * as math from './lib/math';
import * as regex from './lib/regex';
import * as session from './lib/session';
import * as util from './lib/util';

import Container from './lib/base/container';
import ArrayIterator from './lib/base/arrayiterator';
import ListIterator from './lib/base/listiterator';

type Node = squared.base.Node;
type Main = squared.base.Application<Node>;
type Framework = squared.base.AppFramework<Node>;
type Extension = squared.base.Extension<Node>;
type ExtensionRequest = Null<Extension | string>;
type FileActionOptions = squared.base.FileActionOptions;

const extensionsQueue = new Set<Extension>();
const extensionsExternal = new Set<Extension>();
const optionsQueue = new Map<string, StandardMap>();
const prototypeMap = new Map<number, ExtensionPrototypeData>();
const settings = {} as UserSettings;
const system = {} as FunctionMap<any>;

let main: Undef<Main>;
let extensionManager: Undef<squared.base.ExtensionManager<Node>>;
let framework: Undef<Framework>;

function includeExtension(extensions: Extension[], ext: Extension) {
    if (!extensions.includes(ext)) {
        ext.application = main!;
        extensions.push(ext);
    }
}

function clearProperties(data: StandardMap) {
    for (const attr in data) {
        delete data[attr];
    }
}

function extendPrototype(proto: any, offset: number) {
    for (const [value, functionMap] of prototypeMap.entries()) {
        if (value === 0 || util.hasBit(value, offset)) {
            for (const method in functionMap) {
                const item = functionMap[method];
                if (typeof item === 'object') {
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

function findElement(element: HTMLElement, cache: boolean) {
    if (cache) {
        const result = main!.elementMap.get(element);
        if (result) {
            return Promise.resolve(result);
        }
    }
    return main!.parseDocument(element) as Promise<Node>;
}

async function findElementAll(query: NodeListOf<Element>, length: number) {
    let incomplete: Undef<boolean>;
    const elementMap = main!.elementMap;
    const result: Node[] = new Array(length);
    for (let i = 0; i < length; ++i) {
        const element = query[i] as HTMLElement;
        let item = elementMap.get(element);
        if (item) {
            result[i] = item;
        }
        else {
            item = await main!.parseDocument(element) as Node;
            if (item) {
                result[i] = item;
            }
            else {
                incomplete = true;
            }
        }
    }
    if (incomplete) {
        util.flatArray<Node>(result);
    }
    return result;
}

async function findElementAsync(element: HTMLElement) {
    return [await main!.parseDocument(element) as Node];
}

const checkWritable = (app: Undef<Main>): app is Main => app ? !app.initializing && app.length > 0 : false;

export function setHostname(value: string) {
    if (main) {
        const fileHandler = main.resourceHandler?.fileHandler;
        if (fileHandler) {
            const match = regex.FILE.PROTOCOL.exec(value);
            if (match?.[1].startsWith('http')) {
                fileHandler.hostname = match[1] + match[2] + (match[3] || '');
            }
        }
    }
}

export function setFramework(value: Framework, options?: ObjectMap<any>, cached?: boolean) {
    const reloading = framework !== undefined;
    if (framework !== value) {
        const appBase = cached ? value.cached() : value.create();
        if (!framework) {
            Object.assign(appBase.userSettings, settings);
        }
        if (util.isPlainObject(options)) {
            Object.assign(appBase.userSettings, options);
        }
        clearProperties(settings);
        Object.assign(settings, appBase.userSettings);
        main = appBase.application;
        main.userSettings = settings;
        extensionManager = main.extensionManager;
        extendPrototype(main.Node.prototype, main.framework);
        const { builtInExtensions, extensions } = main;
        extensions.length = 0;
        for (const namespace of settings.builtInExtensions) {
            const ext = builtInExtensions[namespace];
            if (ext) {
                includeExtension(extensions, ext);
            }
            else {
                const packaage = namespace + '.';
                for (const name in builtInExtensions) {
                    if (name.startsWith(packaage)) {
                        includeExtension(extensions, builtInExtensions[name]);
                    }
                }
            }
        }
        if (reloading) {
            clearProperties(system);
        }
        Object.assign(system, value.system);
        framework = value;
    }
    if (reloading) {
        reset();
    }
}

export function setViewModel(data?: PlainObject) {
    if (main) {
        main.viewModel = data;
    }
}

export function parseDocument(...elements: (HTMLElement | string)[]) {
    if (main) {
        if (extensionManager) {
            if (extensionsQueue.size > 0) {
                for (const item of extensionsQueue) {
                    extensionManager.include(item);
                }
                extensionsQueue.clear();
            }
        }
        if (optionsQueue.size > 0) {
            for (const [name, options] of optionsQueue.entries()) {
                configure(name, options);
            }
            optionsQueue.clear();
        }
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

export function include(value: ExtensionRequest, options?: PlainObject) {
    if (typeof value === 'string') {
        value = main?.builtInExtensions[value] || retrieve(value);
    }
    if (value instanceof squared.base.Extension) {
        extensionsExternal.add(value);
        if (!(extensionManager?.include(value) === true)) {
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

export function configure(value: ExtensionRequest, options: PlainObject) {
    if (util.isPlainObject(options)) {
        if (typeof value === 'string') {
            value = value.trim();
            const extension = extensionManager?.retrieve(value) || util.findSet(extensionsQueue, item => item.name === value);
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
    if (extensionManager) {
        const result = extensionManager.retrieve(value) || null;
        if (!result) {
            for (const ext of extensionsExternal) {
                if (ext.name === value) {
                    return ext;
                }
            }
        }
        return result;
    }
    return null;
}

export function extend(functionMap: ExtensionPrototypeData, value = 0) {
    let map = prototypeMap.get(value);
    if (!map) {
        map = {};
        prototypeMap.set(value, map);
    }
    Object.assign(map, functionMap);
}

export function get(...elements: (Element | string)[]) {
    const result = new Map<Element, Node[]>();
    const length = elements.length;
    if (main) {
        for (const sessionId of main.session.active.keys()) {
            let i = 0;
            while (i < length) {
                let element = elements[i++];
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
    }
    return length <= 1 ? result.size === 1 ? result.values().next().value as Node : undefined : result;
}

export function latest() {
    let result = '';
    if (main) {
        for (const sessionId of main.session.active.keys()) {
            result = sessionId;
        }
    }
    return result;
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
    if (checkWritable(main) && util.isString(value) && util.isPlainObject<FileActionOptions>(options) && options.assets?.length) {
        return main.createFrom(value, options);
    }
    return session.frameworkNotInstalled();
}

export function appendFromArchive(value: string, options: FileActionOptions) {
    if (checkWritable(main) && util.isString(value) && util.isPlainObject<FileActionOptions>(options) && options.assets?.length) {
        return main.appendFromArchive(value, options);
    }
    return session.frameworkNotInstalled();
}

export function getElementById(value: string, cache = true) {
    if (main) {
        const element = document.getElementById(value);
        if (element) {
            return findElement(element, cache);
        }
    }
    return Promise.resolve(null);
}

export function querySelector(value: string, cache = true) {
    if (main) {
        const element = document.querySelector(value);
        if (element) {
            return findElement(element as HTMLElement, cache);
        }
    }
    return Promise.resolve(null);
}

export function querySelectorAll(value: string, cache = true) {
    if (main) {
        const query = document.querySelectorAll(value);
        const length = query.length;
        if (length > 0) {
            if (cache) {
                return util.promisify<Node[]>(findElementAll)(query, length);
            }
            else if (length === 1) {
                return util.promisify<Node[]>(findElementAsync)(query[0] as HTMLElement);
            }
            else {
                return main.parseDocument(...Array.from(query) as HTMLElement[]) as Promise<Node[]>;
            }
        }
    }
    return Promise.resolve([]);
}

export function fromElement(element: HTMLElement, cache = false) {
    return main ? findElement(element, cache) : Promise.resolve(null);
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
        ListIterator
    },
    client,
    color,
    css,
    dom,
    math,
    regex,
    session,
    util
};

export { lib, system, settings };