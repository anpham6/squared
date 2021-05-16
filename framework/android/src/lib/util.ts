import { BUILD_VERSION, LOCALIZE_MAP, XML_NAMESPACE } from './constant';

const { DOM } = squared.base.lib.regex;

const { parseColor: __parseColor } = squared.lib.color;
const { capitalize, isPlainObject, replaceAll, startsWith } = squared.lib.util;

const CACHE_COLORDATA: ObjectMap<ColorData> = {};

export function parseColor(value: string, opacity = 1, transparency?: boolean) {
    if (value && (value !== 'transparent' || transparency)) {
        let result: Optional<ColorData> = CACHE_COLORDATA[value];
        if (result) {
            return result;
        }
        if ((result = __parseColor(value, opacity)) && (result.opacity > 0 || transparency)) {
            CACHE_COLORDATA[result.opacity === 1 ? value : result.valueAsRGBA] = result;
            return result;
        }
    }
    return null;
}

export function applyTemplate(tagName: string, template: StandardMap, children: StandardMap[], depth?: number) {
    const tag: StandardMap = template[tagName];
    const nested = tag['>>'] === true;
    let output = '',
        length = children.length,
        indent: string;
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
            if (innerText) {
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

export function removeFileExtension(value: string, ext = 'xml') {
    return value.replace(new RegExp(`\\.${ext}(?:$|\\s+)$`, 'i'), '');
}

export function isHorizontalAlign(value: string) {
    switch (value) {
        case 'left':
        case 'start':
        case 'right':
        case 'end':
        case 'center_horizontal':
            return true;
    }
    return false;
}

export function isVerticalAlign(value: string) {
    switch (value) {
        case 'top':
        case 'bottom':
        case 'center_vertical':
            return true;
    }
    return false;
}

export function getDataSet(dataset: StringMap | DOMStringMap, prefix: string) {
    let result: Undef<StringMap>;
    for (const attr in dataset) {
        if (startsWith(attr, prefix)) {
            (result ||= {})[capitalize(attr.substring(prefix.length), false)] = dataset[attr];
        }
    }
    return result;
}

export function createViewAttribute(data?: PlainObject) {
    const options: ViewAttribute = { android: {} };
    if (data) {
        if (data.android) {
            Object.assign(options.android, data.android);
        }
        if (data.app) {
            Object.assign(options.app ||= {}, data.app);
        }
    }
    return options;
}

export function createViewOptions(options: PlainObject, elementId: string) {
    return createViewAttribute(elementId && isPlainObject<StandardMap>(options.element) ? options.element[elementId] : undefined);
}

export function createThemeAttribute(data?: PlainObject): ThemeAttribute {
    return { name: '', parent: '', items: {}, ...data };
}

export function replaceTab(value: string, spaces: number, lineStart = '<', lineEnd = '>\n') {
    if (spaces > 0) {
        const padding = ' '.repeat(spaces);
        const end = lineEnd.length;
        let result = '';
        for (let i = 0, j = 0, start = true, length = value.length; i < length; ++i) {
            const ch = value[i];
            if (start) {
                if (ch === '\t') {
                    ++j;
                    continue;
                }
                else {
                    if (j > 0) {
                        result += (!lineStart || ch === lineStart ? padding : '\t').repeat(j);
                        j = 0;
                    }
                    start = false;
                }
            }
            result += ch;
            const k = i + 1;
            const l = value.indexOf(lineEnd, k);
            if (l === -1) {
                result += value.substring(k);
                break;
            }
            else {
                start = true;
                result += value.substring(k, l + end);
                i = l + (end - 1);
            }
        }
        return result;
    }
    return value;
}

export function sanitizeString(value: string) {
    return value.trim().replace(/[ \t\n]+/g, ' ');
}

export function replaceCharacterData(value: string, tab?: number, inline?: boolean) {
    let output = '';
    for (let i = 0, length = value.length, ch: string; i < length; ++i) {
        ch = value[i];
        switch (ch) {
            case "'":
                if (!inline) {
                    output += "\\'";
                }
                break;
            case '@':
                output += !inline && (i === 0 || !output.trim()) ? '\\@' : '@';
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
            case '\\':
                output += '\\\\';
                break;
            case '\t':
                output += tab ? '&#160;'.repeat(tab) : '&#9;';
                break;
            case '\u0003':
                output += '&#3;';
                break;
            case '\u00A0':
                output += '&#160;';
                break;
            case '\u2000':
                output += '&#8192;';
                break;
            case '\u2001':
                output += '&#8193;';
                break;
            case '\u2002':
                output += '&#8194;';
                break;
            case '\u2003':
                output += '&#8195;';
                break;
            case '\u2004':
                output += '&#8196;';
                break;
            case '\u2005':
                output += '&#8197;';
                break;
            case '\u2006':
                output += '&#8198;';
                break;
            case '\u2007':
                output += '&#8199;';
                break;
            case '\u2008':
                output += '&#8200;';
                break;
            case '\u2009':
                output += '&#8201;';
                break;
            case '\u200B':
                output += '&#8203;';
                break;
            case '\u200C':
                output += '&#8204;';
                break;
            case '\u200D':
                output += '&#8205;';
                break;
            case '&':
                if (value[i + 5] === ';' && value.substring(i + 1, i + 5) === 'nbsp') {
                    output += '&#160;';
                    i += 5;
                    break;
                }
                else if (value.substring(i + 1, i + 4) === '#10' && !/\d/.test(value[i + 4])) {
                    output += '\\n';
                    i += value[i + 4] === ';' ? 4 : 3;
                    break;
                }
                output += '&';
                break;
            default:
                output += ch;
                break;
        }
    }
    return output.replace(DOM.AMPERSAND_G, '&amp;');
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
        value = replaceAll(value, `{${i}}`, params[i]);
    }
    return value;
}

export function localizeString(value: string, rtl: boolean, api: number) {
    return rtl && api >= BUILD_VERSION.JELLYBEAN_1 && LOCALIZE_MAP[value] as string || value;
}

export function getXmlNs(value: string) {
    return XML_NAMESPACE[value] ? `xmlns:${value}="${XML_NAMESPACE[value] as string}"` : '';
}

export function getRootNs(value: string) {
    let output = '';
    for (const namespace in XML_NAMESPACE) {
        if (namespace === 'android' || namespace !== 'aapt' && value.indexOf(namespace + ':') !== -1) {
            output += '\n\t' + getXmlNs(namespace);
        }
    }
    return output;
}