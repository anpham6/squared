import { getStyle } from './css';
import { getRangeClientRect } from './dom';

export function actualClientRect(element: Element, sessionId: string, cache = true) {
    if (cache) {
        const rect: ClientRect = getElementCache(element, 'clientRect', sessionId);
        if (rect) {
            return rect;
        }
    }
    const bounds = element.getBoundingClientRect();
    setElementCache(element, 'clientRect', sessionId, bounds);
    return bounds;
}

export function actualTextRangeRect(element: Element, sessionId: string, cache = true) {
    if (cache) {
        const rect: ClientRect = getElementCache(element, 'textRangeRect', sessionId);
        if (rect) {
            return rect;
        }
    }
    const length = element.childElementCount;
    let hidden: [HTMLElement, string][] | undefined;
    if (length > 0) {
        for (let i = 0; i < length; i++) {
            const style = getStyle(element.children[i]);
            if (style.getPropertyValue('visibility') !== 'visible') {
                const position = style.getPropertyValue('position');
                if (position === 'absolute' || position === 'fixed') {
                    const display = style.getPropertyValue('display');
                    if (display !== 'none') {
                        const child = <HTMLElement> element.children[i];
                        child.style.display = 'none';
                        if (hidden === undefined) {
                            hidden = [];
                        }
                        hidden.push([child, display]);
                    }
                }
            }
        }
    }
    const bounds = getRangeClientRect(element);
    if (hidden) {
        for (const item of hidden) {
            item[0].style.display = item[1];
        }
    }
    setElementCache(element, 'textRangeRect', sessionId, bounds);
    return bounds;
}

export function setElementCache(element: Element, attr: string, sessionId: string, data: any) {
    element[`__${attr}::${sessionId}`] = data;
}

export function getElementCache(element: Element, attr: string, sessionId?: string) {
    if (!sessionId) {
        sessionId = element['__sessionId::0'];
    }
    return element[`__${attr}::${sessionId}`];
}

export function deleteElementCache(element: Element, attr: string, sessionId: string) {
    delete element[`__${attr}::${sessionId}`];
}

export function getElementAsNode<T>(element: Element, sessionId: string): T | undefined {
    return getElementCache(element, 'node', sessionId) || undefined;
}