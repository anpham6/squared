import { CHAR, COMPONENT, UNIT, XML } from './regex';

const UUID_ALPHA = '0123456789abcdef';
const UUID_SEGMENT = [8, 4, 4, 4, 12];
const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const NUMERALS = [
    '', 'C', 'CC', 'CCC', 'CD', 'D', 'DC', 'DCC', 'DCCC', 'CM',
    '', 'X', 'XX', 'XXX', 'XL', 'L', 'LX', 'LXX', 'LXXX', 'XC',
    '', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX'
];
const CACHE_CAMELCASE: StringMap = {};
const CACHE_UNDERSCORE: StringMap = {};

export function promisify<T = unknown>(fn: FunctionType<any>): FunctionType<Promise<T>> {
    return (...args: any[]) => {
        return new Promise((resolve, reject) => {
            try {
                const result: T = fn.call(null, ...args);
                resolve(result);
            }
            catch (err) {
                reject(err);
            }
        });
    };
}

export function hasMimeType(formats: MIMEOrAll, value: string) {
    return formats === '*' || formats.includes(parseMimeType(value));
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

export function hasKeys(obj: {}) {
    for (const attr in obj) {
        return obj[attr] !== undefined;
    }
    return false;
}

export function capitalize(value: string, upper?: boolean) {
    return upper === false ? value.charAt(0).toLowerCase() + value.substring(1) : value.charAt(0).toUpperCase() + value.substring(1).toLowerCase();
}

export function capitalizeString(value: string) {
    XML.BREAKWORD_G.lastIndex = 0;
    const result = value.split('');
    let match: Null<RegExpMatchArray>;
    while ((match = XML.BREAKWORD_G.exec(value)) !== null) {
        const index = match.index;
        if (index !== undefined) {
            result[index] = match[1].charAt(0).toUpperCase();
        }
    }
    return result.join('');
}

export function lowerCaseString(value: string) {
    XML.BREAKWORD_G.lastIndex = 0;
    let result = value;
    let match: Null<RegExpMatchArray>;
    while ((match = XML.BREAKWORD_G.exec(value)) !== null) {
        const index = match.index;
        if (index !== undefined) {
            const word = match[1];
            if (!XML.ENTITY.test(word)) {
                const start = index + word.length;
                result = (index > 0 ? result.substring(0, match.index) : '') + value.substring(index, start).toLowerCase() + result.substring(start);
            }
        }
    }
    return result;
}

export function spliceString(value: string, index: number, length: number) {
    return index === 0 ? value.substring(length) : value.substring(0, index) + value.substring(index + length);
}

export function convertUnderscore(value: string) {
    const cacheData = CACHE_UNDERSCORE[value];
    if (cacheData) {
        return cacheData;
    }
    let result = value[0].toLowerCase();
    let lower = true;
    const length = value.length;
    let i = 1;
    while (i < length) {
        const ch = value.charAt(i++);
        const upper = ch === ch.toUpperCase();
        if (lower && upper && ch !== '_') {
            result += '_' + ch.toLowerCase();
        }
        else {
            result += ch;
        }
        lower = !upper;
    }
    CACHE_UNDERSCORE[value] = result;
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
    let result = value.substring(0, i);
    let previous = '';
    const length = value.length;
    while (i < length) {
        const ch = value.charAt(i++);
        if (ch !== char) {
            if (previous === char) {
                result += ch.toUpperCase();
            }
            else {
                result += ch;
            }
        }
        previous = ch;
    }
    CACHE_CAMELCASE[value] = result;
    return result;
}

export function convertWord(value: string, dash?: boolean) {
    let result = '';
    const pattern = dash ? CHAR.WORDDASH : CHAR.WORD;
    const length = value.length;
    let i = 0;
    while (i < length) {
        const ch = value.charAt(i++);
        result += pattern.test(ch) ? ch : '_';
    }
    return result;
}

export function convertInt(value: string) {
    return parseInt(value) || 0;
}

export function convertFloat(value: string) {
    return parseFloat(value) || 0;
}

export function convertAlpha(value: number) {
    if (value >= 0) {
        let result = '';
        const length = ALPHABET.length;
        while (value >= length) {
            const base = Math.floor(value / length);
            if (base > 1 && base <= length) {
                result += ALPHABET.charAt(base - 1);
                value -= base * length;
            }
            else if (base > 0) {
                result += 'Z';
                value -= Math.pow(length, 2);
                result += convertAlpha(value);
                return result;
            }
            const index = value % length;
            result += ALPHABET.charAt(index);
            value -= index + length;
        }
        return ALPHABET.charAt(value) + result;
    }
    return value.toString();
}

export function convertRoman(value: number) {
    const digits = value.toString().split('');
    let result = '';
    let i = 3;
    while (i--) {
        result = (NUMERALS[parseInt(digits.pop() as string) + (i * 10)] || '') + result;
    }
    return 'M'.repeat(parseInt(digits.join(''))) + result;
}

export function convertEnum(value: number, source: {}, derived: {}): string {
    for (const key of Object.keys(source)) {
        if (value === source[key]) {
            return derived[key];
        }
    }
    return '';
}

export function randomUUID(separator = '-') {
    let result = '';
    for (let i = 0; i < 5; ++i) {
        if (i > 0) {
            result += separator;
        }
        const length = UUID_SEGMENT[i];
        for (let j = 0; j < length; ++j) {
            result += UUID_ALPHA.charAt(Math.floor(Math.random() * 16));
        }
    }
    return result;
}

export function formatString(value: string, ...params: string[]) {
    const length = params.length;
    let i = 0;
    while (i < length) {
        value = value.replace(`{${i}}`, params[i++]);
    }
    return value;
}

export function delimitString(options: DelimitStringOptions, ...appending: string[]) {
    const value = options.value;
    if (!value && appending.length === 1) {
        return appending[0];
    }
    const delimiter = options.delimiter || '|';
    const not = options.not || [];
    const remove = options.remove || false;
    const values = value !== '' ? value.split(delimiter) : [];
    for (let i = 0; i < appending.length; ++i) {
        const append = appending[i];
        if (append !== '') {
            if (values.includes(not[i])) {
                continue;
            }
            const index = values.findIndex(a => a === append);
            if (index === -1) {
                values.push(append);
            }
            else if (remove) {
                values.splice(index, 1);
            }
        }
    }
    if (options.sort) {
        values.sort();
    }
    return values.join(delimiter);
}

export function splitEnclosing(value: string, prefix?: string, separator = '', opening = '(', closing = ')') {
    if (separator.length > 1) {
        return [];
    }
    if (!isString(prefix)) {
        prefix = opening;
    }
    const prefixed = prefix !== opening;
    const combined = prefixed ? prefix + opening : opening;
    const result: string[] = [];
    const appendValues = (segment: string) => {
        segment.split(separator).forEach(seg => {
            seg = seg.trim();
            if (seg !== '') {
                result.push(seg);
            }
        });
    };
    let position = 0;
    let index = -1;
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
                        const joined = result[result.length - 1];
                        if (value.substring(index - joined.length, index + 1) === joined + prefix) {
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
        let found = false;
        for (let i = index + (prefixed ? prefix.length : 0) + 1, open = 1, close = 0; i < length; ++i) {
            switch (value.charAt(i)) {
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
                        if (value.charAt(i) === separator) {
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

export function hasBit(value: number, offset: number) {
    return (value & offset) === offset;
}

export function isNumber(value: string) {
    return UNIT.DECIMAL.test(value);
}

export function isString(value: any): value is string {
    return typeof value === 'string' && value.trim() !== '';
}

export function isArray<T>(value: any): value is Array<T> {
    return Array.isArray(value) && value.length > 0;
}

export function isObject(value: any): value is {} {
    return typeof value === 'object' && value !== null;
}

export function isPlainObject(value: any): value is {} {
    return isObject(value) && (value.constructor === Object || Object.getPrototypeOf(Object(value)) === null);
}

export function isEqual(source: any, other: any) {
    if (source === other) {
        return true;
    }
    else if (Array.isArray(source) && Array.isArray(other)) {
        const length = source.length;
        if (length === other.length) {
            let i = 0;
            while (i < length) {
                if (source[i] !== other[i++]) {
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

export function includes(source: Undef<string>, value: string, delimiter = XML.SEPARATOR) {
    if (source) {
        for (const name of source.split(delimiter)) {
            if (name === value) {
                return true;
            }
        }
    }
    return false;
}

export function cloneInstance<T>(value: T): T {
    return Object.assign(Object.create(Object.getPrototypeOf(value)), value);
}

export function cloneArray(data: any[], result: any[] = [], object = false) {
    data.forEach(value => {
        if (Array.isArray(value)) {
            result.push(cloneArray(value, [], object));
        }
        else if (object && isPlainObject(value)) {
            result.push(cloneObject(value, {}, true));
        }
        else {
            result.push(value);
        }
    });
    return result;
}

export function cloneObject(data: {}, result = {}, array = false) {
    for (const attr in data) {
        const value = data[attr];
        if (Array.isArray(value)) {
            result[attr] = array ? cloneArray(value, [], true) : value;
        }
        else if (isPlainObject(value)) {
            result[attr] = cloneObject(value, {}, array);
        }
        else {
            result[attr] = value;
        }
    }
    return result;
}

export function resolvePath(value: string, href?: string) {
    value = value.trim();
    if (!COMPONENT.PROTOCOL.test(value)) {
        const origin = location.origin;
        const pathname = (href?.replace(origin, '') || location.pathname).replace(/\\/g, '/').split('/');
        pathname.pop();
        value = value.replace(/\\/g, '/');
        if (value.charAt(0) === '/') {
            return origin + value;
        }
        else if (value.startsWith('../')) {
            const trailing: string[] = [];
            value.split('/').forEach(dir => {
                if (dir === '..') {
                    if (trailing.length === 0) {
                        pathname.pop();
                    }
                    else {
                        trailing.pop();
                    }
                }
                else {
                    trailing.push(dir);
                }
            });
            value = trailing.join('/');
        }
        return origin + pathname.join('/') + '/' + value;
    }
    return value;
}

export function trimBoth(value: string, char = '"') {
    const match = new RegExp(`^(${char})(.*?)\\1$`).exec(value);
    return match ? match[2] : value;
}

export function trimString(value: string, char: string) {
    return trimStart(trimEnd(value, char), char);
}

export function trimStart(value: string, char: string) {
    return value.replace(new RegExp(`^${char}+`), '');
}

export function trimEnd(value: string, char: string) {
    return value.replace(new RegExp(`${char}+$`), '');
}

export function appendSeparator(preceding: string, value: string, separator = '/') {
    preceding = preceding.trim();
    value = value.trim();
    switch (separator) {
        case '\\':
            preceding = preceding.replace(/\//g, '\\');
            value = value.replace(/\//g, '\\');
            break;
        case '/':
            preceding = preceding.replace(/\\/g, '/');
            value = value.replace(/\\/g, '/');
            break;
    }
    return preceding + (preceding !== '' && value !== '' && !preceding.endsWith(separator) && !value.startsWith(separator) ? separator : '') + value;
}

export function fromLastIndexOf(value: string, ...char: string[]) {
    for (const ch of char) {
        const index = value.lastIndexOf(ch);
        if (index !== -1) {
            return value.substring(index + 1);
        }
    }
    return value;
}

export function partitionLastIndexOf(value: string, ...char: string[]): [string, string] {
    for (const ch of char) {
        const index = value.lastIndexOf(ch);
        if (index !== -1) {
            return [value.substring(0, index), value.substring(index + 1)];
        }
    }
    return ['', value];
}

export function searchObject(obj: StringMap, value: string | StringMap) {
    const result: any[][] = [];
    if (typeof value === 'object') {
        for (const term in value) {
            const attr = value[term];
            if (hasValue(obj[attr])) {
                result.push([attr, obj[attr]]);
            }
        }
    }
    else {
        const search = /^\*.+\*$/.test(value) ? (a: string) => a.includes(value.replace(/^\*/, '').replace(/\*$/, '')) :
                        value.startsWith('*') ? (a: string) => a.endsWith(value.replace(/^\*/, '')) :
                          value.endsWith('*') ? (a: string) => a.startsWith(value.replace(/\*$/, '')) : (a: string): boolean => a === value;
        for (const i in obj) {
            if (search(i)) {
                result.push([i, obj[i]]);
            }
        }
    }
    return result;
}

export function hasValue<T>(value: any): value is T {
    return value !== undefined && value !== null && value !== '';
}

export function withinRange(a: number, b: number, offset = 1) {
    return b >= (a - offset) && b <= (a + offset);
}

export function aboveRange(a: number, b: number, offset = 1) {
    return a + offset > b;
}

export function belowRange(a: number, b: number, offset = 1) {
    return a - offset < b;
}

export function assignEmptyProperty(dest: {}, source: {}) {
    for (const attr in source) {
        if (!Object.prototype.hasOwnProperty.call(dest, attr)) {
            dest[attr] = source[attr];
        }
    }
    return dest;
}

export function assignEmptyValue(dest: {}, ...attrs: string[]) {
    const length = attrs.length;
    if (length > 1) {
        let current = dest;
        let i = 0;
        do {
            const name = attrs[i];
            const value = current[name];
            if (i === length - 2) {
                if (!hasValue(value)) {
                    current[name] = attrs[i + 1];
                }
                break;
            }
            else if (isString(name)) {
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

export function findSet<T>(list: Set<T>, predicate: IteratorPredicate<T, boolean, Set<T>>) {
    let i = 0;
    for (const item of list) {
        if (predicate(item, i++, list)) {
            return item;
        }
    }
    return undefined;
}

export function sortNumber(values: number[], ascending = true) {
    return ascending ? values.sort((a, b) => a < b ? -1 : 1) : values.sort((a, b) => a > b ? -1 : 1);
}

export function safeNestedArray<T>(list: T[][] | ObjectMap<T[]>, index: number | string) {
    let result: T[] = list[index];
    if (result === undefined || result === null) {
        result = [];
        list[index] = result;
    }
    return result;
}

export function safeNestedMap<T>(map: ObjectMapNested<T>, index: number | string) {
    let result: ObjectMap<T> = map[index];
    if (result === undefined || result === null) {
        result = {};
        map[index] = result;
    }
    return result;
}

export function sortArray<T>(list: T[], ascending: boolean, ...attrs: string[]) {
    return list.sort((a, b) => {
        for (const attr of attrs) {
            let valueA: any = a;
            let valueB: any = b;
            for (const name of attr.split('.')) {
                const vA = valueA[name], vB = valueB[name];
                if (vA !== undefined && vB !== undefined) {
                    valueA = vA;
                    valueB = vB;
                }
                else if (vA === undefined && vB === undefined) {
                    return 0;
                }
                else if (vA !== undefined) {
                    return -1;
                }
                else {
                    return 1;
                }
            }
            if (valueA !== valueB) {
                if (ascending) {
                    return valueA > valueB ? 1 : -1;
                }
                else {
                    return valueA < valueB ? -1 : 1;
                }
            }
        }
        return 0;
    });
}

export function flatArray<T>(list: any[], depth = 0, current = 0): T[] {
    let result: any[] = [];
    const length = list.length;
    let i = 0;
    while (i < length) {
        const item = list[i++];
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
    let i = 0, j = 0, k = 0;
    while (i < length) {
        const item = list[i];
        if (predicate(item, i++, list)) {
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

export function sameArray<T>(list: ArrayLike<T>, predicate: IteratorPredicate<T, any>) {
    const length = list.length;
    if (length) {
        let baseValue!: any;
        let i = 0;
        while (i < length) {
            const value = predicate(list[i], i, list);
            if (i++ === 0) {
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

export function joinArray<T>(list: ArrayLike<T>, predicate: IteratorPredicate<T, string>, char = '\n', trailing = true): string {
    let result = '';
    const length = list.length;
    let i = 0;
    while (i < length) {
        const value = predicate(list[i], i++, list);
        if (value !== '') {
            result += value + char;
        }
    }
    return trailing ? result : result.substring(0, result.length - char.length);
}

export function iterateArray<T>(list: ArrayLike<T>, predicate: IteratorPredicate<T, void | boolean>, start = 0, end = Infinity) {
    start = Math.max(start, 0);
    const length = Math.min(list.length, end);
    let i = start;
    while (i < length) {
        const item = list[i];
        const result = predicate(item, i++, list);
        if (result === true) {
            return Infinity;
        }
    }
    return length;
}

export function iterateReverseArray<T>(list: ArrayLike<T>, predicate: IteratorPredicate<T, void | boolean>, start = 0, end = Infinity) {
    start = Math.max(start, 0);
    const length = Math.min(list.length, end);
    let i = length - 1;
    while (i >= start) {
        const item = list[i];
        const result = predicate(item, i--, list);
        if (result === true) {
            return Infinity;
        }
    }
    return length;
}

export function conditionArray<T>(list: ArrayLike<T>, predicate: IteratorPredicate<T, boolean>, callback: IteratorPredicate<T, any>) {
    const length = list.length;
    for (let i = 0; i < length; ++i) {
        const item = list[i];
        if (predicate(item, i, list)) {
            const value = callback(item, i, list);
            if (value === false) {
                break;
            }
        }
    }
}

export function replaceMap<T, U>(list: any[], predicate: IteratorPredicate<T, U>): U[] {
    const length = list.length;
    let i = 0;
    while (i < length) {
        list[i] = predicate(list[i], i++, list);
    }
    return list;
}

export function objectMap<T, U>(list: ArrayLike<T>, predicate: IteratorPredicate<T, U>): U[] {
    const length = list.length;
    const result: U[] = new Array(length);
    let i = 0;
    while (i < length) {
        result[i] = predicate(list[i], i++, list);
    }
    return result;
}