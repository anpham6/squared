import { getStyle, hasCoords } from './css';
import { iterateArray, withinRange } from './util';

export function newBoxRectDimension(): BoxRectDimension {
    return {
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: 0,
        height: 0
    };
}

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
            if (style.getPropertyValue('visibility') !== 'visible' && hasCoords(style.getPropertyValue('position'))) {
                const display = style.getPropertyValue('display');
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
        const item = clientRects.item(i) as ClientRect;
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

export function getShadowRoot(element: Element) {
    const shadowRoot = element.shadowRoot;
    return shadowRoot && shadowRoot.mode === 'open' ? shadowRoot : null;
}

export function getParentElement(element: Element) {
    const parentElement = element.parentElement;
    if (parentElement) {
        return parentElement;
    }
    const parentNode = element.parentNode;
    return parentNode && parentNode instanceof ShadowRoot ? parentNode.host as HTMLElement : null;
}

export function removeElementsByClassName(className: string) {
    const elements = Array.from(document.getElementsByClassName(className));
    for (let i = 0, length = elements.length; i < length; ++i) {
        const element = elements[i];
        const parentElement = element.parentElement;
        if (parentElement) {
            parentElement.removeChild(element);
        }
    }
}

export function getElementsBetweenSiblings(elementStart: Null<Element>, elementEnd: Element) {
    const parentNode = elementEnd.parentNode;
    const result: Element[] = [];
    if (parentNode && (!elementStart || parentNode === elementStart.parentNode)) {
        let startIndex = elementStart ? -1 : 0,
            endIndex = -1;
        iterateArray(parentNode.childNodes, (element: Element, index: number) => {
            if (element === elementEnd) {
                endIndex = index;
                if (startIndex !== -1) {
                    return true;
                }
            }
            else if (element === elementStart) {
                startIndex = index;
                if (endIndex !== -1) {
                    return true;
                }
            }
        });
        if (startIndex !== -1 && endIndex !== -1) {
            iterateArray(parentNode.childNodes, (element: Element) => {
                const nodeName = element.nodeName;
                if (nodeName[0] !== '#' || nodeName === '#text') {
                    result.push(element);
                }
            },
            Math.min(startIndex, endIndex), Math.max(startIndex, endIndex) + 1);
        }
    }
    return result;
}

export function createElement(tagName: string, options: CreateElementOptions) {
    const { parent, attrs, style } = options;
    const element = document.createElement(tagName);
    if (style) {
        const cssStyle = element.style;
        for (const attr in style) {
            if (attr.includes('-')) {
                cssStyle.setProperty(attr, style[attr]!);
            }
            else if (attr in cssStyle) {
                cssStyle[attr] = style[attr];
            }
        }
    }
    if (attrs) {
        for (const attr in attrs) {
            if (attr in element) {
                element[attr] = attrs[attr];
            }
        }
    }
    if (parent) {
        parent.appendChild(element);
    }
    return element;
}

export function getTextMetrics(value: string, fontSize: number, fontFamily?: string) {
    const context = document.createElement('canvas').getContext('2d');
    if (context) {
        context.font = fontSize + 'px' + (fontFamily ? ' ' + fontFamily : '');
        return context.measureText(value);
    }

    return { width: 0 } as TextMetrics;
}

export function getNamedItem(element: Element, attr: string) {
    return element.attributes.getNamedItem(attr)?.value.trim() || '';
}