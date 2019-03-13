import { spliceArray, withinRange } from './util';

type T = squared.base.Node;

function withinViewport(rect: DOMRect | ClientRect) {
    return !(rect.left < 0 && rect.top < 0 && Math.abs(rect.left) >= rect.width && Math.abs(rect.top) >= rect.height);
}

export function newBoxRect(): BoxRect {
    return {
        top: 0,
        left: 0,
        right: 0,
        bottom: 0
    };
}

export function newRectDimension(): RectDimension {
    return {
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: 0,
        height: 0
    };
}

export function newBoxModel(): BoxModel {
    return {
        marginTop: 0,
        marginRight: 0,
        marginBottom: 0,
        marginLeft: 0,
        paddingTop: 0,
        paddingRight: 0,
        paddingBottom: 0,
        paddingLeft: 0
    };
}

export function getRangeClientRect(element: Element) {
    const range = document.createRange();
    range.selectNodeContents(element);
    const clientRects = range.getClientRects();
    const domRect: ClientRect[] = [];
    for (let i = 0; i < clientRects.length; i++) {
        const item = <ClientRect> clientRects.item(i);
        if (!(Math.round(item.width) === 0 && withinRange(item.left, item.right))) {
            domRect.push(item);
        }
    }
    let bounds: RectDimension = newRectDimension();
    let multiline = 0;
    if (domRect.length) {
        bounds = assignRect(domRect[0]);
        const top = new Set([bounds.top]);
        const bottom = new Set([bounds.bottom]);
        let minTop = bounds.top;
        let maxBottom = bounds.bottom;
        for (let i = 1 ; i < domRect.length; i++) {
            const rect = domRect[i];
            top.add(Math.round(rect.top));
            bottom.add(Math.round(rect.bottom));
            minTop = Math.min(minTop, rect.top);
            maxBottom = Math.min(maxBottom, rect.bottom);
            bounds.width += rect.width;
            bounds.right = Math.max(rect.right, bounds.right);
            bounds.height = Math.max(rect.height, bounds.height);
        }
        if (top.size > 1 && bottom.size > 1) {
            bounds.top = minTop;
            bounds.bottom = maxBottom;
            if (domRect[domRect.length - 1].top >= domRect[0].bottom && element.textContent && (element.textContent.trim() !== '' || /^\s*\n/.test(element.textContent))) {
                multiline = domRect.length - 1;
            }
        }
    }
    (<TextDimension> bounds).multiline = multiline;
    return <TextDimension> bounds;
}

export function assignRect(rect: DOMRect | RectDimension): RectDimension {
    return {
        top: rect.top,
        right: rect.right,
        bottom: rect.bottom,
        left: rect.left,
        width: rect.width,
        height: rect.height
    };
}

export function removeElementsByClassName(className: string) {
    const elements = document.getElementsByClassName(className);
    for (let i = 0; i < elements.length; i++) {
        const element = elements[i];
        if (element.parentElement) {
            element.parentElement.removeChild(element);
        }
    }
}

export function isElementVisible(element: Element, viewport = false) {
    const rect = element.getBoundingClientRect();
    return rect.width !== 0 && rect.height !== 0 && (!viewport || withinViewport(rect));
}

export function getFirstChildElement(element: Element | null, lineBreak = false) {
    if (element) {
        for (let i = 0; i < element.childNodes.length; i++) {
            const node = getElementAsNode<T>(<Element> element.childNodes[i]);
            if (node && (!node.excluded || (lineBreak && node.lineBreak))) {
                return node.element;
            }
        }
    }
    return null;
}

export function getLastChildElement(element: Element | null, lineBreak = false) {
    if (element) {
        for (let i = element.childNodes.length - 1; i >= 0; i--) {
            const node = getElementAsNode<T>(<Element> element.childNodes[i]);
            if (node && node.naturalElement && (!node.excluded || (lineBreak && node.lineBreak))) {
                return node.element;
            }
        }
    }
    return null;
}

export function getElementsBetweenSiblings(elementStart: Element | null, elementEnd: Element, whiteSpace = false) {
    if (!elementStart || elementStart.parentElement === elementEnd.parentElement) {
        const parent = elementEnd.parentElement;
        if (parent) {
            let startIndex = elementStart ? -1 : 0;
            let endIndex = -1;
            const elements = <Element[]> Array.from(parent.childNodes);
            for (let i = 0; i < elements.length; i++) {
                if (elements[i] === elementStart) {
                    startIndex = i;
                }
                if (elements[i] === elementEnd) {
                    endIndex = i;
                }
            }
            if (startIndex !== -1 && endIndex !== -1 && startIndex !== endIndex) {
                const result = elements.slice(Math.min(startIndex, endIndex) + 1, Math.max(startIndex, endIndex));
                if (whiteSpace) {
                    spliceArray(result, element => element.nodeName === '#comment');
                }
                else {
                    spliceArray(result, element => element.nodeName.charAt(0) === '#' && (element.nodeName !== 'text' || !!element.textContent && element.textContent.trim() === ''));
                }
                return result.length ? result : undefined;
            }
        }
    }
    return undefined;
}

export function getPreviousElementSibling(element: Element | null) {
    if (element) {
        element = <Element> element.previousSibling;
        while (element) {
            const node = getElementAsNode<T>(element);
            if (node && (!node.excluded || node.lineBreak)) {
                return node.element;
            }
            element = <Element> element.previousSibling;
        }
    }
    return null;
}

export function getNextElementSibling(element: Element | null) {
    if (element) {
        element = <Element> element.nextSibling;
        while (element) {
            const node = getElementAsNode<T>(element);
            if (node && (!node.excluded || node.lineBreak)) {
                return node.element;
            }
            element = <Element> element.nextSibling;
        }
    }
    return null;
}

export function setElementCache(element: Element, attr: string, data: any) {
    element[`__${attr}`] = data;
}

export function getElementCache(element: Element, attr: string) {
    return element[`__${attr}`] || undefined;
}

export function deleteElementCache(element: Element, ...attrs: string[]) {
    for (const attr of attrs) {
        element[`__${attr}`] = undefined;
    }
}

export function getElementAsNode<T>(element: Element): T | undefined {
    const node = getElementCache(element, 'node');
    return node && node.naturalElement ? node : undefined;
}