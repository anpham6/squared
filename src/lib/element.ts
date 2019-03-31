import { getElementAsNode } from './dom';

type Node = squared.base.Node;

export const ELEMENT_BLOCK = [
    'ADDRESS',
    'ARTICLE',
    'ASIDE',
    'BLOCKQUOTE',
    'CANVAS',
    'DD',
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
    'LI',
    'MAIN',
    'NAV',
    'OL',
    'OUTPUT',
    'P',
    'PRE',
    'SECTION',
    'TFOOT',
    'TH',
    'THEAD',
    'TR',
    'UL',
    'VIDEO'
];

export const ELEMENT_INLINE = [
    'A',
    'ABBR',
    'ACRONYM',
    'B',
    'BDO',
    'BIG',
    'BR',
    'BUTTON',
    'CITE',
    'CODE',
    'DFN',
    'EM',
    'I',
    'IFRAME',
    'IMG',
    'INPUT',
    'KBD',
    'LABEL',
    'MAP',
    'OBJECT',
    'Q',
    'S',
    'SAMP',
    'SCRIPT',
    'SELECT',
    'SMALL',
    'SPAN',
    'STRIKE',
    'STRONG',
    'SUB',
    'SUP',
    'TEXTAREA',
    'TIME',
    'TT',
    'U',
    'VAR',
    'PLAINTEXT'
];

export function createElement(parent?: Element | null, tagName = 'span', placeholder = true, index = -1) {
    const element = document.createElement(tagName);
    const style = element.style;
    if (placeholder) {
        style.position = 'static';
        style.margin = '0px';
        style.padding = '0px';
        style.border = 'none';
        style.cssFloat = 'none';
        style.clear = 'none';
        element.className = '__squared.placeholder';
    }
    else {
        element.className = '__squared.pseudo';
    }
    style.display = 'none';
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

export function isPlainText(element: Element, whiteSpace = false) {
    if (element.nodeName === '#text' && element.textContent) {
        if (whiteSpace) {
            const value = element.textContent;
            for (let i = 0; i < value.length; i++) {
                switch (value.charCodeAt(i)) {
                    case 9:
                    case 10:
                    case 13:
                    case 32:
                        continue;
                    default:
                        return true;
                }
            }
            return false;
        }
        else {
            return element.textContent.trim() !== '';
        }
    }
    return false;
}

export function isLineBreak(element: Element, index: number) {
    if (element.tagName === 'BR') {
        return true;
    }
    else {
        const node = getElementAsNode<Node>(element, index);
        if (node) {
            return node.excluded && node.blockStatic;
        }
    }
    return false;
}

export function hasFreeFormText(element: Element, whiteSpace = true) {
    if (element.nodeName === '#text') {
        return isPlainText(element, whiteSpace);
    }
    else if (element.childNodes) {
        for (let i = 0; i < element.childNodes.length; i++) {
            const item = <Element> element.childNodes[i];
            if (item.nodeName === '#text' && isPlainText(item, whiteSpace)) {
                return true;
            }
            else if (item.children && item.children.length) {
                return false;
            }
        }
    }
    return false;
}