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
    let maxTop = Number.NEGATIVE_INFINITY;
    if (domRect.length) {
        bounds = assignRect(domRect[0]);
        for (let i = 1 ; i < domRect.length; i++) {
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
            if (rect.height > bounds.height) {
                bounds.height = rect.height;
            }
            bounds.width += rect.width;
            if (rect.top > maxTop) {
                maxTop = rect.top;
            }
        }
        if (domRect.length > 1 && maxTop >= domRect[0].bottom && element.textContent && (element.textContent.trim() !== '' || /^\s*\n/.test(element.textContent))) {
            multiline = domRect.length - 1;
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

export function createElement(parent?: Element | null, tagName = 'span', placeholder = true, index = -1) {
    const element = document.createElement(tagName);
    const style = element.style;
    if (placeholder) {
        style.setProperty('position', 'static');
        style.setProperty('margin', '0px');
        style.setProperty('padding', '0px');
        style.setProperty('border', 'none');
        style.setProperty('float', 'none');
        style.setProperty('clear', 'none');
        element.className = '__squared.placeholder';
    }
    else {
        element.className = '__squared.pseudo';
    }
    style.setProperty('display', 'none');
    if (parent) {
        if (index >= 0 && index < parent.childNodes.length) {
            parent.insertBefore(element, parent.childNodes[index]);
        }
        else {
            parent.appendChild(element);
        }
    }
    return element;
}

export function getNamedItem(element: Element | null, attr: string) {
    if (element) {
        const item = element.attributes.getNamedItem(attr);
        if (item) {
            return item.value.trim();
        }
    }
    return '';
}