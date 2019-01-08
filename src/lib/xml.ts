import { isArray, isString, repeat, trimEnd } from './util';

export function formatPlaceholder(id: string | number, symbol = ':') {
    return `{${symbol + id.toString()}}`;
}

export function replacePlaceholder(value: string, id: string | number, content: string, before = false) {
    const placeholder = typeof id === 'number' ? formatPlaceholder(id) : id;
    return value.replace(placeholder, (before ? placeholder : '') + content + (before ? '' : placeholder));
}

export function pushIndent(value: string, depth: number, excludePattern?: RegExp, char = '\t') {
    const indent = repeat(depth, char);
    return value.split('\n').map(line => {
        if (line !== '' && (excludePattern === undefined || !excludePattern.test(line))) {
            return indent + line;
        }
        return line;
    })
    .join('\n');
}

export function pullIndent(value: string, depth: number, char = '\t') {
    return value.split('\n').map(line => line.length > depth && line.charAt(0) === char ? line.substring(depth) : line).join('\n');
}

export function replaceIndent(value: string, depth: number, pattern: RegExp) {
    if (depth >= 0) {
        let indent = -1;
        return value.split('\n').map(line => {
            const match = pattern.exec(line);
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
    const result: StringMap = { '__root': value };
    function parseSection(section: string) {
        const pattern = /(\t*<<(\w+)>>)\n[\w\W]*\n*\1/g;
        let match: RegExpExecArray | null = null;
        do {
            match = pattern.exec(section);
            if (match) {
                const segment = match[0].replace(new RegExp(`^${match[1]}\\n`), '').replace(new RegExp(`${match[1]}$`), '');
                for (const index in result) {
                    result[index] = result[index].replace(match[0], `{%${match[2]}}`);
                }
                result[match[2]] = segment;
                parseSection(segment);
            }
        }
        while (match);
    }
    parseSection(value);
    return result;
}

export function createTemplate(value: StringMap | string, data: ExternalData, index?: string) {
    function partial(attr: string, section: string) {
        return `(\\t*##${attr}-${section}:(\\d+)##\\s*\\n)([\\w\\W]*?)\\s*\\n(\\t*##${attr}-${section}##\\s*\\n)`;
    }
    let output = typeof value === 'string' ? value : !index ? value['__root'].trim() : value[index];
    const indentData: StringMap = {};
    for (const attr in data) {
        const unknown = data[attr];
        let array = false;
        let result: any = '';
        let hash = '';
        if (isArray(unknown)) {
            array = true;
            if (Array.isArray(unknown[0])) {
                const match = new RegExp(partial(attr, 'start') + `([\\w\\W]*?)` + partial(attr, 'end')).exec(output);
                if (match) {
                    let outputStart = '';
                    let outputEnd = '';
                    let depth = (unknown[0] as any[][]).length;
                    for (let i = 0; i < depth; i++) {
                        let templateStart = match[3];
                        let templateEnd = match[8];
                        if (i > 0) {
                            templateStart = '\n' + pushIndent(templateStart, i);
                            templateEnd = pushIndent(templateEnd, i) + '\n';
                        }
                        outputStart += createTemplate(templateStart, unknown[0][i], attr.toString());
                        outputEnd = templateEnd + outputEnd;
                    }
                    const indent = parseInt(match[2]);
                    const pattern = /{%(\w+)}\s*/g;
                    if (depth === 0 && indent === 0) {
                        const replaced: string[] = [];
                        let inline: RegExpExecArray | null = null;
                        do {
                            if (replaced.length) {
                                match[5] = value[replaced.shift() as string];
                            }
                            while ((inline = pattern.exec(match[5])) !== null) {
                                if (value[inline[1]]) {
                                    indentData[inline[1]] = pullIndent(value[inline[1]], 1);
                                    replaced.push(inline[1]);
                                }
                            }
                        }
                        while (replaced.length > 0);
                    }
                    else {
                        depth += indent - 1;
                        if (depth > 0) {
                            let inline: RegExpExecArray | null = null;
                            while ((inline = pattern.exec(match[5])) !== null) {
                                if (value[inline[1]]) {
                                    value[inline[1]] = pushIndent(value[inline[1]], depth, /^{%\w+}/);
                                }
                            }
                            output = output.replace(match[5], pushIndent(match[5].replace(/\s*$/, ''), depth, /^{%\w+}/));
                        }
                    }
                    output = output
                        .replace(match[3], outputStart).replace(match[8], '\n' + outputEnd)
                        .replace(match[1], '').replace(match[4], '')
                        .replace(new RegExp(`\\t*${match[6]}`), '').replace(new RegExp(`\\t*${match[9]}`), '');
                    output = output.split('\n').filter(line => line !== '').join('\n') + '\n';
                }
                else {
                    result = false;
                }
            }
            else if (typeof unknown[0] !== 'object') {
                result = false;
            }
            else if (typeof value === 'object') {
                let segmentData: ExternalData;
                if (indentData[attr]) {
                    segmentData = { ...value, ...indentData };
                }
                else {
                    segmentData = value;
                }
                for (let i = 0; i < unknown.length; i++) {
                    result += createTemplate(segmentData, unknown[i], attr.toString());
                }
                if (result === '') {
                    result = false;
                }
                else {
                    result = trimEnd(result, '\\n');
                }
            }
        }
        else {
            result = unknown;
        }
        if (isString(result)) {
            if (array) {
                hash = '%';
            }
            else {
                hash = '[&~]';
            }
            output = output.replace(new RegExp(`{${hash + attr}}`, 'g'), result);
        }
        if (result === false || Array.isArray(result) && result.length === 0) {
            output = output.replace(new RegExp(`\\t*{%${attr}}\\n*`, 'g'), '');
        }
        if (hash === '' && new RegExp(`{&${attr}}`).test(output)) {
            return '';
        }
    }
    if (index === undefined) {
        output = output.replace(/\n{%\w+}\n/g, '\n');
    }
    return output.replace(/\s*([\w:]+="[^"]*)?{~\w+}"?/g, '');
}