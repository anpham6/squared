let SESSION_MAP!: ObjectMap<Map<Element, ElementData>>;

resetSessionAll();

export function newSessionInit(value: string) {
    const elementMap = new Map<Element, ElementData>();
    SESSION_MAP[value] = elementMap;
    return elementMap;
}

export function resetSessionAll() {
    SESSION_MAP = {};
    newSessionInit('0');
}

export function frameworkNotInstalled<T = void>(): Promise<T> {
    return Promise.reject(new Error('Framework not installed.'));
}

export function setElementCache(element: Element, attr: string, sessionId: string, data: any) {
    let elementMap = SESSION_MAP[sessionId].get(element);
    if (elementMap === undefined) {
        elementMap = {};
        SESSION_MAP[sessionId].set(element, elementMap);
    }
    elementMap[attr] = data;
}

export function getElementCache<T = unknown>(element: Element, attr: string, sessionId?: string) {
    const elementMap = getElementData(element, sessionId);
    return elementMap !== undefined ? elementMap[attr] as Undef<T> : undefined;
}

export function getElementData(element: Element, sessionId?: string) {
    if (!sessionId) {
        sessionId = SESSION_MAP['0'].get(element)?.sessionId;
        if (sessionId === undefined) {
            return undefined;
        }
    }
    return SESSION_MAP[sessionId].get(element);
}

export function getElementAsNode<T>(element: Element, sessionId?: string)  {
    return getElementCache<T>(element, 'node', sessionId) || null;
}