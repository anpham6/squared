import { iterateArray, withinRange } from './util';

export const ELEMENT_BLOCK = new Set([
    'ADDRESS',
    'ARTICLE',
    'ASIDE',
    'BLOCKQUOTE',
    'DD',
    'DETAILS',
    'DIALOG',
    'DIV',
    'DL',
    'DT',
    'FIELDSET',
    'FIGCAPTION',
    'FIGURE',
    'FOOTER',
    'FORM',
    'H1',
    'H2',
    'H3',
    'H4',
    'H5',
    'H6',
    'HEADER',
    'HGROUP',
    'HR',
    'LI',
    'MAIN',
    'NAV',
    'OL',
    'P',
    'PRE',
    'SECTION',
    'TABLE',
    'UL'
]);

export function newBoxRect(): BoxRect {
    return {
        top: 0,
        left: 0,
        right: 0,
        bottom: 0
    };
}

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

export function assignRect(rect: Undef<DOMRect | ClientRect | BoxRectDimension>, scrollPosition = true) {
    if (rect) {
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
    return newBoxRectDimension();
}

export function getRangeClientRect(element: Element) {
    const domRect: ClientRect[] = [];
    const range = document.createRange();
    range.selectNodeContents(element);
    const clientRects = range.getClientRects();
    let length = clientRects.length;
    let i = 0;
    while (i < length) {
        const item = clientRects.item(i++) as ClientRect;
        if (Math.round(item.width) > 0 && !withinRange(item.left, item.right, 0.5)) {
            domRect.push(item);
        }
    }
    let bounds: Undef<BoxRectDimension>;
    length = domRect.length;
    if (length > 0) {
        let numberOfLines = 1,
            overflow = false;
        bounds = assignRect(domRect[0]);
        i = 0;
        while (++i < length) {
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
    return bounds;
}

export function removeElementsByClassName(className: string) {
    Array.from(document.getElementsByClassName(className)).forEach(element => element.parentElement?.removeChild(element));
}

export function getElementsBetweenSiblings(elementStart: Null<Element>, elementEnd: Element) {
    const result: Element[] = [];
    if (!elementStart || elementStart.parentElement === elementEnd.parentElement) {
        const parent = elementEnd.parentElement;
        if (parent) {
            let startIndex = elementStart ? -1 : 0,
                endIndex = -1;
            iterateArray(parent.childNodes, (element: Element, index: number) => {
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
                return;
            });
            if (startIndex !== -1 && endIndex !== -1) {
                iterateArray(parent.childNodes, (element: Element) => {
                    const nodeName = element.nodeName;
                    if (nodeName[0] !== '#' || nodeName === '#text') {
                        result.push(element);
                    }
                },
                Math.min(startIndex, endIndex), Math.max(startIndex, endIndex) + 1);
            }
        }
    }
    return result;
}

export function createElement(tagName: string, options?: CreateElementOptions) {
    const element = document.createElement(tagName);
    if (options) {
        const { parent, attrs, style } = options;
        if (style) {
            for (const attr in style) {
                if (attr.includes('-')) {
                    element.style.setProperty(attr, style[attr]!);
                }
                else {
                    element.style[attr] = style[attr];
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
    }
    return element;
}

export function measureTextWidth(value: string, fontFamily: string, fontSize: number) {
    if (fontFamily && fontSize) {
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        if (context) {
            context.font = `${fontSize}px ${fontFamily}`;
            return context.measureText(value).width;
        }
    }
    return 0;
}

export function getNamedItem(element: Element, attr: string) {
    return element.attributes.getNamedItem(attr)?.value.trim() || '';
}