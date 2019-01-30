import { repeat, trimEnd } from './util';

type XMLTagData = {
    tag: string;
    tagName: string;
    value: string;
    closing: boolean;
};

function replaceTemplateSection(data: StringMap, value: string) {
    for (const index in data) {
        value = value.replace(new RegExp(`\\t*<<${index}>>[\\w\\W]*<<${index}>>`), `{%${index}}`);
    }
    return value;
}

export function formatPlaceholder(id: string | number, symbol = ':') {
    return `{${symbol + id.toString()}}`;
}

export function replacePlaceholder(value: string, id: string | number, content: string, before = false) {
    const placeholder = typeof id === 'number' ? formatPlaceholder(id) : id;
    return value.replace(placeholder, (before ? placeholder : '') + content + (before ? '' : placeholder));
}

export function replaceIndent(value: string, depth: number, leadingPattern: RegExp) {
    if (depth >= 0) {
        let indent = -1;
        return value.split('\n').map(line => {
            const match = leadingPattern.exec(line);
            if (match) {
                if (indent === -1) {
                    indent = match[2].length;
                }
                return match[1] + repeat(depth + (match[2].length - indent)) + match[3];
            }
            return line;
        })
        .join('\n');
    }
    return value;
}

export function replaceTab(value: string, spaces = 4, preserve = false) {
    if (spaces > 0) {
        if (preserve) {
            value = value.split('\n').map(line => {
                const match = line.match(/^(\t+)(.*)$/);
                if (match) {
                    return ' '.repeat(spaces * match[1].length) + match[2];
                }
                return line;
            })
            .join('\n');
        }
        else {
            value = value.replace(/\t/g, ' '.repeat(spaces));
        }
    }
    return value;
}

export function replaceEntity(value: string) {
    return value.replace(/&#(\d+);/g, (match, capture) => String.fromCharCode(parseInt(capture)))
        .replace(/\u00A0/g, '&#160;')
        .replace(/\u2002/g, '&#8194;')
        .replace(/\u2003/g, '&#8195;')
        .replace(/\u2009/g, '&#8201;')
        .replace(/\u200C/g, '&#8204;')
        .replace(/\u200D/g, '&#8205;')
        .replace(/\u200E/g, '&#8206;')
        .replace(/\u200F/g, '&#8207;');
}

export function replaceCharacter(value: string) {
    return value.replace(/&nbsp;/g, '&#160;')
        .replace(/&(?!#?[A-Za-z0-9]{2,};)/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/'/g, '&apos;')
        .replace(/"/g, '&quot;');
}

export function parseTemplate(value: string) {
    const result: StringMap = {};
    function parseSection(section: string) {
        const data: StringMap = {};
        const pattern = /(\t*<<(\w+)>>)\n*[\w\W]*\n*\1/g;
        let match: RegExpExecArray | null;
        while ((match = pattern.exec(section)) !== null) {
            const segment = match[0].replace(new RegExp(`^${match[1]}\\n`), '').replace(new RegExp(`${match[1]}$`), '');
            data[match[2]] = replaceTemplateSection(parseSection(segment), segment);
        }
        Object.assign(result, data);
        return data;
    }
    result['__ROOT__'] = replaceTemplateSection(parseSection(value), value);
    return result;
}

export function createTemplate(value: StringMap | string, data: ExternalData, format = false, index?: string) {
    let output: string = index === undefined ? value['__ROOT__'] : value[index];
    for (const attr in data) {
        const unknown = data[attr];
        let result: string | false = '';
        let hash = '';
        if (unknown === undefined || unknown === null) {
            continue;
        }
        else if (Array.isArray(unknown)) {
            hash = '%';
            if (Array.isArray(unknown[0])) {
                function partial(section: string) {
                    return `(\\t*##${attr}-${section}##\\s*\\n)([\\w\\W]*?\\s*\\n)(\\t*##${attr}-${section}##\\s*\\n)`;
                }
                const match = new RegExp(partial('start') + `([\\w\\W]*?)` + partial('end')).exec(output);
                if (match) {
                    let tagStart = '';
                    let tagEnd = '';
                    const depth = (unknown[0] as any[][]).length;
                    const guard = Object.assign({}, value);
                    for (let i = 0; i < depth; i++) {
                        const key = `${index}_${attr}_${i}`;
                        guard[key] = match[2];
                        tagStart += createTemplate(guard, unknown[0][i], format, key);
                        tagEnd = match[6] + tagEnd;
                    }
                    output = output
                                .replace(match[2], tagStart).replace(match[6], tagEnd)
                                .replace(match[1], '').replace(match[3], '')
                                .replace(new RegExp(`\\t*${match[5]}`), '').replace(new RegExp(`\\t*${match[7]}`), '');
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
                    result += createTemplate(value, unknown[i], format, attr.toString());
                }
                if (result === '') {
                    result = false;
                }
                else {
                    result = trimEnd(result, '\n');
                }
            }
        }
        else {
            hash = '[&~]';
            result = typeof unknown === 'boolean' ? '' : unknown.toString();
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
    if (index === undefined) {
        output = output
            .replace(/\n*\t*{%\w+}\n+/g, '\n')
            .replace(/\n\n/g, '\n').trim();
        if (format) {
            output = formatTemplate(output);
        }
    }
    return output.replace(/\s*((\w+:)?\w+="[^"]*)?{~\w+}"?/g, '');
}

export function formatTemplate(value: string, closeEmpty = true, char = '\t') {
    const lines: XMLTagData[] = [];
    const pattern = /\s*(<(\/)?([?\w]+)[^>]*>)\n?([^<]*)/g;
    let match: RegExpExecArray | null;
    while ((match = pattern.exec(value)) !== null) {
        lines.push({
            tag: match[1],
            closing: !!match[2],
            tagName: match[3],
            value: match[4].trim() === '' ? '' : match[4]
        });
    }
    const closed = /\/>\n*$/;
    let result = '';
    let indent = -1;
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        let previous = indent;
        if (i > 0) {
            if (line.closing) {
                indent--;
            }
            else {
                previous++;
                if (!closed.exec(line.tag)) {
                    if (closeEmpty && line.value.trim() === '') {
                        const next = lines[i + 1];
                        if (next && next.closing && next.tagName === line.tagName) {
                            line.tag = line.tag.replace(/\s*>$/, ' />');
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
            line.tag.trim().split('\n').forEach((partial, index) => {
                const depth = previous + (index > 0 ? 1 : 0);
                result += (depth > 0 ? repeat(depth, char) : '') + partial.trim() + '\n';
            });
        }
        else {
            result += line.tag + '\n';
        }
        result += line.value;
    }
    return result.trim();
}