import { isPlainObject, joinArray } from './util';

interface XMLTagData {
    tag: string;
    tagName: string;
    value: string;
    closing: boolean;
}

export const STRING_XMLENCODING = '<?xml version="1.0" encoding="utf-8"?>\n';
export const STRING_SPACE = '&#160;';

export function isPlainText(value: string) {
    const length = value.length;
    let i = 0;
    while (i < length) {
        switch (value.charCodeAt(i++)) {
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

export function pushIndent(value: string, depth: number, char = '\t', indent?: string) {
    if (depth > 0) {
        if (indent === undefined) {
            indent = char.repeat(depth);
        }
        return joinArray(value.split('\n'), line => line !== '' ? indent + line : '');
    }
    return value;
}

export function pushIndentArray(values: string[], depth: number, char = '\t', separator = '') {
    if (depth > 0) {
        let result = '';
        const indent = char.repeat(depth);
        const length = values.length;
        let i = 0;
        while (i < length) {
            result += (i > 0 ? separator : '') + pushIndent(values[i++], depth, char, indent);
        }
        return result;
    }
    return values.join(separator);
}

export function replaceIndent(value: string, depth: number, pattern: RegExp) {
    if (depth >= 0) {
        let indent = -1;
        return joinArray(value.split('\n'), line => {
            const match = pattern.exec(line);
            if (match) {
                if (indent === -1) {
                    indent = match[2].length;
                }
                return (match[1] || '') + '\t'.repeat(depth + (match[2].length - indent)) + match[3];
            }
            return line;
        });
    }
    return value;
}

export function replaceTab(value: string, spaces = 4, preserve = false) {
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

export function applyTemplate(tagName: string, template: StandardMap, children: StandardMap[], depth?: number) {
    const tag: ObjectMap<any> = template[tagName];
    const nested = tag['>>'] === true;
    let output = '';
    let indent = '';
    if (depth === undefined) {
        output += STRING_XMLENCODING;
        depth = 0;
    }
    else {
        indent += '\t'.repeat(depth);
    }
    let length = children.length;
    for (let i = 0; i < length; ++i) {
        const item = children[i];
        const include: Undef<string> = tag['#'] && item[tag['#']];
        const closed = !nested && !include;
        const attrs: Undef<string[]> = tag['@'];
        const descend: Undef<StringMap> = tag['>'];
        let valid = false;
        output += indent + '<' + tagName;
        if (attrs) {
            const q = attrs.length;
            let j = 0;
            while (j < q) {
                const attr = attrs[j++];
                const value = item[attr];
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

export function formatTemplate(value: string, closeEmpty = false, startIndent = -1, char = '\t') {
    const lines: XMLTagData[] = [];
    const pattern = /\s*(<(\/)?([?\w]+)[^>]*>)\n?([^<]*)/g;
    let match: Null<RegExpExecArray>;
    while (match = pattern.exec(value)) {
        lines.push({
            tag: match[1],
            closing: !!match[2],
            tagName: match[3],
            value: match[4]
        });
    }
    let output = '';
    let indent = startIndent;
    let ignoreIndent = false;
    const length = lines.length;
    for (let i = 0; i < length; ++i) {
        const line = lines[i];
        let previous = indent;
        if (i > 0) {
            let single = false;
            if (line.closing) {
                --indent;
            }
            else {
                const next = lines[i + 1];
                single = next.closing && line.tagName === next.tagName;
                if (!/\/>\n*$/.exec(line.tag)) {
                    if (closeEmpty && line.value.trim() === '') {
                        if (next?.closing && next.tagName === line.tagName) {
                            line.tag = line.tag.replace(/\s*>$/, ' />');
                            ++i;
                        }
                        else {
                            ++indent;
                        }
                    }
                    else {
                        ++indent;
                    }
                }
                ++previous;
            }
            const tags = line.tag.trim().split('\n');
            const q = tags.length;
            for (let j = 0; j < q; ++j) {
                const partial = tags[j];
                if (ignoreIndent) {
                    output += partial;
                    ignoreIndent = false;
                }
                else {
                    const depth = previous + Math.min(j, 1);
                    output += (depth > 0 ? char.repeat(depth) : '') + partial.trim();
                }
                if (single && q === 1) {
                    ignoreIndent = true;
                }
                else {
                    output += '\n';
                }
            }
        }
        else {
            output += (startIndent > 0 ? char.repeat(startIndent) : '') + line.tag + '\n';
        }
        output += line.value;
    }
    return output;
}

export function replaceCharacterData(value: string, tab?: number) {
    value = value
        .replace(/&nbsp;/g, '&#160;')
        .replace(/&(?!#[A-Za-z\d]{2,};)/g, '&amp;');
    const char: { i: number; text: string }[] = [];
    const length = value.length;
    for (let i = 0; i < length; ++i) {
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
                    char.push({ i, text: STRING_SPACE.repeat(tab) });
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
    if (char.length) {
        const parts = value.split('');
        let j = 0;
        while (j < char.length) {
            const { i, text } = char[j++];
            parts[i] = text;
        }
        return parts.join('');
    }
    return value;
}