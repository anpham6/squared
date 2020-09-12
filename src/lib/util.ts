import { FILE, STRING } from './regex';

interface XMLTagData {
    tag: string;
    tagName: string;
    value: string;
    closing: boolean;
}

const CACHE_CAMELCASE: StringMap = {};
const CACHE_HYPHENATED: StringMap = {};
const CACHE_UNDERSCORE: StringMap = {};
const CACHE_TRIMBOTH: ObjectMap<RegExp> = {};
const CACHE_TRIMSTRING: ObjectMap<RegExp> = {};
const REGEXP_DECIMAL = new RegExp(`^${STRING.DECIMAL}$`);

export function promisify<T>(fn: FunctionType<any>): FunctionType<Promise<T>> {
    return (...args: any[]) => {
        return new Promise((resolve, reject) => {
            try {
                resolve(fn.call(null, ...args));
            }
            catch (err) {
                reject(err);
            }
        });
    };
}

export function parseMimeType(value: string) {
    switch (fromLastIndexOf(value.trim(), '.').toLowerCase()) {
        case 'aac':
            return 'audio/aac';
        case 'abw':
            return 'application/x-abiword';
        case 'apng':
            return 'image/apng';
        case 'arc':
            return 'application/x-freearc';
        case 'avi':
            return 'video/x-msvideo';
        case 'azw':
            return 'application/vnd.amazon.ebook';
        case 'bin':
            return 'application/octet-stream';
        case 'bmp':
        case 'bmpf':
        case 'bmpp':
            return 'image/bmp';
        case 'bz':
            return 'application/x-bzip';
        case 'bz2':
            return 'application/x-bzip2';
        case 'csh':
            return 'application/x-csh';
        case 'css':
            return 'text/css';
        case 'csv':
            return 'text/csv';
        case 'doc':
            return 'application/msword';
        case 'docx':
            return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
        case 'eot':
        case 'embedded-opentype':
            return 'application/vnd.ms-fontobject';
        case 'epub':
            return 'application/epub+zip';
        case 'flac':
            return 'audio/flac';
        case 'gif':
            return 'image/gif';
        case 'gsm':
            return 'audio/gsm';
        case 'heic':
            return 'image/heic';
        case 'heif':
            return 'image/heif';
        case 'htm':
        case 'html':
            return 'text/html';
        case 'cur':
        case 'ico':
            return 'image/x-icon';
        case 'ics':
            return 'text/calendar';
        case 'jar':
            return 'application/java-archive';
        case 'jpeg':
        case 'jpg':
        case 'jfif':
        case 'pjpeg':
        case 'pjp':
            return 'image/jpeg';
        case 'js':
        case 'mjs':
            return 'text/javascript';
        case 'json':
            return 'application/json';
        case 'jsonp':
            return 'application/javascript';
        case 'jsonld':
            return 'application/ld+json';
        case 'mid':
        case 'midi':
            return 'audio/midi';
        case 'mkv':
            return 'video/x-matroska';
        case 'mp3':
        case 'mpeg':
            return 'audio/mpeg';
        case 'mp4':
            return 'video/mp4';
        case 'mpkg':
            return 'application/vnd.apple.installer+xml';
        case 'odp':
            return 'application/vnd.oasis.opendocument.presentation';
        case 'ods':
            return 'application/vnd.oasis.opendocument.spreadsheet';
        case 'odt':
            return 'application/vnd.oasis.opendocument.text';
        case 'oga':
        case 'spx':
        case 'ogg':
            return 'audio/ogg';
        case 'ogv':
        case 'ogm':
            return 'video/ogg';
        case 'ogx':
            return 'application/ogg';
        case 'otf':
        case 'opentype':
            return 'font/otf';
        case 'png':
            return 'image/png';
        case 'pdf':
            return 'application/pdf';
        case 'ppt':
            return 'application/vnd.ms-powerpoint';
        case 'pptx':
            return 'application/vnd.openxmlformats-officedocument.presentationml.presentation';
        case 'rar':
            return 'application/x-rar-compressed';
        case 'rtf':
            return 'application/rtf';
        case 'sh':
            return 'application/x-sh';
        case 'svg':
            return 'image/svg+xml';
        case 'swf':
            return 'application/x-shockwave-flash';
        case 'tar':
            return 'application/x-tar';
        case 'tif':
        case 'tiff':
            return 'image/tiff';
        case 'ts':
            return 'video/mp2t';
        case 'ttf':
        case 'truetype':
            return 'font/ttf';
        case 'txt':
            return 'text/plain';
        case 'vsd':
            return 'application/vnd.visio';
        case 'vtt':
            return 'text/vtt';
        case 'wav':
            return 'audio/wav';
        case 'weba':
        case 'webm':
            return 'audio/webm';
        case 'webp':
            return 'image/webp';
        case 'woff':
            return 'font/woff';
        case 'woff2':
            return 'font/woff2';
        case 'xhtml':
            return 'application/xhtml+xml';
        case 'xls':
            return 'application/vnd.ms-excel';
        case 'xlsx':
            return 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
        case 'xml':
            return 'application/xml';
        case 'xul':
            return 'application/vnd.mozilla.xul+xml';
        case 'zip':
            return 'application/zip';
        case '3gp':
            return 'video/3gpp';
        case '3g2':
            return 'video/3gpp2';
        case '7z':
            return 'application/x-7z-compressed';
        default:
            return '';
    }
}

