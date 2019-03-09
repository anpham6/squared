import { getStyle, isParentStyle } from './css';
import { getElementAsNode } from './dom';

type T = squared.base.Node;

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

export function createElement(parent: Element | null, block = false) {
    const element = document.createElement(block ? 'div' : 'span');
    const style = element.style;
    style.position = 'static';
    style.margin = '0px';
    style.padding = '0px';
    style.border = 'none';
    style.cssFloat = 'none';
    style.clear = 'none';
    style.display = 'none';
    element.className = '__css.placeholder';
    if (parent) {
        parent.appendChild(element);
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

export function isLineBreak(element: Element, excluded = true) {
    if (element.tagName === 'BR') {
        return true;
    }
    else if (excluded) {
        const node = getElementAsNode<T>(element);
        return node && node.excluded && node.blockStatic;
    }
    return false;
}

export function hasLineBreak(element: Element, lineBreak = false, trim = false) {
    if (element.children) {
        for (let i = 0; i < element.children.length; i++) {
            if (element.children[i].tagName === 'BR') {
                return true;
            }
        }
    }
    else if (!lineBreak) {
        let value = element.textContent || '';
        if (trim) {
            value = value.trim();
        }
        if (/\n/.test(value)) {
            const node = getElementAsNode<T>(element);
            const whiteSpace = node ? node.css('whiteSpace') : (getStyle(element).whiteSpace || '');
            return ['pre', 'pre-wrap'].includes(whiteSpace) || element.nodeName === '#text' && isParentStyle(element, 'whiteSpace', 'pre', 'pre-wrap');
        }
    }
    return false;
}