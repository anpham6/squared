import BUILD_ANDROID = android.lib.enumeration.BUILD_ANDROID;

import { LOCALIZE_ANDROID, XMLNS_ANDROID } from './constant';

const { capitalize, joinArray, isPlainObject } = squared.lib.util;

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
            for (let j = 0, q = attrs.length; j < q; ++j) {
                const attr = attrs[j];
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
            result[capitalize(attr.substring(prefix.length), false)] = dataset[attr]!;
        }
    }
    return result;
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
            }, '\n') + '\n';
        }
        return value.replace(/\t/g, ' '.repeat(spaces));
    }
    return value;
}

export function replaceCharacterData(value: string, tab?: number) {
    let output = '';
    for (let i = 0, length = value.length, ch: string; i < length; ++i) {
        ch = value[i];
        switch (ch) {
            case "'":
                output += "\\'";
                break;
            case '"':
                output += '&quot;';
                break;
            case '<':
                output += '&lt;';
                break;
            case '>':
                output += '&gt;';
                break;
            case '\u0003':
                output += ' ';
                break;
            case '\u00A0':
                output += '&#160;';
                break;
            case '\t':
                output += tab ? '&#160;'.repeat(tab) : ch;
                break;
            default:
                output += ch;
                break;
        }
    }
    return output.replace(/&nbsp;/g, '&#160;').replace(/&(?!#?[A-Za-z\d]{2,};)/g, '&amp;');
}

export function concatString(list: (string | number)[], char = '') {
    let output = '';
    for (let i = 0, length = list.length; i < length; ++i) {
        output += (i > 0 ? char : '') + list[i];
    }
    return output;
}

export function formatString(value: string, ...params: string[]) {
    for (let i = 0, length = params.length; i < length; ++i) {
        value = value.replace(`{${i}}`, params[i]);
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
        if (namespace === 'android' || namespace !== 'aapt' && value.includes(namespace + ':')) {
            output += '\n\t' + getXmlNs(namespace);
        }
    }
    return output;
}