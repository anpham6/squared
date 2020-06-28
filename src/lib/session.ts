import { getStyle, hasCoords } from './css';
import { getRangeClientRect } from './dom';
import { convertCamelCase, iterateArray } from './util';

export function frameworkNotInstalled<T = void>(): Promise<T> {
    return Promise.reject(new Error('Framework not installed.'));
}

export function actualClientRect(element: Element, sessionId?: string) {
    if (sessionId) {
        const rect: ClientRect = getElementCache(element, 'clientRect', sessionId);
        if (rect) {
            return rect;
        }
    }
    const bounds = element.getBoundingClientRect();
    if (sessionId) {
        setElementCache(element, 'clientRect', sessionId, bounds);
    }
    return bounds;
}

export function actualTextRangeRect(element: Element, sessionId?: string) {
    if (sessionId) {
        const rect: ClientRect = getElementCache(element, 'textRangeRect', sessionId);
        if (rect) {
            return rect;
        }
    }
    let hidden: Undef<[HTMLElement, string][]>;
    if (element.childElementCount > 0) {
        iterateArray(element.children, (item: HTMLElement) => {
            const style = getStyle(item);
            if (style.getPropertyValue('visibility') !== 'visible') {
                if (hasCoords(style.getPropertyValue('position'))) {
                    const display = style.getPropertyValue('display');
                    if (display !== 'none') {
                        item.style.display = 'none';
                        if (!hidden) {
                            hidden = [];
                        }
                        hidden.push([item, display]);
                    }
                }
            }
        });
    }
    const bounds = getRangeClientRect(element);
    if (hidden) {
        for (let i = 0; i < hidden.length; ++i) {
            const [item, display] = hidden[i];
            item.style.display = display;
        }
    }
    if (sessionId) {
        setElementCache(element, 'textRangeRect', sessionId, bounds);
    }
    return bounds;
}

export function getStyleValue(element: Element, attr: string, sessionId?: string) {
    return getElementCache(element, 'styleMap', sessionId)?.[convertCamelCase(attr)] || '';
}

export function getPseudoElt(element: Element, sessionId?: string) {
    return getElementCache(element, 'pseudoElement', sessionId) || '';
}

export function getElementAsNode<T>(element: Element, sessionId?: string): Null<T> {
    return getElementCache(element, 'node', sessionId) || null;
}

export function setElementCache(element: Element, attr: string, sessionId: string, data: any) {
    element[`__${attr}::${sessionId}`] = data;
}

export function getElementCache(element: Element, attr: string, sessionId?: string) {
    if (!sessionId) {
        sessionId = element['__sessionId::0'] || '0';
    }
    return element[`__${attr}::${sessionId}`];
}

export function deleteElementCache(element: Element, attr: string, sessionId: string) {
    element[`__${attr}::${sessionId}`] = undefined;
}