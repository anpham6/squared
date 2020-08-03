import { LOCALIZE_ANDROID, XMLNS_ANDROID } from './constant';
import { BUILD_ANDROID } from './enumeration';

type View = android.base.View;

const { truncate } = squared.lib.math;
const { capitalize, joinArray, isPlainObject } = squared.lib.util;

const { BOX_STANDARD } = squared.base.lib.enumeration;

function calculateBias(start: number, end: number, accuracy = 3) {
    if (start === 0) {
        return 0;
    }
    else if (end === 0) {
        return 1;
    }
    return parseFloat(truncate(Math.max(start / (start + end), 0), accuracy));
}

export function applyTemplate(tagName: string, template: StandardMap, children: StandardMap[], depth?: number) {
    const tag: StandardMap = template[tagName];
    const nested = tag['>>'] === true;
    let output = '',
        length = children.length,
        indent: Undef<string>;
    if (depth === undefined) {
        output += '<?xml version="1.0" encoding="utf-8"?>\n';
        indent = '';
        depth = 0;
    }
    else {
        indent = '\t'.repeat(depth);
    }
    for (let i = 0; i < length; ++i) {
        const item = children[i];
        const include: Undef<string> = tag['#'] && item[tag['#']];
        const closed = !nested && !include;
        const attrs: Undef<string[]> = tag['@'];
        const descend: Undef<StringMap> = tag['>'];
        let valid: Undef<boolean>;
        output += `${indent}<${tagName}`;
        if (attrs) {
            const q = attrs.length;
            let j = 0;
            while (j < q) {
                const attr = attrs[j++];
                const value: Undef<string> = item[attr];
                if (value) {
                    output += ` ${(tag['^'] ? tag['^'] + ':' : '') + attr}="${value}"`;
                }
            }
        }
        if (descend) {
            let innerText = '';
            const childDepth = depth + (nested ? i : 0) + 1;
            for (const name in descend) {
                const value = item[name];
                if (Array.isArray(value)) {
                    innerText += applyTemplate(name, descend, value, childDepth);
                }
                else if (isPlainObject(value)) {
                    innerText += applyTemplate(name, descend, [value], childDepth);
                }
            }
            if (innerText !== '') {
                output += '>\n' +
                          innerText;
                if (closed) {
                    output += indent + `</${tagName}>\n`;
                }
            }
            else {
                output += closed ? ' />\n' : '>\n';
            }
            valid = true;
        }
        else if (tag['~']) {
            output += '>' + item.innerText;
            if (closed) {
                output += `</${tagName}>\n`;
            }
            valid = true;
        }
        else if (closed) {
            output += ' />\n';
        }
        if (include) {
            if (!valid) {
                output += '>\n';
            }
            output += include;
            if (!nested) {
                output += indent + `</${tagName}>\n`;
            }
        }
        if (nested) {
            indent += '\t';
        }
    }
    if (nested) {
        while (--length >= 0) {
            indent = indent.substring(1);
            output += indent + `</${tagName}>\n`;
        }
    }
    return output;
}

