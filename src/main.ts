import * as client from './lib/client';
import * as color from './lib/color';
import * as constant from './lib/constant';
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

type ExtensionRequest = squared.ExtensionRequest;
type ExtensionRequestObject = squared.ExtensionRequestObject;
type FileActionOptions = squared.FileActionOptions;
type FrameworkOptions = squared.FrameworkOptions;
type Node = squared.base.Node;
type Main = squared.base.Application<Node>;
type Framework = squared.base.AppFramework<Node>;
type Extension = squared.base.Extension<Node>;
type ExtensionManager = squared.base.ExtensionManager<Node>;
type ExtendPrototypeMap = ObjectMap<FunctionType<any> | { set?: (value: any) => void; get?: () => any }>;

const optionsQueue = new Map<string, PlainObject>();
const prototypeMap = new Map<number, ExtendPrototypeMap>();
const settings = {} as UserSettings;
let extensionCache: Extension[] = [];
let addQueue: ExtensionRequest[] = [];
let removeQueue: ExtensionRequest[] = [];

let main: Null<Main> = null;
let framework: Null<Framework> = null;
let extensionManager: Null<ExtensionManager> = null;
let extensionCheck = false;

function extendPrototype(id: number) {
    const proto = main!.Node.prototype;
    for (const [frameworkId, functionMap] of prototypeMap) {
        if (frameworkId === 0 || frameworkId & id) {
            for (const method in functionMap) {
                const item = functionMap[method];
                if (util.isPlainObject(item)) {
                    let property: Undef<ObjectMap<FunctionType<any>>>;
                    if (typeof item.set === 'function') {
                        (property ||= {}).set = item.set;
                    }
                    if (typeof item.get === 'function') {
                        (property ||= {}).get = item.get;
                    }
                    if (property) {
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
        if (extensionCache.length) {
            for (const item of extensionCache) {
                extensionManager.cache.add(item);
            }
            extensionCache = [];
        }
        if (addQueue.length) {
            for (const item of addQueue) {
                if (!extensionManager.add(item)) {
                    console.log('FAIL: ' + (typeof item === 'string' ? item : item.name)); // eslint-disable-line no-console
                    extensionCheck = true;
                }
            }
            addQueue = [];
        }
        if (optionsQueue.size) {
            for (const data of optionsQueue) {
                const ext = extensionManager.get(data[0], true);
                if (ext) {
                    Object.assign(ext.options, data[1]);
                }
            }
            optionsQueue.clear();
        }
        if (removeQueue.length) {
            for (const item of removeQueue) {
                if (extensionManager.remove(item)) {
                    extensionCheck = true;
                }
            }
            removeQueue = [];
        }
        if (extensionCheck) {
            const errors = extensionManager.checkDependencies();
            if (errors) {
                console.log('FAIL: ' + errors.join(', ')); // eslint-disable-line no-console
            }
            extensionCheck = false;
        }
    }
}

function findElement(element: HTMLElement, sync?: boolean, cache?: boolean) {
    if (cache) {
        const result = main!.elementMap?.get(element);
        if (result) {
            return sync ? result : Promise.resolve(result);
        }
    }
    return sync ? main!.parseDocumentSync(element) as Node : main!.parseDocument(element) as Promise<Node>;
}

function findElementAll(query: NodeListOf<Element>, length: number) {
    const elementMap = main!.elementMap;
    const result: Node[] = new Array(length);
    let incomplete: Undef<boolean>;
    for (let i = 0; i < length; ++i) {
        const element = query[i] as HTMLElement;
        const item = elementMap && elementMap.get(element) || main!.parseDocumentSync(element) as Node;
        if (item) {
            result[i] = item;
        }
        else {
            incomplete = true;
        }
    }
    return !incomplete ? result : result.filter(item => item);
}

async function findElementAsync(element: HTMLElement, cache?: boolean) {
    if (cache) {
        const result = main!.elementMap?.get(element);
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
        const item = elementMap && elementMap.get(element) || await main!.parseDocument(element) as Node;
        if (item) {
            result[i] = item;
        }
        else {
            incomplete = true;
        }
    }
    return !incomplete ? result : result.filter(item => item);
}

const checkWritable = (app: Null<Main>): app is Main => !!app && !app.initializing && app.length > 0;
const checkFrom = (value: string, options: FileActionOptions) => util.isPlainObject<FileActionOptions>(options) && !!options.assets && checkWritable(main) && util.isString(value) && options.assets.length > 0;
const findExtension = (value: string) => extensionManager!.get(value, true) || util.findSet(extensionManager!.cache, item => item.name === value) || extensionCache.find(item => item.name === value);
const frameworkNotInstalled = () => error.reject(error.FRAMEWORK_NOT_INSTALLED);

export function setHostname(value: string) {
    if (main) {
        const fileHandler = main.fileHandler;
        if (fileHandler) {
            fileHandler.hostname = value;
        }
    }
}

export function setEndpoint(name: string, value: string) {
    if (main) {
        const fileHandler = main.fileHandler;
        if (fileHandler) {
            fileHandler.setEndpoint(name, value);
        }
    }
}

export function setFramework(value: Framework, options?: FrameworkOptions | string, cache?: string | boolean) {
    let settingsValue: Undef<PlainObject>,
        cacheValue: Undef<boolean>,
        saveName: Undef<string>,
        loadName: Undef<string>;
    if (typeof options === 'string') {
        loadName = options;
    }
    else if (options) {
        if (options.settings) {
            ({ settings: settingsValue, saveAs: saveName, loadAs: loadName, cache: cacheValue } = options);
        }
        else {
            settingsValue = options as PlainObject;
            if (typeof cache === 'string') {
                saveName = cache;
            }
        }
    }
    if (typeof cache === 'boolean') {
        cacheValue = cache;
    }
    const reloading = framework !== null;
    const mergeSettings = (baseSettings: UserSettings, name: string) => {
        if (loadName) {
            try {
                const storedSettings = localStorage.getItem(loadName + '-' + name);
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
        if (util.isPlainObject(settingsValue)) {
            Object.assign(baseSettings, settingsValue);
        }
        if (saveName) {
            try {
                localStorage.setItem(saveName + '-' + name, JSON.stringify(baseSettings));
            }
            catch {
            }
        }
    };
    if (!main || framework !== value || cacheValue === false) {
        if (reloading && framework !== value) {
            for (const attr in settings) {
                delete settings[attr];
            }
        }
        const appBase = cacheValue ? value.cached() : value.create();
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
    return frameworkNotInstalled();
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
    for (let value of values) {
        let options: Undef<PlainObject>;
        if (Array.isArray(value)) {
            [value, options] = value;
        }
        if (typeof value === 'string') {
            const ext = get(value);
            if (ext) {
                value = ext as Extension;
            }
            else {
                addQueue.push(value);
                if (options) {
                    apply(value, options);
                }
                continue;
            }
        }
        if (squared.base && value instanceof squared.base.Extension) {
            if (extensionManager) {
                if (!extensionManager.add(value)) {
                    addQueue.push(value);
                }
                extensionManager.cache.add(value);
            }
            else {
                addQueue.push(value);
                extensionCache.push(value);
            }
            if (options) {
                apply(value, options);
            }
            extensionCheck = true;
            ++success;
        }
    }
    return success;
}

export function remove(...values: ExtensionRequest[]) {
    let success = 0;
    for (let value of values) {
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
                util.spliceArray(addQueue, item => item === value);
                removeQueue.push(value);
                extensionCheck = true;
                ++success;
                continue;
            }
        }
        if (squared.base && value instanceof squared.base.Extension) {
            util.spliceArray(addQueue, item => item === value);
            if (!(extensionManager && extensionManager.remove(value))) {
                removeQueue.push(value);
            }
            extensionCheck = true;
            ++success;
        }
    }
    return success;
}

export function get(...values: string[]) {
    if (extensionManager) {
        if (values.length === 1) {
            return findExtension(values[0]);
        }
        const result: Extension[] = [];
        for (const value of values) {
            const item = findExtension(value);
            if (item) {
                result.push(item);
            }
        }
        return result;
    }
}

export function apply(value: ExtensionRequest, options: FrameworkOptions | string, saveName?: string) {
    let settingsValue: Undef<PlainObject>,
        loadName: Undef<string>;
    if (typeof options === 'string') {
        loadName = options;
        options = {};
    }
    if (util.isPlainObject(options)) {
        if (options.settings) {
            ({ settings: settingsValue, saveAs: saveName, loadAs: loadName } = options as FrameworkOptions);
        }
        else {
            settingsValue = options;
        }
        const mergeSettings = (name: string) => {
            const result: StandardMap = {};
            if (loadName) {
                try {
                    const storedSettings = localStorage.getItem(loadName + '-' + name);
                    if (storedSettings) {
                        Object.assign(result, JSON.parse(storedSettings));
                    }
                }
                catch {
                }
            }
            Object.assign(result, settingsValue);
            if (saveName) {
                try {
                    localStorage.setItem(saveName + '-' + name, JSON.stringify(result));
                }
                catch {
                }
            }
            return result;
        };
        if (typeof value === 'string') {
            const ext = extensionManager && extensionManager.get(value, true) || addQueue.find(item => typeof item !== 'string' && item.name === value) as Undef<Extension>;
            if (ext) {
                value = ext;
            }
            else {
                optionsQueue.set(value, mergeSettings(value));
                return true;
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
    if (main) {
        const items = Array.from(main.session.active.keys());
        if (value < 0) {
            items.reverse();
            value *= -1;
        }
        switch (value) {
            case 0:
                return items;
            case 1:
                return items.pop() || '';
            default:
                return items.slice(0, Math.abs(value));
        }
    }
    return Math.abs(value) === 1 ? '' : [];
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
        return close() ? main.saveAs(value, options) : error.reject(error.UNABLE_TO_FINALIZE_DOCUMENT);
    }
    return frameworkNotInstalled();
}

export function appendTo(value: string, options?: FileActionOptions) {
    if (main) {
        return util.isString(value) && close() ? main.appendTo(value, options) : error.reject(error.UNABLE_TO_FINALIZE_DOCUMENT);
    }
    return frameworkNotInstalled();
}

export function copyTo(value: string, options?: FileActionOptions) {
    if (main) {
        return util.isString(value) && close() ? main.copyTo(value, options) : error.reject(error.UNABLE_TO_FINALIZE_DOCUMENT);
    }
    return frameworkNotInstalled();
}

export function saveFiles(value: string, options: FileActionOptions) {
    if (main) {
        return checkFrom(value, options) ? main.saveFiles(value, options) : error.reject(error.INVALID_ASSET_REQUEST);
    }
    return frameworkNotInstalled();
}

export function appendFiles(value: string, options: FileActionOptions) {
    if (main) {
        return checkFrom(value, options) ? main.appendFiles(value, options) : error.reject(error.INVALID_ASSET_REQUEST);
    }
    return frameworkNotInstalled();
}

export function copyFiles(value: string, options: FileActionOptions) {
    if (main) {
        return checkFrom(value, options) ? main.copyFiles(value, options) : error.reject(error.INVALID_ASSET_REQUEST);
    }
    return frameworkNotInstalled();
}

export function getElementById(value: string, sync?: boolean, cache = true) {
    if (main) {
        const element = document.getElementById(value);
        if (element) {
            return findElement(element, sync, cache);
        }
    }
    return sync ? null : Promise.resolve(null);
}

export function querySelector(value: string, sync?: boolean, cache = true) {
    if (main) {
        const element = document.querySelector(value);
        if (element) {
            return findElement(element as HTMLElement, sync, cache);
        }
    }
    return sync ? null : Promise.resolve(null);
}

export function querySelectorAll(value: string, sync?: boolean, cache = true) {
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
            if (length === 1) {
                return util.promisify<Node[]>(findElementAsync)(query[0] as HTMLElement, cache);
            }
            else if (cache) {
                return util.promisify<Node[]>(findElementAllAsync)(query, length);
            }
            return main.parseDocument(...Array.from(query) as HTMLElement[]) as Promise<Node[]>;
        }
    }
    return sync ? [] : Promise.resolve([]);
}

export function fromElement(element: HTMLElement, sync?: boolean, cache?: boolean) {
    if (main) {
        return findElement(element, sync, cache);
    }
    return sync ? null : Promise.resolve(null);
}

export function clearCache() {
    if (main) {
        main.elementMap = null;
        main.session.active.clear();
        main.resourceHandler?.clear();
        session.clearSessionAll();
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
    constant,
    css,
    dom,
    error,
    math,
    regex,
    session,
    util
};

export { lib, settings };