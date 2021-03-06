import { DOM } from './regex';

const { endsWith, escapePattern, hasValue, isObject, replaceAll, splitPair, splitPairEnd, splitPairStart, startsWith, trimEnclosing } = squared.lib.util;

class GlobExp extends RegExp implements IGlobExp {
    constructor(source: string, flags: string, public negate: boolean) {
        super(source, flags);
    }

    test(value: string) {
        const result = super.test(...(arguments as unknown) as [string]);
        return this.negate ? !result : result;
    }
    filter(values: string[]) {
        return values.filter(value => this.test(value));
    }
}

const EXT_DATA = {
    '3gp': 'video/3gpp',
    '3g2': 'video/3gpp2',
    '7z': 'application/x-7z-compressed',
    aac: 'audio/aac',
    abw: 'application/x-abiword',
    apng: 'image/apng',
    arc: 'application/x-freearc',
    asf: 'video/x-ms-asf',
    asx: 'video/x-ms-asf',
    atom: 'application/atom+xml',
    avi: 'video/x-msvideo',
    avif: 'image/avif',
    azw: 'application/vnd.amazon.ebook',
    bin: 'application/octet-stream',
    bmp: 'image/bmp',
    bmpf: 'image/bmp',
    bmpp: 'image/bmp',
    bz: 'application/x-bzip',
    bz2: 'application/x-bzip2',
    cgi: 'application/x-httpd-cgi',
    csh: 'application/x-csh',
    css: 'text/css',
    csv: 'text/csv',
    doc: 'application/msword',
    docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    eot: 'application/vnd.ms-fontobject',
    epub: 'application/epub+zip',
    flac: 'audio/flac',
    flv: 'video/x-flv',
    gif: 'image/gif',
    gsm: 'audio/gsm',
    h264: 'h264',
    heic: 'image/heic',
    heif: 'image/heif',
    htc: 'text/x-component',
    htm: 'text/html',
    html: 'text/html',
    shtml: 'text/html',
    cur: 'image/x-icon',
    ico: 'image/x-icon',
    ics: 'text/calendar',
    jad: 'text/vnd.sun.j2me.app-descriptor',
    jar: 'application/java-archive',
    java: 'text/x-java-source',
    jpeg: 'image/jpeg',
    jpg: 'image/jpeg',
    jfif: 'image/jpeg',
    pjpeg: 'image/jpeg',
    pjp: 'image/jpeg',
    jpeg2000: 'video/jpeg2000',
    js: 'text/javascript',
    mjs: 'application/javascript',
    json: 'application/json',
    jsonp: 'application/javascript',
    jsonld: 'application/ld+json',
    m3u8: 'application/vnd.apple.mpegurl',
    md: 'text/markdown',
    kar: 'audio/midi',
    mid: 'audio/midi',
    midi: 'audio/midi',
    mks: 'video/x-matroska',
    mkv: 'video/x-matroska',
    mk3d: 'video/x-matroska',
    mml: 'text/mathml',
    mng: 'video/x-mng',
    mov: 'video/quicktime',
    mp3: 'audio/mpeg',
    mpeg: 'audio/mpeg',
    mp4: 'video/mp4',
    m4a: 'video/mp4',
    m4v: 'video/x-m4v',
    mpd: 'application/dash+xml',
    mpkg: 'application/vnd.apple.installer+xml',
    odg: 'application/vnd.oasis.opendocument.graphics',
    odp: 'application/vnd.oasis.opendocument.presentation',
    ods: 'application/vnd.oasis.opendocument.spreadsheet',
    odt: 'application/vnd.oasis.opendocument.text',
    oga: 'audio/ogg',
    spx: 'audio/ogg',
    ogg: 'audio/ogg',
    ogv: 'video/ogg',
    ogm: 'video/ogg',
    ogx: 'application/ogg',
    otf: 'font/otf',
    pl: 'application/x-perl',
    png: 'image/png',
    pdf: 'application/pdf',
    ppt: 'application/vnd.ms-powerpoint',
    pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    ps: 'application/postscript',
    ra: 'audio/x-realaudio',
    rar: 'application/x-rar-compressed',
    rss: 'application/rss+xml',
    rtf: 'application/rtf',
    sgml: 'text/sgml',
    sh: 'application/x-sh',
    svg: 'image/svg+xml',
    svgz: 'image/svg+xml',
    swf: 'application/x-shockwave-flash',
    tar: 'application/x-tar',
    tif: 'image/tiff',
    tiff: 'image/tiff',
    ts: 'video/mp2t',
    tsv: 'text/tab-separated-values',
    ttf: 'font/ttf',
    truetype: 'font/ttf',
    txt: 'text/plain',
    vsd: 'application/vnd.visio',
    vtt: 'text/vtt',
    wav: 'audio/wave',
    wbmp: 'image/vnd.wap.wbmp',
    weba: 'audio/webm',
    webm: 'video/webm',
    webp: 'image/webp',
    woff: 'font/woff',
    woff2: 'font/woff2',
    xhtml: 'application/xhtml+xml',
    xls: 'application/vnd.ms-excel',
    xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    xml: 'application/xml',
    xul: 'application/vnd.mozilla.xul+xml',
    wml: 'text/vnd.wap.wml',
    wmv: 'video/x-ms-wmv',
    yaml: 'text/yaml',
    yml: 'text/yaml',
    zip: 'application/zip'
};

