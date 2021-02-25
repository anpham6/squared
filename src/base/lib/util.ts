const { endsWith, splitPair, startsWith } = squared.lib.util;

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
                case 'tab-separated-values':
                    return 'tsv';
                case 'vnd.sun.j2me.app-descriptor':
                    return 'jad';
                case 'vnd.wap.wml':
                    return 'wml';
                case 'x-component':
                    return 'htc';
                case 'x-java-source':
                    return 'java';
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
                case 'dash+xml':
                    return 'mpd';
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
                case 'vnd.apple.mpegurl':
                case 'x-mpegurl':
                    return 'm3u8';
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
                case 'x-httpd-cgi':
                    return 'cgi';
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
            preceding &&= preceding.replace(/\/+/g, '\\');
            value &&= value.replace(/\/+/g, '\\');
            break;
        case '/':
            preceding &&= preceding.replace(/\\+/g, '/');
            value &&= value.replace(/\\+/g, '/');
            break;
    }
    return preceding + (preceding && value && !endsWith(preceding, separator) && !startsWith(value, separator) ? separator : '') + value;
}

export function randomUUID(separator = '-') {
    return [8, 4, 4, 4, 12].reduce((a, b, index) => {
        if (index > 0) {
            a += separator;
        }
        for (let i = 0; i < b; ++i) {
            a += HEX[Math.floor(Math.random() * 16)];
        }
        return a;
    }, '');
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
    return entities.length ? value.split(pattern).reduce((a, b, index) => a + b.toLowerCase() + (entities[index] || ''), '') : value.toLowerCase();
}

export function* searchObject(obj: ObjectMap<unknown>, value: string, checkName?: boolean): Generator<[string, unknown], void> {
    const start = value[0] === '*';
    const end = endsWith(value, '*');
    const search =
        start && end
            ? (a: string) => a.includes(value.replace(/^\*/, '').replace(/\*$/, ''))
        : start
            ? (a: string) => endsWith(a, value.replace(/^\*/, ''))
        : end
            ? (a: string) => startsWith(a, value.replace(/\*$/, ''))
            : (a: string) => a === value;
    for (const attr in obj) {
        if (checkName) {
            if (search(attr)) {
                yield [attr, obj[attr]];
            }
        }
        else if (typeof obj[attr] === 'string' && search(obj[attr] as string)) {
            yield [attr, obj[attr]];
        }
    }
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
    const trimCurrent = (cwd: string) => fromEnd && startsWith(cwd, './') ? cwd.substring(2) : cwd;
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

export function parseTask(value: Undef<string>) {
    if (value) {
        const result: TaskAction[] = [];
        for (const item of value.split('+')) {
            const [handler, command] = splitPair(item, ':', true);
            if (handler && command) {
                const [task, preceding] = splitPair(command, ':', true);
                result.push({ handler, task, preceding: preceding === 'true' });
            }
        }
        return result;
    }
}

export function parseWatchInterval(value: Undef<string>) {
    if (value) {
        value = value.trim();
        if (value === 'true') {
            return true;
        }
        const match = /^(~|\d+)\s*(?:::\s*(.+?))?$/.exec(value);
        if (match) {
            let interval: Undef<number>;
            if (match[1] !== '~') {
                interval = +match[1];
            }
            return { interval, expires: match[2] } as WatchInterval;
        }
    }
}