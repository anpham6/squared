import { isArray, isString, repeat, trimEnd } from './util';

export function formatPlaceholder(id: string | number, symbol = ':') {
    return `{${symbol + id.toString()}}`;
}

export function replacePlaceholder(value: string, id: string | number, content: string, before = false) {
    const placeholder = typeof id === 'number' ? formatPlaceholder(id) : id;
    return value.replace(placeholder, (before ? placeholder : '') + content + (before ? '' : placeholder));
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
    return (
        value.replace(/&#(\d+);/g, (match, capture) => String.fromCharCode(parseInt(capture)))
            .replace(/\u00A0/g, '&#160;')
            .replace(/\u2002/g, '&#8194;')
            .replace(/\u2003/g, '&#8195;')
            .replace(/\u2009/g, '&#8201;')
            .replace(/\u200C/g, '&#8204;')
            .replace(/\u200D/g, '&#8205;')
            .replace(/\u200E/g, '&#8206;')
            .replace(/\u200F/g, '&#8207;')
    );
}

export function replaceCharacter(value: string) {
    return (
        value.replace(/&nbsp;/g, '&#160;')
            .replace(/&(?!#?[A-Za-z0-9]{2,};)/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/'/g, '&apos;')
            .replace(/"/g, '&quot;')
    );
}

export function parseTemplate(value: string) {
    const result: StringMap = { '__root': value };
    let pattern: RegExp | undefined;
    let match: RegExpExecArray | null | boolean = false;
    let characters = value.length;
    let section = '';
    do {
        if (match) {
            const segment = match[0].replace(new RegExp(`^${match[1]}\\n`), '').replace(new RegExp(`${match[1]}$`), '');
            for (const index in result) {
                result[index] = result[index].replace(new RegExp(match[0], 'g'), `{%${match[2]}}`);
            }
            result[match[2]] = segment;
            characters -= match[0].length;
            section = match[2];
        }
        if (match === null || characters === 0) {
            if (section) {
                value = result[section];
                if (!value) {
                    break;
                }
                characters = value.length;
                section = '';
                match = null;
            }
            else {
                break;
            }
        }
        if (!match) {
            pattern = /(!(\w+))\n[\w\W]*\n*\1/g;
        }
        if (pattern) {
            match = pattern.exec(value);
        }
        else {
            break;
        }
    }
    while (true);
    return result;
}

export function createTemplate(value: StringMap, data: ExternalData, index?: string) {
    let output = index === undefined ? value['__root'].trim() : value[index];
    for (const attr in data) {
        let result: any = '';
        if (isArray(data[attr])) {
            for (let i = 0; i < data[attr].length; i++) {
                result += createTemplate(value, data[attr][i], attr.toString());
            }
            result = trimEnd(result, '\\n');
        }
        else {
            result = data[attr];
        }
        let hash = '';
        if (isString(result)) {
            if (isArray(data[attr])) {
                hash = '%';
            }
            else {
                hash = '[&~]';
            }
            output = output.replace(new RegExp(`{${hash + attr}}`, 'g'), result);
        }
        if (result === false ||
            Array.isArray(result) && result.length === 0 ||
            hash && hash !== '%')
        {
            output = output.replace(new RegExp(`{%${attr}}\\n*`, 'g'), '');
        }
        if (hash === '' && new RegExp(`{&${attr}}`).test(output)) {
            output = '';
        }
    }
    if (index === undefined) {
        output = output.replace(/\n{%\w+}\n/g, '\n');
    }
    return output.replace(/\s+([\w:]+="[^"]*)?{~\w+}"?/g, '');
}

export function getTemplateSection(data: ExternalData, ...levels: string[]) {
    let current = data;
    for (const level of levels) {
        const [index, array = '0'] = level.split('-');
        if (current[index] && current[index][parseInt(array)]) {
            current = current[index][parseInt(array)];
        }
        else {
            return {};
        }
    }
    return current;
}