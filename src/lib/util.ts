import { FILE } from './regex';

const CACHE_CAMELCASE: StringMap = {};
const CACHE_TRIMBOTH: ObjectMap<RegExp> = {};
const REGEXP_NONWORD = /[^\w]+/g;
const REGEXP_NONWORDNUM = /[^A-Za-z\d]+/g;

export function promisify<T>(fn: FunctionType<any>): FunctionType<Promise<T>> {
    return (...args: unknown[]) => {
        return new Promise((resolve, reject) => {
            try {
                resolve(fn(...args));
            }
            catch (err) {
                reject(err);
            }
        });
    };
}

export function allSettled<T>(values: readonly (T | PromiseLike<T>)[]) {
    return Promise.all(values.map((promise: Promise<T>) => promise.then(value => ({ status: 'fulfilled', value })).catch(reason => ({ status: 'rejected', reason })) as Promise<PromiseSettledResult<T>>));
}

export function hasKeys(obj: PlainObject) {
    for (const attr in obj) {
        if (obj[attr] !== undefined) {
            return true;
        }
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

export function delimitString(value: DelimitStringOptions | string, ...appending: string[]) {
    let delimiter = ', ',
        trim: Undef<boolean>,
        remove: Undef<boolean>,
        sort: Undef<FunctionSort<string> | boolean>,
        not: Undef<string[]>;
    if (typeof value === 'object') {
        ({ delimiter = ', ', trim, remove, not, sort } = value);
        value = value.value;
    }
    const values = value ? value.split(delimiter) : [];
    for (let i = 0, length = appending.length; i < length; ++i) {
        let append = appending[i];
        if (trim) {
            append = append.trim();
        }
        if (!append || not && values.includes(append)) {
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
    if (sort) {
        values.sort(typeof sort === 'function' ? sort : undefined);
    }
    return values.join(delimiter);
}

export function padStart(value: string, length: number, char: string) {
    length -= value.length;
    return length > 0 ? char.repeat(length) + value : value;
}

export function replaceAll(value: string, searchValue: string, replaceWith: string, replaceCount = 0) {
    const length = searchValue.length;
    let result = '',
        i = -1,
        j = 0,
        k = 0;
    while ((i = value.indexOf(searchValue, k)) !== -1) {
        result += value.substring(k, i) + replaceWith;
        k = i + length;
        if (++j === replaceCount) {
            break;
        }
    }
    return j ? result + value.substring(k) : value;
}

export function spliceString(value: string, index: number, length: number, replaceWith = '') {
    return index === 0 ? replaceWith + value.substring(length) : value.substring(0, index) + replaceWith + value.substring(index + length);
}

export function splitSome(value: string, predicate: (item: string) => unknown, char = ',') {
    const end = char.length;
    const length = value.length;
    let i = 0;
    while (i < length) {
        while (isSpace(value[i])) {
            ++i;
        }
        let j = value.indexOf(char, i);
        if (j === -1) {
            j = length;
        }
        let k = j;
        do {
            --k;
        }
        while (isSpace(value[k]));
        if (k >= i && predicate(value.substring(i, k + 1))) {
            return true;
        }
        i = j + end;
    }
    return false;
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
    if (index !== -1) {
        value = value.substring(0, index);
    }
    return !trim ? value : value.trim();
}

export function splitPairEnd(value: string, char: string, trim?: boolean, last?: boolean) {
    const index = !last ? value.indexOf(char) : value.lastIndexOf(char);
    if (index !== -1) {
        value = value.substring(index + char.length);
        return !trim ? value : value.trim();
    }
    return '';
}

export function splitEnclosing(value: string, prefix?: string | RegExp, separator = '', opening = '(', closing = ')') {
    prefix ||= opening;
    let position = 0,
        offset = 0,
        index = -1,
        combined: Undef<string>;
    if (typeof prefix === 'string') {
        if (prefix !== opening) {
            combined = prefix + opening;
            offset = prefix.length;
        }
        else {
            combined = opening;
        }
    }
    else if (prefix && !prefix.global) {
        prefix = new RegExp(prefix, prefix.flags + 'g');
    }
    const result: string[] = [];
    const length = value.length;
    const appendValues = (segment: string) => {
        for (let seg of segment.split(separator)) {
            if (seg = seg.trim()) {
                result.push(seg);
            }
        }
    };
    const nextIndex = () => {
        if (combined) {
            return value.indexOf(combined, position);
        }
        (prefix as RegExp).lastIndex = position;
        const match = (prefix as RegExp).exec(value);
        if (match) {
            offset = match[0].length;
            return match.index;
        }
        return -1;
    };
    while ((index = nextIndex()) !== -1) {
        let preceding = '';
        if (index !== position) {
            let segment = value.substring(position, index);
            if (separator) {
                if (segment = segment.trim()) {
                    appendValues(segment);
                    if (combined === opening) {
                        const joined = lastItemOf(result);
                        if (joined && value.substring(index - joined.length, index + 1) === joined + opening) {
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
        for (let i = index + offset + 1, open = 1, close = 0; i < length; ++i) {
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
    if (position === 0) {
        return [value];
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
    return value ? !isNaN(+value) : false;
}

export function isString(value: unknown): value is string {
    return typeof value === 'string' && !isEmptyString(value);
}

export function isArray<T>(value: unknown): value is Array<T> {
    return Array.isArray(value) && value.length > 0;
}

export function isObject<T = PlainObject>(value: unknown): value is T {
    return typeof value === 'object' && value !== null;
}

export function isPlainObject<T = PlainObject>(value: unknown): value is T {
    return isObject(value) && (value.constructor === Object || Object.getPrototypeOf(Object(value)) === null);
}

export function isBase64(value: string) {
    return value.length % 4 === 0 && FILE.BASE64.test(value);
}

export function isSpace(ch: unknown): ch is string {
    return ch === ' ' || ch === '\n' || ch === '\t' || ch === '\f' || ch === '\r' || ch === '\v';
}

export function isEmptyString(value: string) {
    for (let i = 0, length = value.length; i < length; ++i) {
        if (!isSpace(value[i])) {
            return false;
        }
    }
    return true;
}

export function isEqual(source: unknown, other: unknown) {
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
                if (!(attr in other)) {
                    return false;
                }
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
            target.push(Array.isArray(value) || deep && isPlainObject(value) ? cloneObject(value, nested) : value);
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
    else {
        return data;
    }
    return target as T extends [] ? T[] : PlainObject;
}

export function resolvePath(value: string, href?: string) {
    if ((value = value.trim()) && !FILE.PROTOCOL.test(value)) {
        const pathname = replaceAll(href ? href.replace(location.origin, '') : location.pathname, '\\', '/').split('/');
        --pathname.length;
        value = replaceAll(value, '\\', '/');
        if (value[0] === '/') {
            return location.origin + value;
        }
        else if (startsWith(value, '../')) {
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
        else if (startsWith(value, './')) {
            value = value.substring(2);
        }
        return location.origin + pathname.join('/') + '/' + value;
    }
    return value;
}

export function trimBoth(value: string, pattern: string) {
    const match = (CACHE_TRIMBOTH[pattern] ||= new RegExp(`^(${pattern})+([\\s\\S]*)\\1$`)).exec(value);
    return match ? match[2] : value;
}

export function trimString(value: string, pattern: string) {
    if (pattern.length === 1) {
        return trimEnd(trimStart(value, pattern), pattern);
    }
    const match = new RegExp(`^(?:${pattern})*([\\s\\S]*?)(?:${pattern})*$`).exec(value);
    return match ? match[1] : value;
}

export function trimStart(value: string, pattern: string) {
    if (value) {
        if (pattern.length === 1) {
            for (let i = 0, length = value.length; i < length; ++i) {
                if (value[i] !== pattern) {
                    return i > 0 ? value.substring(i) : value;
                }
            }
        }
        else {
            const match = new RegExp(`^(?:${pattern})+`).exec(value);
            return match ? value.substring(match[0].length) : value;
        }
    }
    return '';
}

export function trimEnd(value: string, pattern: string) {
    if (value) {
        if (pattern.length === 1) {
            for (let i = value.length - 1, j = 0; i >= 0; --i, ++j) {
                if (value[i] !== pattern) {
                    return j > 0 ? value.substring(0, value.length - j) : value;
                }
            }
        }
        else {
            const match = new RegExp(`(?:${pattern})+$`).exec(value);
            return match ? value.substring(0, value.length - match[0].length) : value;
        }
    }
    return '';
}

export function escapePattern(value: string) {
	return value.replace(/[-|\\{}()[\]^$+*?.]/g, capture => capture === '-' ? '\\x2d' : capture);
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

export function startsWith(value: unknown, leading: string) {
    return typeof value === 'string' && value.substring(0, leading.length) === leading;
}

export function endsWith(value: unknown, trailing: string) {
    return typeof value === 'string' && value.substring(value.length - trailing.length) === trailing;
}

export function hasValue<T>(value: unknown): value is T {
    return value !== undefined && value !== null && value !== '';
}

export function withinRange(a: number, b: number, offset = 1) {
    return b >= (a - offset) && b <= (a + offset);
}

export function sortNumber(values: number[], ascending = true) {
    return values.sort(ascending ? (a, b) => a - b : (a, b) => b - a);
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
                result.push(...flatArray(item as T[], depth, current + 1));
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

export function iterateArray<T>(list: ArrayLike<T>, predicate: IteratorPredicate<T, unknown>, start = 0, end = Infinity) {
    for (let i = Math.max(start, 0), length = Math.min(list.length, end); i < length; ++i) {
        const result = predicate(list[i], i, list);
        if (result === true) {
            return Infinity;
        }
    }
    return length;
}

export function iterateReverseArray<T>(list: ArrayLike<T>, predicate: IteratorPredicate<T, unknown>, start = 0, end = Infinity) {
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