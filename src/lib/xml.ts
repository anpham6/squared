import { joinMap, trimEnd } from './util';

type XMLTagData = {
    tag: string;
    tagName: string;
    value: string;
    closing: boolean;
};

const STRING_ROOT = '__ROOT__';
const REGEXP_CREATE = {
    ATTRIBUTE: /\s*((\w+:)?\w+="[^"]*)?{~\w+}"?/g,
    COLLECTION: /\n*({%\w+}\n)+/g,
    LINEBREAK: /\n\n/g
};
const REGEXP_FORMAT = {
    ITEM: /\s*(<(\/)?([?\w]+)[^>]*>)\n?([^<]*)/g,
    OPENTAG: /\s*>$/,
    CLOSETAG: /\/>\n*$/
};
const REGEXP_INDENT = /^(\t+)(.*)$/;

function replaceSectionTag(data: StringMap, value: string) {
    for (const index in data) {
        value = value.replace(new RegExp(`\\t*<<${index}>>[\\w\\W]*<<${index}>>`), `{%${index}}`);
    }
    return value;
}

function getSectionTag(attr: string, value: string) {
    return `((\\t*##${attr}-${value}##\\s*\\n)([\\w\\W]*?\\s*\\n)(\\t*##${attr}-${value}##\\s*\\n))`;
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
                const match = line.match(REGEXP_INDENT);
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

export function replaceEntity(value: string) {
    return value
        .replace(/&#(\d+);/g, (match, capture) => String.fromCharCode(parseInt(capture)))
        .replace(/\u00A0/g, '&#160;')
        .replace(/\u2002/g, '&#8194;')
        .replace(/\u2003/g, '&#8195;')
        .replace(/\u2009/g, '&#8201;')
        .replace(/\u200C/g, '&#8204;')
        .replace(/\u200D/g, '&#8205;')
        .replace(/\u200E/g, '&#8206;')
        .replace(/\u200F/g, '&#8207;');
}

export function escapeNonEntity(value: string) {
    return value.replace(/&(?!#?[A-Za-z0-9]{2,};)/g, '&amp;');
}

export function parseTemplate(value: string) {
    const result: StringMap = {};
    function parseSection(section: string) {
        const data: StringMap = {};
        const pattern = /(\t*<<(\w+)>>)\n*[\w\W]*\n*\1/g;
        let match: RegExpExecArray | null;
        while ((match = pattern.exec(section)) !== null) {
            match[0] = match[0]
                .replace(new RegExp(`^${match[1]}\\n`), '')
                .replace(new RegExp(`${match[1]}$`), '');
            data[match[2]] = replaceSectionTag(parseSection(match[0]), match[0]);
        }
        Object.assign(result, data);
        return data;
    }
    result[STRING_ROOT] = replaceSectionTag(parseSection(value), value);
    return result;
}

export function createTemplate(templates: StringMap, data: ExternalData, format = false, index?: string) {
    if (index === undefined) {
        index = STRING_ROOT;
    }
    let output: string = templates[index] || '';
    for (const attr in data) {
        if (data[attr] !== undefined && data[attr] !== null) {
            const unknown = data[attr];
            let result: string | false = '';
            let hash = '';
            if (Array.isArray(unknown)) {
                hash = '%';
                if (Array.isArray(unknown[0])) {
                    const match = new RegExp(getSectionTag(attr, 'start') + `([\\w\\W]*?)` + getSectionTag(attr, 'end')).exec(output);
                    if (match) {
                        const depth = (unknown[0] as any[][]).length;
                        const guard = { ...templates };
                        let tagStart = '';
                        let tagEnd = '';
                        for (let i = 0; i < depth; i++) {
                            const key = `${index}_${attr}_${i}`;
                            guard[key] = match[3];
                            tagStart += createTemplate(guard, unknown[0][i], format, key);
                            tagEnd = match[8] + tagEnd;
                        }
                        output = output
                            .replace(match[1], tagStart)
                            .replace(match[6], tagEnd);
                    }
                    else {
                        result = false;
                    }
                }
                else if (unknown.length === 0 || typeof unknown[0] !== 'object') {
                    result = false;
                }
                else {
                    for (let i = 0; i < unknown.length; i++) {
                        result += createTemplate(templates, unknown[i], format, attr.toString());
                    }
                    if (result !== '') {
                        result = trimEnd(result, '\n');
                    }
                    else {
                        result = false;
                    }
                }
            }
            else {
                hash = '[&~]';
                result = typeof unknown === 'boolean' ? false : unknown.toString();
            }
            if (!result) {
                if (new RegExp(`{&${attr}}`).test(output)) {
                    return '';
                }
                else if (hash === '%') {
                    output = output.replace(new RegExp(`[ \\t]*{%${attr}}\\n*`), '');
                }
            }
            else if (result !== '') {
                output = output.replace(new RegExp(`{${hash + attr}}`), result);
            }
        }
    }
    if (index === STRING_ROOT) {
        output = output
            .replace(REGEXP_CREATE.ATTRIBUTE, '')
            .replace(REGEXP_CREATE.COLLECTION, '\n');
        if (format) {
            output = formatTemplate(output);
        }
        else {
            output = output.trim();
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
    return output.trim();
}