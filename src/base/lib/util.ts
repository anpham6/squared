type IGlobExp = squared.base.lib.util.IGlobExp;

interface XMLTagData {
    tag: string;
    tagName: string;
    closing: boolean;
    didClose: boolean;
    leadingSpace: string;
    content: string;
    trailingSpace: string;
}

class GlobExp extends RegExp implements IGlobExp {
    constructor(source: string, flags: string, public negate: boolean) {
        super(source, flags);
    }

    test(value: string) {
        return this.negate ? !super.test(value) : super.test(value);
    }
    filter(values: string[]) {
        return values.filter(value => this.test(value));
    }
}

const HEX = '0123456789abcdef';

export function fromMimeType(value: string) {
    const [type, name] = value.split('/');
    switch (type) {
        case 'image':
            switch (name) {
                case 'apng':
                case 'avif':
                case 'bmp':
                case 'heic':
                case 'heif':
                case 'png':
                case 'webp':
                    return name;
                case 'vnd.wap.wbmp':
                    return 'wbmp';
                case 'jpeg':
                    return 'jpg';
                case 'svg+xml':
                    return 'svg';
                case 'tiff':
                    return 'tif';
                case 'x-ms-bmp':
                    return 'bmp';
                case 'x-icon':
                    return 'ico';
            }
            break;
        case 'audio':
            switch (name) {
                case 'aac':
                case 'flac':
                case 'gif':
                case 'gsm':
                case 'ogg':
                case 'wav':
                case 'webm':
                    return name;
                case 'midi':
                    return 'mid';
                case 'mpeg':
                    return 'mp3';
                case 'x-realaudio':
                    return 'ra';
                case 'wave':
                case 'x-wav':
                case 'x-pn-wav':
                    return 'wav';
            }
            break;
        case 'video':
            switch (name) {
                case 'h264':
                case 'jpeg2000':
                case 'mp4':
                case 'mpeg':
                case 'webm':
                    return name;
                case '3gpp':
                    return '3gp';
                case '3gpp2':
                    return '3g2';
                case 'ogg':
                    return 'ogv';
                case 'mp2t':
                    return 'ts';
                case 'quicktime':
                    return 'mov';
                case 'x-ms-asf':
                    return 'asf';
                case 'x-flv':
                    return 'flv';
                case 'x-m4v':
                    return 'm4v';
                case 'x-matroska':
                    return 'mkv';
                case 'x-mng':
                    return 'mng';
                case 'x-ms-wmv':
                    return 'wmv';
                case 'x-msvideo':
                    return 'avi';
            }
            break;
        case 'text':
            switch (name) {
                case 'css':
                case 'csv':
                case 'html':
                case 'sgml':
                case 'vtt':
                case 'xml':
                    return name;
                case 'calendar':
                    return 'ics';
                case 'javascript':
                    return 'js';
                case 'markdown':
                    return 'md';
                case 'mathml':
                    return 'mml';
                case 'plain':
                    return 'txt';
                case 'vnd.sun.j2me.app-descriptor':
                    return 'jad';
                case 'vnd.wap.wml':
                    return 'wml';
                case 'x-component':
                    return 'htc';
                case 'yaml':
                    return 'yml';
            }
            break;
        case 'font':
            switch (name) {
                case 'otf':
                case 'ttf':
                case 'woff':
                case 'woff2':
                    return name;
                case 'sfnt':
                    return 'ttf';
            }
            break;
        case 'application':
            switch (value) {
                case 'json':
                case 'pdf':
                case 'rtf':
                case 'zip':
                    return name;
                case 'atom+xml':
                    return 'atom';
                case 'epub+zip':
                    return 'epub';
                case 'java-archive':
                    return 'jar';
                case 'ld+json':
                    return 'jsonld';
                case 'msword':
                    return 'doc';
                case 'postscript':
                    return 'ps';
                case 'octet-stream':
                    return 'bin';
                case 'ogg':
                    return 'ogx';
                case 'rss+xml':
                    return 'rss';
                case 'vnd.amazon.ebook':
                    return 'azw';
                case 'vnd.apple.installer+xml':
                    return 'mpkg';
                case 'vnd.mozilla.xul+xml':
                    return 'xul';
                case 'vnd.ms-excel':
                    return 'xls';
                case 'vnd.ms-fontobject':
                    return 'eot';
                case 'vnd.ms-powerpoint':
                    return 'ppt';
                case 'vnd.oasis.opendocument.graphics':
                    return 'odg';
                case 'vnd.oasis.opendocument.presentation':
                    return 'odp';
                case 'vnd.oasis.opendocument.spreadsheet':
                    return 'ods';
                case 'vnd.oasis.opendocument.text':
                    return 'odt';
                case 'vnd.openxmlformats-officedocument.presentationml.presentation':
                    return 'pptx';
                case 'vnd.openxmlformats-officedocument.spreadsheetml.sheet':
                    return 'xlsx';
                case 'vnd.openxmlformats-officedocument.wordprocessingml.document':
                    return 'docx';
                case 'vnd.visio':
                    return 'vsd';
                case 'x-7z-compressed':
                    return '7z';
                case 'x-abiword':
                    return 'abw';
                case 'x-bzip':
                    return 'bz';
                case 'x-bzip2':
                    return 'bz2';
                case 'x-csh':
                    return 'csh';
                case 'x-freearc':
                    return 'arc';
                case 'x-perl':
                    return 'pl';
                case 'x-rar-compressed':
                    return 'rar';
                case 'x-sh':
                    return 'sh';
                case 'x-shockwave-flash':
                    return 'swf';
                case 'x-tar':
                    return 'tar';
                case 'xhtml+xml':
                    return 'xhtml';
            }
            break;
    }
    return '';
}

