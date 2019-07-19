import { spliceArray, withinRange } from './util';

export const ELEMENT_BLOCK = [
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
];

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

export function assignRect(rect: DOMRect | ClientRect | BoxRectDimension, scrollPosition = false): BoxRectDimension {
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
    length = domRect.length;
    if (length) {
        bounds = assignRect(domRect[0]);
        let numberOfLines = 1;
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
            else if (rect.top >= bounds.bottom) {
                numberOfLines++;
            }
            if (rect.bottom > bounds.bottom) {
                bounds.bottom = rect.bottom;
            }
            bounds.width += rect.width;
        }
        bounds.height = bounds.bottom - bounds.top;
        if (numberOfLines > 1) {
            bounds.numberOfLines = numberOfLines;
        }
    }
    else {
        bounds = newBoxRectDimension();
    }
    return <BoxRectDimension> bounds;
}

export function removeElementsByClassName(className: string) {
    for (const element of Array.from(document.getElementsByClassName(className))) {
        if (element.parentElement) {
            element.parentElement.removeChild(element);
        }
    }
}

export function getElementsBetweenSiblings(elementStart: Element | null, elementEnd: Element, whiteSpace = false) {
    if (!elementStart || elementStart.parentElement === elementEnd.parentElement) {
        const parent = elementEnd.parentElement;
        if (parent) {
            let startIndex = elementStart ? -1 : 0;
            let endIndex = -1;
            const elements = <Element[]> Array.from(parent.childNodes);
            const length = elements.length;
            for (let i = 0; i < length; i++) {
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

export function createElement(parent: HTMLElement, tagName: string, attrs: StringMap) {
    const element = document.createElement(tagName);
    for (const attr in attrs) {
        element.style.setProperty(attr, attrs[attr]);
    }
    parent.appendChild(element);
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
    const item = element.attributes.getNamedItem(attr);
    if (item) {
        return item.value.trim();
    }
    return '';
}

export function isTextNode(element: Element) {
    return element.nodeName === '#text';
}