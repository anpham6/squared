import { ESCAPE } from './regex';
import { joinMap } from './util';

type XMLTagData = {
    tag: string;
    tagName: string;
    value: string;
    closing: boolean;
};

const REGEXP_INDENT = /^(\t+)(.*)$/;

const REGEXP_FORMAT = {
    ITEM: /\s*(<(\/)?([?\w]+)[^>]*>)\n?([^<]*)/g,
    OPENTAG: /\s*>$/,
    CLOSETAG: /\/>\n*$/
};

export const STRING_XMLENCODING = '<?xml version="1.0" encoding="utf-8"?>\n';

export function isPlainText(value: string) {
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

export function pushIndent(value: string, depth: number, char = '\t', indent?: string) {
    if (depth > 0) {
        if (indent === undefined) {
            indent = char.repeat(depth);
        }
        return joinMap(value.split('\n'), line => line !== '' ? indent + line : '');
    }
    return value;
}

export function pushIndentArray(values: string[], depth: number, char = '\t', separator = '') {
    if (depth > 0) {
        const indent = char.repeat(depth);
        for (let i = 0; i < values.length; i++) {
            values[i] = pushIndent(values[i], depth, char, indent);
        }
    }
    return values.join(separator);
}

export function replaceIndent(value: string, depth: number, pattern: RegExp) {
    if (depth >= 0) {
        let indent = -1;
        return joinMap(value.split('\n'), line => {
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
            return joinMap(value.split('\n'), line => {
                const match = REGEXP_INDENT.exec(line);
                if (match) {
                    return ' '.repeat(spaces * match[1].length) + match[2];
                }
                return line;
            })
            .trim();
        }
        else {
            return value.replace(/\t/g, ' '.repeat(spaces));
        }
    }
    return value;
}

export function applyTemplate(tagName: string, template: ExternalData, children: ExternalData[], depth?: number) {
    const tag = template[tagName];
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
    for (let i = 0; i < children.length; i++) {
        const item = children[i];
        const include: string | undefined = tag['#'] && item[tag['#']];
        const closed = !nested && !include;
        let valid = false;
        output += indent + '<' + tagName;
        if (tag['@']) {
            for (const attr of tag['@']) {
                if (item[attr]) {
                    output += ` ${(tag['^'] ? tag['^'] + ':' : '') + attr}="${item[attr]}"`;
                }
            }
        }
        if (tag['>']) {
            let innerText = '';
            const childDepth = depth + (nested ? i : 0) + 1;
            for (const name in tag['>']) {
                if (Array.isArray(item[name])) {
                    innerText += applyTemplate(name, tag['>'], item[name], childDepth);
                }
                else if (typeof item[name] === 'object') {
                    innerText += applyTemplate(name, tag['>'], [item[name]], childDepth);
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
        for (let i = 0; i < children.length; i++) {
            indent = indent.substring(1);
            output += indent + `</${tagName}>\n`;
        }
    }
    return output;
}

export function formatTemplate(value: string, closeEmpty = true, startIndent = -1, char = '\t') {
    const lines: XMLTagData[] = [];
    let match: RegExpExecArray | null;
    while ((match = REGEXP_FORMAT.ITEM.exec(value)) !== null) {
        lines.push({
            tag: match[1],
            closing: !!match[2],
            tagName: match[3],
            value: match[4].trim() === '' ? '' : match[4]
        });
    }
    let output = '';
    let indent = startIndent;
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        let previous = indent;
        if (i > 0) {
            if (line.closing) {
                indent--;
            }
            else {
                previous++;
                if (!REGEXP_FORMAT.CLOSETAG.exec(line.tag)) {
                    if (closeEmpty && line.value.trim() === '') {
                        const next = lines[i + 1];
                        if (next && next.closing && next.tagName === line.tagName) {
                            line.tag = line.tag.replace(REGEXP_FORMAT.OPENTAG, ' />');
                            i++;
                        }
                        else {
                            indent++;
                        }
                    }
                    else {
                        indent++;
                    }
                }
            }
            let firstLine = true;
            for (const partial of line.tag.trim().split('\n')) {
                const depth = previous + (firstLine ? 0 : 1);
                output += (depth > 0 ? char.repeat(depth) : '') + partial.trim() + '\n';
                firstLine = false;
            }
        }
        else {
            output += (startIndent > 0 ? char.repeat(startIndent) : '') + line.tag + '\n';
        }
        output += line.value;
    }
    return output;
}

export function replaceCharacter(value: string) {
    return value
        .replace(ESCAPE.NBSP, '&#160;')
        .replace(ESCAPE.LT, '&lt;')
        .replace(ESCAPE.GT, '&gt;')
        .replace(ESCAPE.DOUBLEQUOTE, '&quot;')
        .replace(ESCAPE.SINGLEQUOTE, "\\'");
}

export function replaceEntity(value: string) {
    return value
        .replace(ESCAPE.U00A0, '&#160;')
        .replace(ESCAPE.U2002, '&#8194;')
        .replace(ESCAPE.U2003, '&#8195;')
        .replace(ESCAPE.U2009, '&#8201;')
        .replace(ESCAPE.U200C, '&#8204;')
        .replace(ESCAPE.U200D, '&#8205;')
        .replace(ESCAPE.U200E, '&#8206;')
        .replace(ESCAPE.U200F, '&#8207;');
}

export function escapeAmpersand(value: string) {
    return value.replace(ESCAPE.NONENTITY, '&amp;');
}