export function fromMimeType(value: string) {
    switch (value) {
        case 'audio/aac':
            return 'aac';
        case 'application/x-abiword':
            return 'abw';
        case 'image/apng':
            return 'apng';
        case 'application/x-freearc':
            return 'arc';
        case 'video/x-msvideo':
            return 'avi';
        case 'application/vnd.amazon.ebook':
            return 'azw';
        case 'application/octet-stream':
            return 'bin';
        case 'image/bmp':
        case 'image/x-ms-bmp':
            return 'bmp';
        case 'application/x-bzip':
            return 'bz';
        case 'application/x-bzip2':
            return 'bz2';
        case 'application/x-csh':
            return 'csh';
        case 'text/css':
            return 'css';
        case 'text/csv':
            return 'csv';
        case 'application/msword':
            return 'doc';
        case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
            return 'docx';
        case 'application/vnd.ms-fontobject':
            return 'eot';
        case 'application/epub+zip':
            return 'epub';
        case 'audio/flac':
            return 'flac';
        case 'image/gif':
            return 'gif';
        case 'audio/gsm':
            return 'gsm';
        case 'image/heic':
            return 'heic';
        case 'image/heif':
            return 'heif';
        case 'text/html':
            return 'html';
        case 'image/x-icon':
            return 'ico';
        case 'text/calendar':
            return 'ics';
        case 'application/java-archive':
            return 'jar';
        case 'image/jpeg':
            return 'jpg';
        case 'text/javascript':
            return 'js';
        case 'application/json':
            return 'json';
        case 'application/ld+json':
            return 'jsonld';
        case 'audio/midi':
            return 'mid';
        case 'video/x-matroska':
            return 'mkv';
        case 'audio/mpeg':
            return 'mp3';
        case 'video/mp4':
            return 'mp4';
        case 'application/vnd.apple.installer+xml':
            return 'mpkg';
        case 'application/vnd.oasis.opendocument.presentation':
            return 'odp';
        case 'application/vnd.oasis.opendocument.spreadsheet':
            return 'ods';
        case 'application/vnd.oasis.opendocument.text':
            return 'odt';
        case 'audio/ogg':
            return 'ogg';
        case 'video/ogg':
            return 'ogv';
        case 'application/ogg':
            return 'ogx';
        case 'font/otf':
            return 'otf';
        case 'image/png':
            return 'png';
        case 'application/pdf':
            return 'pdf';
        case 'application/vnd.ms-powerpoint':
            return 'ppt';
        case 'application/vnd.openxmlformats-officedocument.presentationml.presentation':
            return 'pptx';
        case 'application/x-rar-compressed':
            return 'rar';
        case 'application/rtf':
            return 'rtf';
        case 'application/x-sh':
            return 'sh';
        case 'image/svg+xml':
            return 'svg';
        case 'application/x-shockwave-flash':
            return 'swf';
        case 'application/x-tar':
            return 'tar';
        case 'image/tiff':
            return 'tif';
        case 'video/mp2t':
            return 'ts';
        case 'font/ttf':
            return 'ttf';
        case 'text/plain':
            return 'txt';
        case 'application/vnd.visio':
            return 'vsd';
        case 'text/vtt':
            return 'vtt';
        case 'audio/wav':
            return 'wav';
        case 'audio/webm':
            return 'video/webm';
        case 'image/webp':
            return 'webp';
        case 'font/woff':
            return 'woff';
        case 'font/woff2':
            return 'woff2';
        case 'application/xhtml+xml':
            return 'xhtml';
        case 'application/vnd.ms-excel':
            return 'xls';
        case 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet':
            return 'xlsx';
        case 'text/xml':
            return 'xml';
        case 'application/vnd.mozilla.xul+xml':
            return 'xul';
        case 'application/zip':
            return 'zip';
        case 'video/3gpp':
            return '3gp';
        case 'video/3gpp2':
            return '3g2';
        case 'application/x-7z-compressed':
            return '7z';
        default:
            return '';
    }
}

