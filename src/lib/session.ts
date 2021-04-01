let SESSION_MAP: ObjectMap<WeakMap<Element, ElementData>> = {};

newSessionInit('0');

export function newSessionInit(value: string) {
    return SESSION_MAP[value] = new WeakMap<Element, ElementData>();
}

export function clearSessionAll() {
    SESSION_MAP = { '0': SESSION_MAP['0'] };
}

export function setElementCache(element: Element, attr: string, data: unknown, sessionId = '0') {
    let elementMap = SESSION_MAP[sessionId].get(element);
    if (!elementMap) {
        SESSION_MAP[sessionId].set(element, elementMap = {});
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
        const data = SESSION_MAP['0'].get(element);
        if (!(sessionId = data && data.sessionId)) {
            return;
        }
    }
    return SESSION_MAP[sessionId].get(element);
}

export function getElementAsNode<T>(element: Element, sessionId?: string) {
    return getElementCache<T>(element, 'node', sessionId) || null;
}