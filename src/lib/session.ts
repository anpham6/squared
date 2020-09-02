import { FRAMEWORK_NOT_INSTALLED } from './error';

let SESSION_MAP: ObjectMap<Map<Element, ElementData>> = {};

newSessionInit('0');

export function newSessionInit(value: string) {
    const elementMap = new Map<Element, ElementData>();
    SESSION_MAP[value] = elementMap;
    return elementMap;
}

export function resetSessionAll() {
    SESSION_MAP = { '0': SESSION_MAP['0'] };
}

export function frameworkNotInstalled<T = void>(): Promise<T> {
    return Promise.reject(new Error(FRAMEWORK_NOT_INSTALLED));
}

export function setElementCache(element: Element, attr: string, data: any, sessionId = '0') {
    let elementMap = SESSION_MAP[sessionId].get(element);
    if (!elementMap) {
        elementMap = {};
        SESSION_MAP[sessionId].set(element, elementMap);
    }
    elementMap[attr] = data;
}

export function getElementCache<T = unknown>(element: Element, attr: string, sessionId?: string) {
    const elementMap = getElementData(element, sessionId);
    if (elementMap) {
        return elementMap[attr] as Undef<T>;
    }
}

export function getElementData(element: Element, sessionId?: string) {
    if (!sessionId) {
        sessionId = SESSION_MAP['0'].get(element)?.sessionId;
        if (!sessionId) {
            return;
        }
    }
    return SESSION_MAP[sessionId].get(element);
}

export function getElementAsNode<T>(element: Element, sessionId?: string) {
    return getElementCache<T>(element, 'node', sessionId) || null;
}