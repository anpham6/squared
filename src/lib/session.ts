import { assignRect, newBoxRectDimension } from './dom';
import { withinRange } from './util';

export function getClientRect(element: Element, sessionId: string, cache = true) {
    if (cache) {
        const rect: ClientRect = getElementCache(element, 'boundingClientRect', sessionId);
        if (rect) {
            return rect;
        }
    }
    const bounds = element.getBoundingClientRect();
    setElementCache(element, 'boundingClientRect', sessionId, bounds);
    return bounds;
}

export function getRangeClientRect(element: Element, sessionId: string, cache = true) {
    if (cache) {
        const rect: ClientRect = getElementCache(element, 'rangeClientRect', sessionId);
        if (rect) {
            return rect;
        }
    }
    const range = document.createRange();
    range.selectNodeContents(element);
    const clientRects = range.getClientRects();
    let length = clientRects.length;
    const domRect: ClientRect[] = [];
    for (let i = 0; i < length; i++) {
        const item = <ClientRect> clientRects.item(i);
        if (Math.round(item.width) > 0 && !withinRange(item.left, item.right, 0.5)) {
            domRect.push(item);
        }
    }
    let bounds: BoxRectDimension;
    let maxTop = Number.NEGATIVE_INFINITY;
    length = domRect.length;
    if (length) {
        bounds = assignRect(domRect[0]);
        for (let i = 1 ; i < length; i++) {
            const rect = domRect[i];
            if (rect.left < bounds.left) {
                bounds.left = rect.left;
            }
            if (rect.right > bounds.right) {
                bounds.right = rect.right;
            }
            if (rect.top < bounds.top) {
                bounds.top = rect.top;
            }
            if (rect.bottom > bounds.bottom) {
                bounds.bottom = rect.bottom;
            }
            bounds.width += rect.width;
            if (rect.top > maxTop) {
                maxTop = rect.top;
            }
        }
        bounds.height = bounds.bottom - bounds.top;
        if (domRect.length > 1 && maxTop >= domRect[0].bottom && element.textContent && (element.textContent.trim() !== '' || /^\s*\n/.test(element.textContent))) {
            bounds.numberOfLines = domRect.length - 1;
        }
    }
    else {
        bounds = newBoxRectDimension();
    }
    setElementCache(element, 'rangeClientRect', sessionId, bounds);
    return <BoxRectDimension> bounds;
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