export function getDocumentId(value: string) {
    return value.replace(/^@\+?id\//, '');
}

export function isHorizontalAlign(value: string) {
    switch (value) {
        case 'left':
        case 'start':
        case 'right':
        case 'end':
        case 'center_horizontal':
            return true;
        default:
            return false;
    }
}

export function isVerticalAlign(value: string) {
    switch (value) {
        case 'top':
        case 'bottom':
        case 'center_vertical':
            return true;
        default:
            return false;
    }
}

export function getDataSet(dataset: StringMap | DOMStringMap, prefix: string) {
    let result: Undef<StringMap>;
    for (const attr in dataset) {
        if (attr.startsWith(prefix)) {
            if (!result) {
                result = {};
            }
            result[capitalize(attr.substring(prefix.length), false)] = dataset[attr] as string;
        }
    }
    return result;
}

export function isUnstyled(node: View, checkMargin = true) {
    switch (node.css('verticalAlign')) {
        case 'baseline':
        case 'initial':
            return node.contentBoxWidth === 0 && node.contentBoxHeight === 0 && (!checkMargin || !node.blockStatic && node.marginTop === 0 && node.marginBottom === 0) && !node.visibleStyle.background && !node.positionRelative && !node.hasWidth && !node.hasHeight && !node.has('maxWidth') && !node.has('maxHeight') && node.css('whiteSpace') !== 'nowrap';
        default:
            return false;
    }
}

export function getHorizontalBias(node: View) {
    const parent = node.documentParent;
    const box = parent.box;
    const left = Math.max(0, node.actualRect('left', 'bounds') - box.left);
    const right = Math.max(0, box.right - node.actualRect('right', 'bounds'));
    return calculateBias(left, right, node.localSettings.floatPrecision);
}

export function getVerticalBias(node: View) {
    const parent = node.documentParent;
    const box = parent.box;
    const top = Math.max(0, node.actualRect('top', 'bounds') - box.top);
    const bottom = Math.max(0, box.bottom - node.actualRect('bottom', 'bounds'));
    return calculateBias(top, bottom, node.localSettings.floatPrecision);
}

export function adjustAbsolutePaddingOffset(parent: View, direction: number, value: number) {
    if (value > 0) {
        if (parent.documentBody) {
            switch (direction) {
                case BOX_STANDARD.PADDING_TOP:
                    if (parent.getBox(BOX_STANDARD.MARGIN_TOP)[0] === 0) {
                        value -= parent.marginTop;
                    }
                    break;
                case BOX_STANDARD.PADDING_RIGHT:
                    value -= parent.marginRight;
                    break;
                case BOX_STANDARD.PADDING_BOTTOM:
                    if (parent.getBox(BOX_STANDARD.MARGIN_BOTTOM)[0] === 0) {
                        value -= parent.marginBottom;
                    }
                    break;
                case BOX_STANDARD.PADDING_LEFT:
                    value -= parent.marginLeft;
                    break;
            }
        }
        if (parent.getBox(direction)[0] === 0) {
            switch (direction) {
                case BOX_STANDARD.PADDING_TOP:
                    value += parent.borderTopWidth - parent.paddingTop;
                    break;
                case BOX_STANDARD.PADDING_RIGHT:
                    value += parent.borderRightWidth - parent.paddingRight;
                    break;
                case BOX_STANDARD.PADDING_BOTTOM:
                    value += parent.borderBottomWidth - parent.paddingBottom;
                    break;
                case BOX_STANDARD.PADDING_LEFT:
                    value += parent.borderLeftWidth - parent.paddingLeft;
                    break;
            }
        }
        return Math.max(value, 0);
    }
    else if (value < 0) {
        switch (direction) {
            case BOX_STANDARD.PADDING_TOP:
                value += parent.marginTop;
                break;
            case BOX_STANDARD.PADDING_RIGHT:
                value += parent.marginRight;
                break;
            case BOX_STANDARD.PADDING_BOTTOM:
                value += parent.marginBottom;
                break;
            case BOX_STANDARD.PADDING_LEFT:
                value += parent.marginLeft;
                break;
        }
        return value;
    }
    return 0;
}

export function createViewAttribute(data?: StandardMap) {
    const options: ViewAttribute = { android: {} };
    if (data) {
        if (data.android) {
            Object.assign(options.android, data.android);
        }
        if (data.app) {
            if (!options.app) {
                options.app = {};
            }
            Object.assign(options.app, data.app);
        }
    }
    return options;
}

export function createStyleAttribute(data?: StandardMap) {
    const result: StyleAttribute = {
        output: {
            path: 'res/values',
            file: ''
        },
        name: '',
        parent: '',
        items: {}
    };
    if (isPlainObject(data)) {
        for (const attr in result) {
            if (typeof data[attr] === typeof result[attr]) {
                result[attr] = data[attr];
            }
        }
    }
    return result;
}

export function replaceTab(value: string, spaces = 4, preserve?: boolean) {
    if (spaces > 0) {
        if (preserve) {
            return joinArray(value.split('\n'), line => {
                const match = /^(\t+)(.*)$/.exec(line);
                return match ? ' '.repeat(spaces * match[1].length) + match[2] : line;
            });
        }
        else {
            return value.replace(/\t/g, ' '.repeat(spaces));
        }
    }
    return value;
}

export function replaceCharacterData(value: string, tab?: number) {
    value = value
        .replace(/&nbsp;/g, '&#160;')
        .replace(/&(?!#?[A-Za-z\d]{2,};)/g, '&amp;');
    const char: { i: number; text: string }[] = [];
    for (let i = 0, length = value.length; i < length; ++i) {
        switch (value.charAt(i)) {
            case "'":
                char.push({ i, text: "\\'" });
                break;
            case '"':
                char.push({ i, text: '&quot;' });
                break;
            case '<':
                char.push({ i, text: '&lt;' });
                break;
            case '>':
                char.push({ i, text: '&gt;' });
                break;
            case '\t':
                if (tab) {
                    char.push({ i, text: '&#160;'.repeat(tab) });
                }
                break;
            case '\u0003':
                char.push({ i, text: ' ' });
                break;
            case '\u00A0':
                char.push({ i, text: '&#160;' });
                break;
        }
    }
    const length = char.length;
    if (length > 0) {
        const parts = value.split('');
        let j = 0;
        while (j < length) {
            const item = char[j++];
            parts[item.i] = item.text;
        }
        return parts.join('');
    }
    return value;
}

export function localizeString(value: string, rtl: boolean, api: number) {
    return rtl && api >= BUILD_ANDROID.JELLYBEAN_1 && LOCALIZE_ANDROID[value] as string || value;
}

export function getXmlNs(value: string) {
    return XMLNS_ANDROID[value] ? `xmlns:${value}="${XMLNS_ANDROID[value] as string}"` : '';
}

export function getRootNs(value: string) {
    let output = '';
    for (const namespace in XMLNS_ANDROID) {
        if (namespace === 'android' || value.includes(namespace + ':')) {
            output += '\n\t' + getXmlNs(namespace);
        }
    }
    return output;
}