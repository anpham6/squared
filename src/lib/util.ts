import { FILE, STRING } from './regex';

const CACHE_CAMELCASE: StringMap = {};
const REGEXP_DECIMAL = new RegExp(`^${STRING.DECIMAL}$`);
const REGEXP_NONWORD = /[^\w]+/g;
const REGEXP_NONWORDNUM = /[^A-Za-z\d]+/g;

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
    jpeg: 'image/jpeg',
    jpg: 'image/jpeg',
    jfif: 'image/jpeg',
    pjpeg: 'image/jpeg',
    pjp: 'image/jpeg',
    jpeg2000: 'video/jpeg2000',
    js: 'text/javascript',
    mjs: 'text/javascript',
    json: 'application/json',
    jsonp: 'application/javascript',
    jsonld: 'application/ld+json',
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

export function parseMimeType(value: string) {
    return EXT_DATA[splitPairEnd(splitPairStart(value, '?'), '.', true, true) || value] as string || '';
}

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
    let result = value[0].toLowerCase(),
        lower = true;
    for (let i = 1, length = value.length; i < length; ++i) {
        const ch = value[i];
        const upper = ch === ch.toUpperCase();
        result += lower && upper && ch !== char ? char + ch.toLowerCase() : ch;
        lower = !upper;
    }
    return result;
}

export function convertCamelCase(value: string, char = '-') {
    const cacheData = CACHE_CAMELCASE[value];
    if (cacheData) {
        return cacheData;
    }
    let i = value.indexOf(char);
    if (i === -1) {
        return CACHE_CAMELCASE[value] = value;
    }
    let result = value.substring(0, i++),
        previous = true;
    const length = value.length;
    while (i < length) {
        const ch = value[i++];
        if (ch === char) {
            previous = true;
        }
        else if (previous) {
            result += ch.toUpperCase();
            previous = false;
        }
        else {
            result += ch;
        }
    }
    return CACHE_CAMELCASE[value] = result;
}

export function convertWord(value: string, dash?: boolean) {
    return value.replace(dash ? REGEXP_NONWORDNUM : REGEXP_NONWORD, '_');
}

export function convertInt(value: string, fallback = 0) {
    const result = parseInt(value);
    return !isNaN(result) ? result : fallback;
}

export function convertFloat(value: string, fallback = 0) {
    const result = parseFloat(value);
    return !isNaN(result) ? result : fallback;
}

export function convertPercent(value: string, fallback?: number) {
    const index = value.indexOf('%');
    return index !== -1 ? +value.substring(0, index) / 100 : fallback === undefined ? +value : fallback;
}

export function convertBase64(value: ArrayBuffer) {
    let result = '';
    const data = new Uint8Array(value);
    for (let i = 0, length = data.byteLength; i < length; ++i) {
        result += String.fromCharCode(data[i]);
    }
    return window.btoa(result);
}

export function delimitString(options: DelimitStringOptions, ...appending: string[]) {
    const { value, not, remove, sort } = options;
    const length = appending.length;
    if (length === 1 && !value) {
        return appending[0];
    }
    const delimiter = options.delimiter || ', ';
    const values = value ? value.split(delimiter) : [];
    for (let i = 0; i < length; ++i) {
        const append = appending[i];
        if (append) {
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

export function splitPair(value: string, char: string, trim?: boolean, last?: boolean): [string, string] {
    const index = !last ? value.indexOf(char) : value.lastIndexOf(char);
    if (index !== -1) {
        const start = value.substring(0, index);
        const end = value.substring(index + char.length);
        return !trim ? [start, end] : [start.trim(), end.trim()];
    }
    return !trim ? [value, ''] : [value.trim(), ''];
}

export function splitPairStart(value: string, char: string, trim?: boolean, last?: boolean) {
    const index = !last ? value.indexOf(char) : value.lastIndexOf(char);
    const result = index !== -1 ? value.substring(0, index) : value;
    return !trim ? result : result.trim();
}

export function splitPairEnd(value: string, char: string, trim?: boolean, last?: boolean) {
    const index = !last ? value.indexOf(char) : value.lastIndexOf(char);
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
    prefix ||= opening;
    const prefixed = prefix !== opening;
    const combined = prefixed ? prefix + opening : opening;
    const result: string[] = [];
    const appendValues = (segment: string) => {
        for (let seg of segment.split(separator)) {
            if (seg = seg.trim()) {
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
                if (segment) {
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
            if (segment) {
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

export function minMaxOf<T>(list: ArrayLike<T>, predicate: IteratorPredicate<T, number>, operator: ">" | "<" | ">=" | "<="): [Null<T>, number] {
    let result: Null<T> = list[0],
        value = predicate(result, 0, list);
    if (isNaN(value)) {
        result = null;
        value = operator[0] === '>' ? -Infinity : Infinity;
    }
    for (let i = 1, length = list.length; i < length; ++i) {
        const item = list[i];
        const itemValue = predicate(item, i, list);
        if (isNaN(itemValue)) {
            continue;
        }
        switch (operator) {
            case '>':
                if (itemValue > value) {
                    result = item;
                    value = itemValue;
                }
                break;
            case '<':
                if (itemValue < value) {
                    result = item;
                    value = itemValue;
                }
                break;
            case '>=':
                if (itemValue >= value) {
                    result = item;
                    value = itemValue;
                }
                break;
            case '<=':
                if (itemValue <= value) {
                    result = item;
                    value = itemValue;
                }
                break;
        }
    }
    return [result, value];
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
        const n = value.charCodeAt(i);
        if (n < 14 && n > 8 || n === 32) {
            continue;
        }
        return false;
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
                if (a !== b && !(isPlainObject(a) && isPlainObject(b) && isEqual(a, b))) {
                    return false;
                }
            }
            return true;
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
    if ((value = value.trim()) && !FILE.PROTOCOL.test(value)) {
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
        return location.origin + pathname.join('/') + '/' + value;
    }
    return value;
}

export function trimBoth(value: string, pattern: string) {
    const match = new RegExp(`^(${pattern})+([\\s\\S]*?)\\1$`).exec(value);
    return match ? match[2] : value;
}

export function trimString(value: string, pattern: string) {
    const match = new RegExp(`^(?:${pattern})*([\\s\\S]*?)(?:${pattern})*$`).exec(value);
    return match ? match[1] : value;
}

export function trimStart(value: string, pattern: string) {
    return value.replace(new RegExp(`^(?:${pattern})+`), '');
}

export function trimEnd(value: string, pattern: string) {
    return value.replace(new RegExp(`(?:${pattern})+$`), '');
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

export function* searchObject(obj: StringMap, value: string) {
    const start = value[0] === '*';
    const end = lastItemOf(value) === '*';
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
            return valueA > valueB ? -1 : 1;
        }
        return 0;
    });
}

export function flatArray<T>(list: T[], depth = 1, current = 0): T[] {
    const result: T[] = [];
    for (let i = 0, length = list.length; i < length; ++i) {
        const item = list[i];
        if (current < depth && Array.isArray(item)) {
            if (item.length) {
                result.push(...flatArray<T>(item, depth, current + 1));
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
    const valid: T[] = [];
    const invalid: T[] = [];
    for (let i = 0, length = list.length; i < length; ++i) {
        const item = list[i];
        if (predicate(item, i, list)) {
            valid.push(item);
        }
        else {
            invalid.push(item);
        }
    }
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
        if (value) {
            result += result ? char + value : value;
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