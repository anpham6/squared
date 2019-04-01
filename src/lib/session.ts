type Node = squared.base.Node;

export function isLineBreak(element: Element, sessionId: string) {
    if (element.tagName === 'BR') {
        return true;
    }
    else {
        const node = getElementAsNode<Node>(element, sessionId);
        if (node) {
            return node.excluded && node.blockStatic;
        }
    }
    return false;
}

export function setElementCache(element: Element, attr: string, sessionId: string, data: any) {
    element[`__${attr}::${sessionId}`] = data;
}

export function getElementCache(element: Element, attr: string, sessionId: string) {
    return element[`__${attr}::${sessionId}`];
}

export function deleteElementCache(element: Element, attr: string, sessionId: string) {
    delete element[`__${attr}::${sessionId}`];
}

export function getElementAsNode<T>(element: Element, sessionId: string): T | undefined {
    const node = getElementCache(element, 'node', sessionId);
    return node && node.naturalElement ? node : undefined;
}