export function appendSeparator(preceding = '', value = '', separator = '/') {
    preceding = preceding.trim();
    value = value.trim();
    switch (separator) {
        case '\\':
            preceding &&= preceding.replace(/\//g, '\\');
            value &&= value.replace(/\//g, '\\');
            break;
        case '/':
            preceding &&= preceding.replace(/\\/g, '/');
            value &&= value.replace(/\\/g, '/');
            break;
    }
    return preceding + (preceding && value && !preceding.endsWith(separator) && !value.startsWith(separator) ? separator : '') + value;
}

export function randomUUID(separator = '-') {
    let result = '';
    for (const length of [8, 4, 4, 4, 12]) {
        if (result) {
            result += separator;
        }
        for (let i = 0; i < length; ++i) {
            result += HEX[Math.floor(Math.random() * 16)];
        }
    }
    return result;
}

export function upperCaseString(value: string) {
    const pattern = /\b([a-z])/g;
    let result: Undef<string[]>,
        match: Null<RegExpMatchArray>;
    while (match = pattern.exec(value)) {
        (result ||= value.split(''))[match.index!] = match[1][0].toUpperCase();
    }
    return result ? result.join('') : value;
}

export function lowerCaseString(value: string) {
    const entities: string[] = [];
    const pattern = /&#?[A-Za-z\d]+?;/g;
    let match: Null<RegExpMatchArray>;
    while (match = pattern.exec(value)) {
        entities.push(match[0]);
    }
    if (entities.length) {
        let result = '';
        const segments = value.split(pattern);
        for (let i = 0, length = segments.length; i < length; ++i) {
            result += segments[i].toLowerCase() + (entities[i] || '');
        }
        return result;
    }
    return value.toLowerCase();
}

export function formatXml(value: string, options: FormatXmlOptions = {}) {
    const { closeEmptyTags = true, caseSensitive, indentChar = '\t' } = options;
    const pattern = /\s*(<(\/)?(!?[A-Za-z\d-]+)([^>]*)>)(\s*)([^<]*)/g;
    const patternContent = /^([\S\s]*?)(\s*)$/;
    const lines: XMLTagData[] = [];
    let output = '',
        indent = -1,
        ignoreIndent: Undef<boolean>,
        match: Null<RegExpExecArray>;
    while (match = pattern.exec(value)) {
        const tag = match[1];
        const closing = match[2] === '/';
        const content = patternContent.exec(match[6])!;
        lines.push({
            tag,
            closing,
            tagName: caseSensitive ? match[3].toUpperCase() : match[3],
            didClose: !closing && tag.endsWith('/>'),
            leadingSpace: match[5],
            content: content[1],
            trailingSpace: content[2]
        });
    }
    const length = lines.length;
    for (let i = 0; i < length; ++i) {
        const line = lines[i];
        let previousIndent = indent,
            single: Undef<boolean>,
            willClose: Undef<boolean>;
        if (line.closing) {
            const previous = lines[i - 1];
            if (!previous.closing && previous.tagName === previous.tagName && previous.leadingSpace.includes('\n')) {
                output += indentChar.repeat(previousIndent);
            }
            --indent;
        }
        else {
            const next = lines[i + 1] as Undef<XMLTagData>;
            const tagName = line.tagName;
            single = next && next.closing && tagName === next.tagName;
            if (!line.didClose) {
                for (let j = i + 1, k = 0; j < length; ++j) {
                    const item = lines[j];
                    if (tagName === item.tagName) {
                        if (item.closing) {
                            if (k-- === 0) {
                                willClose = true;
                                break;
                            }
                        }
                        else {
                            ++k;
                        }
                    }
                }
                if (closeEmptyTags && !line.content && line.tag[1] !== '!') {
                    if (single || !willClose) {
                        line.tag = line.tag.replace(/\s*>$/, ' />');
                        if (willClose) {
                            ++i;
                        }
                    }
                    else if (willClose) {
                        ++indent;
                    }
                }
                else if (willClose) {
                    ++indent;
                }
            }
            ++previousIndent;
        }
        const tags = line.tag.split('\n');
        for (let j = 0, q = tags.length; j < q; ++j) {
            const partial = tags[j];
            if (ignoreIndent) {
                output += partial;
                ignoreIndent = false;
            }
            else {
                const depth = previousIndent + Math.min(j, 1);
                output += (depth > 0 ? indentChar.repeat(depth) : '') + partial.trim();
            }
            if (single && q === 1) {
                ignoreIndent = true;
            }
            else {
                output += '\n';
            }
        }
        if (line.content) {
            let leadingSpace = line.leadingSpace;
            if (leadingSpace && leadingSpace.includes('\n')) {
                leadingSpace = leadingSpace.replace(/^[^\n]+/, '');
            }
            output += (leadingSpace ? leadingSpace : '') + line.content + (leadingSpace || line.trailingSpace.includes('\n') ? '\n' : '');
        }
    }
    return output;
}

export function parseGlob(value: string, options?: ParseGlobOptions) {
    value = value.trim();
    let flags = '',
        fromEnd: Undef<boolean>;
    if (options) {
        if (options.caseSensitive === false) {
            flags += 'i';
        }
        fromEnd = options.fromEnd;
    }
    const trimCurrent = (cwd: string) => fromEnd && cwd.startsWith('./') ? cwd.substring(2) : cwd;
    const source = ((!fromEnd ? '^' : '') + trimCurrent(value))
        .replace(/\\\\([^\\])/g, (...match: string[]) => ':' + match[1].charCodeAt(0))
        .replace(/\\|\/\.\/|\/[^/]+\/\.\.\//g, '/')
        .replace(/\{([^}]+)\}/g, (...match: string[]) => {
            return '(' + match[1].split(',').map(group => {
                group = trimCurrent(group);
                const subMatch = /^([^.]+)\.\.([^.]+)$/.exec(group);
                return subMatch ? `[${subMatch[1]}-${subMatch[2]}]` : group;
            }).join('|') + ')';
        })
        .replace(/\./g, '\\.')
        .replace(/\[[!^]([^\]]+)\]/g, (...match: string[]) => `[^/${match[1]}]`)
        .replace(/(\*\*\/)*\*+$/, '.::')
        .replace(/(\*\*\/)+/g, '([^/]+/)::')
        .replace(/([!?*+@])(\([^)]+\))/g, (...match: string[]) => {
            const escape = () => match[2].replace(/\*/g, ':>').replace(/\?/g, ':<');
            switch (match[1]) {
                case '!':
                    return `(?!${escape()})[^/]+:@`;
                case '?':
                case '*':
                case '+':
                    return escape() + match[1];
                case '@':
                    return match[2];
                default:
                    return match[0];
            }
        })
        .replace(/\?(?!!)/g, '[^/]')
        .replace(/\*/g, '[^/]*?')
        .replace(/:([@:<>]|\d+)/g, (...match: string[]) => {
            switch (match[1]) {
                case ':':
                    return '*';
                case '@':
                    return '?';
                case '>':
                    return '\\*';
                case '<':
                    return '\\?';
                default:
                    return '\\\\' + String.fromCharCode(+match[1]);
            }
        }) + '$';
    return new GlobExp(source, flags, value[0] === '!') as IGlobExp;
}