const CACHE_UUID: ObjectMap<RegExpMatchArray> = {};

export function fromMimeType(value: string) {
    const [type, name] = splitPair(value, '/');
    switch (type) {
        case 'image':
            switch (name) {
                case 'apng':
                case 'avif':
                case 'bmp':
                case 'heic':
                case 'heif':
                case 'gif':
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
                case 'gsm':
                case 'ogg':
                case 'wav':
                case 'webm':
                    return name;
                case 'midi':
                    return 'mid';
                case 'mpeg':
                    return 'mp3';
                case 'x-matroska':
                    return 'mka';
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

export function parseMimeType(value: string) {
    return EXT_DATA[splitPairEnd(splitPairStart(value = value.toLowerCase(), '?'), '.', true, true) || value] as string || '';
}

export function getComponentEnd(value: string, leading = '?', trailing = '/') {
    return splitPairEnd(splitPairStart(value, leading), trailing, false, true);
}

export function appendSeparator(preceding = '', value = '', separator = '/') {
    preceding = preceding.trim();
    value = value.trim();
    switch (separator) {
        case '\\':
            preceding &&= replaceAll(preceding, '/', '\\');
            value &&= replaceAll(value, '/', '\\');
            break;
        case '/':
            preceding &&= replaceAll(preceding, '\\', '/');
            value &&= replaceAll(value, '\\', '/');
            break;
    }
    return preceding + (preceding && value && !endsWith(preceding, separator) && !startsWith(value, separator) ? separator : '') + value;
}

export function assignEmptyValue(dest: PlainObject, ...attrs: string[]) {
    const length = attrs.length;
    if (length > 1) {
        let current = dest,
            i = 0;
        do {
            const name = attrs[i];
            const value = current[name];
            if (i === length - 2) {
                if (!hasValue(value)) {
                    current[name] = attrs[i + 1];
                }
                break;
            }
            else if (name) {
                if (value === undefined || value === null) {
                    current = {};
                    current[name] = current;
                }
                else if (isObject(value)) {
                    current = value;
                }
                else {
                    break;
                }
            }
            else {
                break;
            }
        }
        while (++i);
    }
}

export function generateUUID(format = '8-4-4-4-12', dictionary = '0123456789abcdef') {
    return (CACHE_UUID[format] || format.match(/(\d+|[^\d]+)/g)!).reduce((a, b) => {
        const length = +b;
        if (!isNaN(length)) {
            for (let i = 0, j = dictionary.length; i < length; ++i) {
                a += dictionary[Math.floor(Math.random() * j)];
            }
            return a;
        }
        return a + b;
    }, '');
}

export function upperCaseString(value: string) {
    const pattern = /\b([a-z])/g;
    let result: Undef<string[]>,
        match: Null<RegExpExecArray>;
    while (match = pattern.exec(value)) {
        (result ||= value.split(''))[match.index] = match[1][0].toUpperCase();
    }
    return result ? result.join('') : value;
}

export function lowerCaseString(value: string) {
    const entities = DOM.ENTITY_G.exec(value);
    return entities ? value.split(DOM.ENTITY_G).reduce((a, b, index) => a + b.toLowerCase() + (entities[index] || ''), '') : value.toLowerCase();
}

export function* searchObject(obj: ObjectMap<unknown>, value: string, checkName?: boolean): Generator<[string, unknown], void> {
    const start = value[0] === '*';
    const end = endsWith(value, '*');
    const search =
        start && end
            ? (a: string) => a.indexOf(value.replace(/^\*/, '').replace(/\*$/, '')) !== -1
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

export function trimBoth(value: string, char = '"', trim?: boolean) {
    if (trim) {
        value = value.trim();
    }
    const length = value.length;
    return value[0] === char && value[length - 1] === char ? trimEnclosing(value) : value;
}

export function trimString(value: string, pattern: string) {
    if (pattern.length === 1) {
        return trimEnd(trimStart(value, pattern), pattern);
    }
    const match = new RegExp(`^(?:${pattern = escapePattern(pattern)})*([\\s\\S]*?)(?:${pattern})*$`).exec(value);
    return match ? match[1] : value;
}

export function trimStart(value: string, pattern: string) {
    if (pattern.length === 1) {
        for (let i = 0, length = value.length; i < length; ++i) {
            if (value[i] !== pattern) {
                if (i > 0) {
                    return value.substring(i);
                }
                break;
            }
        }
        return value;
    }
    const match = new RegExp(`^(?:${escapePattern(pattern)})+`).exec(value);
    return match ? value.substring(match[0].length) : value;
}

export function trimEnd(value: string, pattern: string) {
    if (pattern.length === 1) {
        for (let i = value.length - 1, j = 0; i >= 0; --i, ++j) {
            if (value[i] !== pattern) {
                if (j > 0) {
                    return value.substring(0, value.length - j);
                }
                break;
            }
        }
        return value;
    }
    const match = new RegExp(`(?:${escapePattern(pattern)})+$`).exec(value);
    return match ? value.substring(0, value.length - match[0].length) : value;
}

export function flatArray<T>(list: unknown[], depth = 1, current = 0): T[] {
    const result: T[] = [];
    for (let i = 0, length = list.length; i < length; ++i) {
        const item = list[i];
        if (current < depth && Array.isArray(item)) {
            if (item.length) {
                result.push(...flatArray<T>(item, depth, current + 1));
            }
        }
        else if (item !== undefined && item !== null) {
            result.push(item as T);
        }
    }
    return result;
}

export function parseGlob(value: string, options?: ParseGlobOptions) {
    let flags = '',
        fromEnd: Undef<boolean>;
    if (options) {
        if (options.ignoreCase) {
            flags += 'i';
        }
        fromEnd = options.fromEnd;
    }
    const trimCurrent = (cwd: string) => fromEnd && startsWith(cwd, './') ? cwd.substring(2) : cwd;
    return new GlobExp(
        ((!fromEnd ? '^' : '') + trimCurrent(value = value.trim()))
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
            }
            return match[0];
        })
        .replace(/\?(?!!)/g, '[^/]')
        .replace(/\*/g, '(?:[^/]*?|[^/]*/$)')
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
            }
            return '\\\\' + String.fromCharCode(+match[1]);
        }) + '$', flags, value[0] === '!') as IGlobExp;
}