export function formatXml(value: string, closeEmpty?: boolean, startIndent = -1, char = '\t') {
    const lines: XMLTagData[] = [];
    const pattern = /\s*(<(\/)?([?\w]+)[^>]*>)\n?([^<]*)/g;
    let output = '',
        indent = startIndent,
        ignoreIndent: Undef<boolean>,
        match: Null<RegExpExecArray>;
    while (match = pattern.exec(value)) {
        lines.push({
            tag: match[1],
            closing: !!match[2],
            tagName: match[3],
            value: match[4]
        });
    }
    for (let i = 0, length = lines.length; i < length; ++i) {
        const line = lines[i];
        let previous = indent;
        if (i > 0) {
            let single: Undef<boolean>;
            if (line.closing) {
                --indent;
            }
            else {
                const next = lines[i + 1];
                single = next.closing && line.tagName === next.tagName;
                if (!/\/>\n*$/.exec(line.tag)) {
                    if (closeEmpty && !isString(line.value)) {
                        if (next && next.closing && next.tagName === line.tagName) {
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
            for (let j = 0, q = tags.length; j < q; ++j) {
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

export function hasKeys(obj: PlainObject) {
    for (const attr in obj) {
        return obj[attr] !== undefined;
    }
    return false;
}

export function capitalize(value: string, upper?: boolean) {
    return upper === false ? value[0].toLowerCase() + value.substring(1) : value[0].toUpperCase() + value.substring(1).toLowerCase();
}

export function convertHyphenated(value: string, char = '-') {
    switch (char) {
        case '-': {
            const cacheData = CACHE_HYPHENATED[value];
            if (cacheData) {
                return cacheData;
            }
            break;
        }
        case '_': {
            const cacheData = CACHE_UNDERSCORE[value];
            if (cacheData) {
                return cacheData;
            }
            break;
        }
    }
    let result = value[0].toLowerCase(),
        lower = true;
    for (let i = 1, length = value.length; i < length; ++i) {
        const ch = value[i];
        const upper = ch === ch.toUpperCase();
        result += lower && upper && ch !== char ? char + ch.toLowerCase() : ch;
        lower = !upper;
    }
    switch (char) {
        case '-':
            CACHE_HYPHENATED[value] = result;
            break;
        case '_':
            CACHE_UNDERSCORE[value] = result;
            break;
    }
    return result;
}

export function convertCamelCase(value: string, char = '-') {
    let i = value.indexOf(char);
    if (i === -1) {
        return value;
    }
    const cacheData = CACHE_CAMELCASE[value];
    if (cacheData) {
        return cacheData;
    }
    let result = value.substring(0, i),
        previous = '';
    const length = value.length;
    while (i < length) {
        const ch = value[i++];
        if (ch !== char) {
            result += previous === char ? ch.toUpperCase() : ch;
        }
        previous = ch;
    }
    CACHE_CAMELCASE[value] = result;
    return result;
}

export function convertWord(value: string, dash?: boolean) {
    return value.replace(dash ? /[^A-Za-z\d]+/g : /[^\w]+/g, '_');
}

export function convertInt(value: string, fallback = 0) {
    const result = parseInt(value);
    return !isNaN(result) ? result : fallback;
}

export function convertFloat(value: string, fallback = 0) {
    const result = parseFloat(value);
    return !isNaN(result) ? result : fallback;
}

export function delimitString(options: DelimitStringOptions, ...appending: string[]) {
    const { value, not, remove, sort } = options;
    const length = appending.length;
    if (length === 1 && !value) {
        return appending[0];
    }
    const delimiter = options.delimiter || ', ';
    const values = value !== '' ? value.split(delimiter) : [];
    for (let i = 0; i < length; ++i) {
        const append = appending[i];
        if (append !== '') {
            if (not && values.includes(not[i])) {
                continue;
            }
            const index = values.findIndex(item => item === append);
            if (index === -1) {
                values.push(append);
            }
            else if (remove) {
                values.splice(index, 1);
            }
        }
    }
    if (sort) {
        values.sort(typeof sort === 'function' ? sort : undefined);
    }
    return values.join(delimiter);
}

export function spliceString(value: string, index: number, length: number) {
    return index === 0 ? value.substring(length) : value.substring(0, index) + value.substring(index + length);
}

export function splitPair(value: string, char: string, trim?: boolean): [string, string] {
    const index = value.indexOf(char);
    if (index !== -1) {
        const start = value.substring(0, index);
        const end = value.substring(index + char.length);
        return !trim ? [start, end] : [start.trim(), end.trim()];
    }
    return !trim ? [value, ''] : [value.trim(), ''];
}

export function splitPairStart(value: string, char: string, trim?: boolean) {
    const index = value.indexOf(char);
    const result = index !== -1 ? value.substring(0, index) : value;
    return !trim ? result : result.trim();
}

export function splitPairEnd(value: string, char: string, trim?: boolean) {
    const index = value.indexOf(char);
    if (index !== -1) {
        const result = value.substring(index + char.length);
        return !trim ? result : result.trim();
    }
    return '';
}

export function splitEnclosing(value: string, prefix?: string, separator = '', opening = '(', closing = ')') {
    if (separator.length > 1) {
        return [];
    }
    if (!prefix) {
        prefix = opening;
    }
    const prefixed = prefix !== opening;
    const combined = prefixed ? prefix + opening : opening;
    const result: string[] = [];
    const appendValues = (segment: string) => {
        for (let seg of segment.split(separator)) {
            seg = seg.trim();
            if (seg !== '') {
                result.push(seg);
            }
        }
    };
    let position = 0,
        index = -1;
    const length = value.length;
    while ((index = value.indexOf(combined, position)) !== -1) {
        let preceding = '';
        if (index !== position) {
            let segment = value.substring(position, index);
            if (separator) {
                segment = segment.trim();
                if (segment !== '') {
                    appendValues(segment);
                    if (!prefixed) {
                        const joined = lastItemOf(result);
                        if (joined && value.substring(index - joined.length, index + 1) === joined + prefix) {
                            preceding = joined;
                            --result.length;
                        }
                    }
                }
            }
            else {
                result.push(segment);
            }
        }
        let found: Undef<boolean>;
        for (let i = index + (prefixed ? prefix.length : 0) + 1, open = 1, close = 0; i < length; ++i) {
            switch (value[i]) {
                case opening:
                    ++open;
                    break;
                case closing:
                    ++close;
                    break;
            }
            if (open === close) {
                if (separator) {
                    for ( ; i < length; ++i) {
                        if (value[i] === separator) {
                            break;
                        }
                    }
                    position = i + 1;
                    result.push(preceding + value.substring(index, i).trim());
                }
                else {
                    position = i + 1;
                    result.push(value.substring(index, position));
                }
                if (position === length) {
                    return result;
                }
                found = true;
                break;
            }
        }
        if (!found) {
            return [];
        }
    }
    if (position < length) {
        const excess = value.substring(position);
        if (separator) {
            const segment = excess.trim();
            if (segment !== '') {
                appendValues(segment);
            }
        }
        else {
            result.push(excess);
        }
    }
    return result;
}

export function lastItemOf<T>(value: ArrayLike<T>): Undef<T> {
    return value[value.length - 1];
}

export function lastItemEquals<T>(value: ArrayLike<T>, compareTo: T) {
    return value[value.length - 1] === compareTo;
}

export function hasBit(value: number, offset: number) {
    return (value & offset) === offset;
}

export function isNumber(value: string) {
    return REGEXP_DECIMAL.test(value);
}

export function isString(value: any): value is string {
    return typeof value === 'string' && !isEmptyString(value);
}

export function isArray<T>(value: any): value is Array<T> {
    return Array.isArray(value) && value.length > 0;
}

export function isObject<T = PlainObject>(value: any): value is T {
    return typeof value === 'object' && value !== null;
}

export function isPlainObject<T = PlainObject>(value: any): value is T {
    return isObject(value) && (value.constructor === Object || Object.getPrototypeOf(Object(value)) === null);
}

export function isEmptyString(value: string) {
    for (let i = 0, length = value.length; i < length; ++i) {
        switch (value.charCodeAt(i)) {
            case 32:
            case 9:
            case 10:
            case 11:
            case 13:
                continue;
            default:
                return false;
        }
    }
    return true;
}

export function isEqual(source: any, other: any) {
    if (source === other) {
        return true;
    }
    else if (Array.isArray(source) && Array.isArray(other)) {
        const length = source.length;
        if (length === other.length) {
            for (let i = 0; i < length; ++i) {
                if (source[i] !== other[i]) {
                    return false;
                }
            }
            return true;
        }
    }
    else if (isPlainObject(source) && isPlainObject(other)) {
        if (Object.keys(source).length === Object.keys(other).length) {
            for (const attr in source) {
                const a = source[attr];
                const b = other[attr];
                if (a !== b) {
                    if (isPlainObject(a) && isPlainObject(b) && isEqual(a, b)) {
                        continue;
                    }
                    return false;
                }
            }
            return true;
        }
    }
    return false;
}

export function includes(source: Undef<string>, value: string, delimiter = ',') {
    if (source) {
        for (const name of source.split(delimiter)) {
            if (name.trim() === value) {
                return true;
            }
        }
    }
    return false;
}

export function cloneInstance<T>(value: T) {
    return Object.assign(Object.create(Object.getPrototypeOf(value)), value) as T;
}

export function cloneObject<T>(data: T, options?: CloneObjectOptions<T>) {
    let target: Undef<PlainObject | any[]>,
        deep: Undef<boolean>;
    if (options) {
        ({ target, deep } = options);
    }
    const nested = deep ? { deep } : undefined;
    if (Array.isArray(data)) {
        if (!target || !Array.isArray(target)) {
            target = [];
        }
        for (let i = 0, length = data.length; i < length; ++i) {
            const value = data[i];
            if (Array.isArray(value)) {
                target.push(cloneObject(value, nested));
            }
            else if (deep && isPlainObject(value)) {
                target.push(cloneObject(value, nested));
            }
            else {
                target.push(value);
            }
        }
    }
    else if (isObject(data)) {
        if (!target || !isObject(target)) {
            target = {};
        }
        for (const attr in data) {
            const value = data[attr];
            if (Array.isArray(value)) {
                target[attr] = deep ? cloneObject(value, nested) : value;
            }
            else if (isPlainObject(value)) {
                target[attr] = cloneObject(value, nested);
            }
            else {
                target[attr] = value;
            }
        }
    }
    return target as T extends [] ? T[] : PlainObject;
}

export function resolvePath(value: string, href?: string) {
    value = value.trim();
    if (value !== '' && !FILE.PROTOCOL.test(value)) {
        const pathname = (href ? href.replace(location.origin, '') : location.pathname).replace(/\\/g, '/').split('/');
        --pathname.length;
        value = value.replace(/\\/g, '/');
        if (value[0] === '/') {
            return location.origin + value;
        }
        else if (value.startsWith('../')) {
            const trailing: string[] = [];
            for (const dir of value.split('/')) {
                if (dir === '..') {
                    if (trailing.length === 0) {
                        pathname.pop();
                    }
                    else {
                        --trailing.length;
                    }
                }
                else {
                    trailing.push(dir);
                }
            }
            value = trailing.join('/');
        }
        else if (value.startsWith('./')) {
            value = value.substring(2);
        }
        return `${location.origin + pathname.join('/')}/${value}`;
    }
    return value;
}

export function trimBoth(value: string, pattern: string) {
    const match = (CACHE_TRIMBOTH[pattern] || (CACHE_TRIMBOTH[pattern] = new RegExp(`^(${pattern})+([\\s\\S]*?)\\1$`))).exec(value);
    return match ? match[2] : value;
}

export function trimString(value: string, pattern: string) {
    const match = (CACHE_TRIMSTRING[pattern] || (CACHE_TRIMSTRING[pattern] = new RegExp(`^(?:${pattern})*([\\s\\S]*?)(?:${pattern})*$`))).exec(value);
    return match ? match[1] : value;
}

export function trimStart(value: string, pattern: string) {
    return value.replace(new RegExp(`^(${pattern})+`), '');
}

export function trimEnd(value: string, pattern: string) {
    return value.replace(new RegExp(`(${pattern})+$`), '');
}

export function fromLastIndexOf(value: string, ...char: string[]) {
    let i = 0;
    while (i < char.length) {
        const index = value.lastIndexOf(char[i++]);
        if (index !== -1) {
            return value.substring(index + 1);
        }
    }
    return value;
}

export function partitionLastIndexOf(value: string, ...char: string[]): [string, string] {
    let i = 0;
    while (i < char.length) {
        const index = value.lastIndexOf(char[i++]);
        if (index !== -1) {
            return [value.substring(0, index), value.substring(index + 1)];
        }
    }
    return ['', value];
}

export function* searchObject(obj: StringMap, value: string) {
    const start = value[0] === '*';
    const end = lastItemEquals(value, '*');
    const search =
        start && end
            ? (a: string) => a.includes(value.replace(/^\*/, '').replace(/\*$/, ''))
        : start
            ? (a: string) => a.endsWith(value.replace(/^\*/, ''))
        : end
            ? (a: string) => a.startsWith(value.replace(/\*$/, ''))
            : (a: string) => a === value;
    for (const attr in obj) {
        if (search(attr)) {
            yield attr;
        }
    }
}

export function hasValue<T>(value: any): value is T {
    return value !== undefined && value !== null && value !== '';
}

export function withinRange(a: number, b: number, offset = 1) {
    return b >= (a - offset) && b <= (a + offset);
}

export function assignEmptyProperty(dest: PlainObject, source: PlainObject) {
    for (const attr in source) {
        if (!Object.prototype.hasOwnProperty.call(dest, attr)) {
            dest[attr] = source[attr];
        }
    }
    return dest;
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

export function sortNumber(values: number[], ascending = true) {
    return ascending ? values.sort((a, b) => a - b) : values.sort((a, b) => b - a);
}

export function findSet<T>(list: Set<T>, predicate: IteratorPredicate<T, boolean, Set<T>>) {
    let i = 0;
    for (const item of list) {
        if (predicate(item, i++, list)) {
            return item;
        }
    }
}

export function sortByArray<T = unknown>(list: T[], ...attrs: (string | boolean)[]) {
    let length = attrs.length,
        ascending = attrs[length - 1];
    if (typeof ascending === 'boolean') {
        length = --attrs.length;
    }
    else {
        ascending = true;
    }
    return list.sort((a, b) => {
        let valueA = a,
            valueB = b;
        for (let i = 0; i < length; ++i) {
            const attr = attrs[i];
            if (typeof attr !== 'string') {
                continue;
            }
            for (const name of attr.split('.')) {
                const vA = valueA[name];
                const vB = valueB[name];
                const oA = vA !== undefined && vA !== null;
                const oB = vB !== undefined && vB !== null;
                if (oA && oB) {
                    valueA = vA;
                    valueB = vB;
                }
                else if (!oA && !oB) {
                    return 0;
                }
                else if (oA) {
                    return ascending ? -1 : 1;
                }
                else {
                    return ascending ? 1 : -1;
                }
            }
        }
        if (valueA !== valueB && typeof valueA !== 'object' && typeof valueB !== 'object') {
            if (ascending) {
                return valueA < valueB ? -1 : 1;
            }
            else {
                return valueA > valueB ? -1 : 1;
            }
        }
        return 0;
    });
}

export function flatArray<T>(list: T[], depth = 1, current = 0): T[] {
    let result: T[] = [];
    for (let i = 0, length = list.length; i < length; ++i) {
        const item = list[i];
        if (current < depth && Array.isArray(item)) {
            if (item.length) {
                result = result.concat(flatArray<T>(item, depth, current + 1));
            }
        }
        else if (item !== undefined && item !== null) {
            result.push(item);
        }
    }
    return result;
}

export function spliceArray<T>(list: T[], predicate: IteratorPredicate<T, boolean>, callback?: IteratorPredicate<T, void>, deleteCount?: number) {
    let deleted = 0;
    for (let i = 0; i < list.length; ++i) {
        const item = list[i];
        if (predicate(item, i, list)) {
            if (callback) {
                callback(item, i, list);
            }
            list.splice(i--, 1);
            if (++deleted === deleteCount) {
                break;
            }
        }
    }
    return list;
}

export function partitionArray<T>(list: ArrayLike<T>, predicate: IteratorPredicate<T, boolean>): [T[], T[]] {
    const length = list.length;
    const valid: T[] = new Array(length);
    const invalid: T[] = new Array(length);
    let j = 0, k = 0;
    for (let i = 0; i < length; ++i) {
        const item = list[i];
        if (predicate(item, i, list)) {
            valid[j++] = item;
        }
        else {
            invalid[k++] = item;
        }
    }
    valid.length = j;
    invalid.length = k;
    return [valid, invalid];
}

export function sameArray<T, U = unknown>(list: ArrayLike<T>, predicate: IteratorPredicate<T, U>) {
    const length = list.length;
    if (length) {
        let baseValue!: U;
        for (let i = 0; i < length; ++i) {
            const value = predicate(list[i], i, list);
            if (i === 0) {
                baseValue = value;
            }
            else if (value !== baseValue) {
                return false;
            }
        }
        return true;
    }
    return false;
}

export function joinArray<T>(list: ArrayLike<T>, predicate: IteratorPredicate<T, string>, char = ''): string {
    let result = '';
    for (let i = 0, length = list.length; i < length; ++i) {
        const value = predicate(list[i], i, list);
        if (value !== '') {
            result += (result !== '' ? char : '') + value;
        }
    }
    return result;
}

export function iterateArray<T>(list: ArrayLike<T>, predicate: IteratorPredicate<T, void | boolean>, start = 0, end = Infinity) {
    for (let i = Math.max(start, 0), length = Math.min(list.length, end); i < length; ++i) {
        const result = predicate(list[i], i, list);
        if (result === true) {
            return Infinity;
        }
    }
    return length;
}

export function iterateReverseArray<T>(list: ArrayLike<T>, predicate: IteratorPredicate<T, void | boolean>, start = 0, end = Infinity) {
    start = Math.max(start, 0);
    for (let i = Math.min(list.length, end) - 1; i >= start; --i) {
        const result = predicate(list[i], i, list);
        if (result === true) {
            return Infinity;
        }
    }
    return length;
}

export function replaceMap<T, U>(list: (T | U)[], predicate: IteratorPredicate<T, U>) {
    for (let i = 0, length = list.length; i < length; ++i) {
        list[i] = predicate(list[i] as T, i, list as T[]);
    }
    return list as U[];
}

export function plainMap<T, U>(list: ArrayLike<T>, predicate: IteratorPredicate<T, U>): U[] {
    const length = list.length;
    const result: U[] = new Array(length);
    for (let i = 0; i < length; ++i) {
        result[i] = predicate(list[i], i, list);
    }
    return result;
}