import { getStyle, hasCoords } from './css';
import { iterateArray, withinRange } from './util';

export function withinViewport(rect: DOMRect | ClientRect) {
    return !(rect.top + window.scrollY + rect.height < 0 || rect.left + window.scrollX + rect.width < 0);
}

export function assignRect(rect: DOMRect | ClientRect | BoxRectDimension, scrollPosition = true) {
    const result = {
        top: rect.top,
        right: rect.right,
        bottom: rect.bottom,
        left: rect.left,
        width: rect.width,
        height: rect.height
    };
    if (scrollPosition) {
        if (window.scrollY !== 0) {
            result.top += window.scrollY;
            result.bottom += window.scrollY;
        }
        if (window.scrollX !== 0) {
            result.left += window.scrollX;
            result.right += window.scrollX;
        }
    }
    return result;
}

export function getRangeClientRect(element: Element) {
    let hidden: Undef<[HTMLElement, string][]>;
    if (element.childElementCount) {
        iterateArray(element.children, (item: HTMLElement) => {
            const style = getStyle(item);
            if (style.visibility !== 'visible' && hasCoords(style.position)) {
                const display = style.display;
                if (display !== 'none') {
                    item.style.display = 'none';
                    (hidden ||= []).push([item, display]);
                }
            }
        });
    }
    const domRect: ClientRect[] = [];
    const range = document.createRange();
    range.selectNodeContents(element);
    const clientRects = range.getClientRects();
    for (let i = 0, length = clientRects.length; i < length; ++i) {
        const item = clientRects[i];
        if (Math.round(item.width) && !withinRange(item.left, item.right, 0.5)) {
            domRect.push(item);
        }
    }
    let bounds: Null<BoxRectDimension> = null,
        length = domRect.length;
    if (length) {
        let numberOfLines = 1,
            overflow = false;
        bounds = assignRect(domRect[0]);
        for (let i = 1; i < length; ++i) {
            const { left, right, top, bottom, width } = domRect[i];
            if (left < bounds.left) {
                bounds.left = left;
            }
            else if (left > bounds.right) {
                overflow = true;
            }
            if (right > bounds.right) {
                bounds.right = right;
            }
            if (top < bounds.top) {
                bounds.top = top;
            }
            else if (Math.ceil(top) >= domRect[i - 1].bottom || Math.floor(right - left) > width) {
                ++numberOfLines;
            }
            if (bottom > bounds.bottom) {
                bounds.bottom = bottom;
            }
            bounds.width += width;
        }
        bounds.height = bounds.bottom - bounds.top;
        if (numberOfLines > 1) {
            bounds.numberOfLines = numberOfLines;
            bounds.overflow = overflow;
        }
    }
    if (hidden) {
        length = hidden.length;
        for (let i = 0; i < length; ++i) {
            const [item, display] = hidden[i];
            item.style.display = display;
        }
    }
    return bounds;
}

export function getParentElement(element: Element) {
    const parentElement = element.parentElement;
    if (parentElement) {
        return parentElement;
    }
    const parentNode = element.parentNode;
    return parentNode && parentNode instanceof ShadowRoot ? parentNode.host as HTMLElement : null;
}

export function createElement(tagName: string, options: CreateElementOptions) {
    const { parent, style, attributes, children } = options;
    const element = document.createElement(tagName);
    if (style) {
        const cssStyle = element.style;
        for (const attr in style) {
            if (attr in cssStyle) {
                cssStyle[attr] = style[attr];
            }
        }
    }
    if (attributes) {
        for (const name in attributes) {
            if (name in element) {
                element[name] = attributes[name];
            }
        }
    }
    if (parent) {
        parent.appendChild(element);
    }
    if (children) {
        children.forEach(child => element.appendChild(child));
    }
    return element;
}

export function getNamedItem(element: Element, attr: string) {
    const item = element.attributes.getNamedItem(attr);
    return item ? item.value : '';
}