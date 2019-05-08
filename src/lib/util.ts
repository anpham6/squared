import { CHAR, PREFIX, UNIT } from './regex';

const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const NUMERALS = [
    '', 'C', 'CC', 'CCC', 'CD', 'D', 'DC', 'DCC', 'DCCC', 'CM',
    '', 'X', 'XX', 'XXX', 'XL', 'L', 'LX', 'LXX', 'LXXX', 'XC',
    '', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX'
];
const CACHE_CAMELCASE: StringMap = {};
const CACHE_UNDERSCORE: StringMap = {};

export function capitalize(value: string, upper = true) {
    return upper ? value.charAt(0).toUpperCase() + value.substring(1).toLowerCase() : value.charAt(0).toLowerCase() + value.substring(1);
}

export function convertUnderscore(value: string) {
    if (CACHE_UNDERSCORE[value]) {
        return CACHE_UNDERSCORE[value];
    }
    let result = value[0].toLowerCase();
    let lower = true;
    for (let i = 1; i < value.length; i++) {
        const char = value[i];
        const upper = char === char.toUpperCase();
        if (char !== '_' && lower && upper) {
            result += '_' + char.toLowerCase();
        }
        else {
            result += char;
        }
        lower = !upper;
    }
    CACHE_UNDERSCORE[value] = result;
    return result;
}

export function convertCamelCase(value: string, char = '-') {
    if (CACHE_CAMELCASE[value]) {
        return CACHE_CAMELCASE[value];
    }
    let result = '';
    let previous = '';
    for (let i = 0; i < value.length; i++) {
        if (value[i] !== char) {
            if (previous === char) {
                result += value[i].toUpperCase();
            }
            else {
                result += value[i];
            }
        }
        previous = value[i];
    }
    CACHE_CAMELCASE[value] = result;
    return result;
}

export function convertWord(value: string, dash = false) {
    let result = '';
    if (dash) {
        for (let i = 0; i < value.length; i++) {
            if (CHAR.WORDDASH.test(value[i])) {
                result += value[i];
            }
            else {
                result += '_';
            }
        }
    }
    else {
        for (let i = 0; i < value.length; i++) {
            if (CHAR.WORD.test(value[i])) {
                result += value[i];
            }
            else {
                result += '_';
            }
        }
    }
    return result;
}

export function convertInt(value: UndefNull<string>) {
    return value && parseInt(value) || 0;
}

export function convertFloat(value: UndefNull<string>) {
    return value && parseFloat(value) || 0;
}

export function convertAlpha(value: number) {
    if (value >= 0) {
        let result = '';
        while (value >= ALPHABET.length) {
            const base = Math.floor(value / ALPHABET.length);
            if (base > 1 && base <= ALPHABET.length) {
                result += ALPHABET.charAt(base - 1);
                value -= base * ALPHABET.length;
            }
            else if (base > ALPHABET.length) {
                result += convertAlpha(base * ALPHABET.length);
                value -= base * ALPHABET.length;
            }
            const index = value % ALPHABET.length;
            result += ALPHABET.charAt(index);
            value -= index + ALPHABET.length;
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
        result = (NUMERALS[parseInt(digits.pop() || '') + (i * 10)] || '') + result;
    }
    return 'M'.repeat(parseInt(digits.join(''))) + result;
}

export function convertEnum(value: number, base: {}, derived: {}): string {
    for (const key of Object.keys(base)) {
        if (value === base[key]) {
            return derived[key];
        }
    }
    return '';
}

export function formatString(value: string, ...params: string[]) {
    for (let i = 0; i < params.length; i++) {
        value = value.replace(`{${i}}`, params[i]);
    }
    return value;
}

export function hasBit(value: number, offset: number) {
    return (value & offset) === offset;
}

export function isNumber(value: any): value is string {
    return typeof value === 'string' && UNIT.DECIMAL.test(value.trim());
}

export function isString(value: any): value is string {
    return typeof value === 'string' && value.trim() !== '';
}

export function isArray<T>(value: any): value is Array<T> {
    return Array.isArray(value) && value.length > 0;
}

export function isEqual(source: any, values: any) {
    if (source === values) {
        return true;
    }
    else if (Array.isArray(source) && Array.isArray(values)) {
        if (source.length === values.length) {
            for (let i = 0; i < source.length; i++) {
                if (source[i] !== values[i]) {
                    return false;
                }
            }
            return true;
        }
    }
    else if (Object.keys(source).length === Object.keys(values).length) {
        for (const attr in source) {
            if (source[attr] !== values[attr]) {
                if (typeof source[attr] === 'object' && values[attr] === 'object' && isEqual(source[attr], values[attr])) {
                    continue;
                }
                return false;
            }
        }
        return true;
    }
    return false;
}

export function includes(source: string | undefined, value: string, delimiter = ',') {
    if (source) {
        for (const name of source.split(delimiter)) {
            if (name.trim() === value) {
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
    for (const value of data) {
        if (Array.isArray(value)) {
            result.push(cloneArray(value, [], object));
        }
        else if (object && typeof value === 'object' && value !== null) {
            result.push(cloneObject(value, {}, true));
        }
        else {
            result.push(value);
        }
    }
    return result;
}

export function cloneObject(data: {}, result = {}, array = false) {
    for (const attr in data) {
        const value = data[attr];
        if (Array.isArray(value)) {
            result[attr] = array ? cloneArray(value, [], true) : value;
        }
        else if (typeof value === 'object' && value.constructor === Object) {
            result[attr] = cloneObject(value, {}, array);
        }
        else {
            result[attr] = value;
        }
    }
    return result;
}

export function optional(obj: UndefNull<object>, value: string, type?: string) {
    let valid = false;
    let result!: any;
    if (obj && typeof obj === 'object') {
        result = obj;
        const attrs = value.split('.');
        let i = 0;
        do {
            result = result[attrs[i]];
        }
        while (
            result !== null &&
            result !== undefined &&
            ++i < attrs.length &&
            typeof result === 'object'
        );
        valid = i === attrs.length && result !== undefined && result !== null;
    }
    switch (type) {
        case 'object':
            return valid ? result : null;
        case 'number':
            result = parseFloat(result);
            return valid && !isNaN(result) ? result : 0;
        case 'boolean':
            return valid && result === true;
        default:
            return valid ? result.toString() : '';
    }
}

export function optionalAsObject(obj: UndefNull<object>, value: string): object {
    return optional(obj, value, 'object');
}

export function optionalAsString(obj: UndefNull<object>, value: string): string {
    return optional(obj, value, 'string');
}

export function optionalAsNumber(obj: UndefNull<object>, value: string): number {
    return optional(obj, value, 'number');
}

export function optionalAsBoolean(obj: UndefNull<object>, value: string): boolean {
    return optional(obj, value, 'boolean');
}

export function resolvePath(value: string) {
    if (!PREFIX.PROTOCOL.test(value)) {
        let pathname = location.pathname.split('/');
        pathname.pop();
        if (value.charAt(0) === '/') {
            value = location.origin + value;
        }
        else {
            if (value.startsWith('../')) {
                const segments: string[] = [];
                let levels = 0;
                for (const dir of value.split('/')) {
                    if (dir === '..') {
                        levels++;
                    }
                    else {
                        segments.push(dir);
                    }
                }
                pathname = concatArray(pathname.slice(0, Math.max(pathname.length - levels, 0)), segments);
                value = location.origin + pathname.join('/');
            }
            else {
                value = `${location.origin + pathname.join('/')}/${value}`;
            }
        }
    }
    return value;
}

export function trimNull(value: string | undefined) {
    return value ? value.trim() : '';
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

export function firstIndexOf(value: string, ...terms: string[]) {
    for (const term of terms) {
        const index = value.indexOf(term);
        if (index !== -1) {
            return index;
        }
    }
    return -1;
}

export function fromLastIndexOf(value: string, ...char: string[]) {
    let result = value;
    for (const ch of char) {
        const index = result.lastIndexOf(ch);
        if (index !== -1) {
            result = result.substring(result.lastIndexOf(ch) + 1);
        }
        else {
            return value;
        }
    }
    return result;
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
        const search =
            /^\*.+\*$/.test(value) ? (a: string) => a.indexOf(value.replace(/\*/g, '')) !== -1 :
                 /^\*/.test(value) ? (a: string) => a.endsWith(value.replace(/\*/, '')) :
                 /\*$/.test(value) ? (a: string) => a.startsWith(value.replace(/\*/, '')) :
                                     (a: string): boolean => a === value;
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

export function aboveRange(a: number, b: number) {
    return Math.ceil(a) >= Math.floor(b);
}

export function belowRange(a: number, b: number) {
    return Math.floor(a) <= Math.ceil(b);
}

export function assignEmptyProperty(dest: {}, source: {}) {
    for (const attr in source) {
        if (!dest.hasOwnProperty(attr)) {
            dest[attr] = source[attr];
        }
    }
    return dest;
}

export function assignEmptyValue(dest: {}, ...attrs: string[]) {
    if (attrs.length > 1) {
        let current = dest;
        for (let i = 0; ; i++) {
            const name = attrs[i];
            if (i === attrs.length - 2) {
                if (!hasValue(current[name])) {
                    current[name] = attrs[i + 1];
                }
                break;
            }
            else if (isString(name)) {
                if (current[name] && typeof current[name] === 'object') {
                    current = current[name];
                }
                else if (current[name] === undefined || current[name] === null) {
                    current[name] = {};
                    current = current[name];
                }
                else {
                    break;
                }
            }
            else {
                break;
            }
        }
    }
}

export function sortNumber(values: number[], ascending = true) {
    if (ascending) {
        return values.sort((a, b) => a < b ? -1 : 1);
    }
    else {
        return values.sort((a, b) => a > b ? -1 : 1);
    }
}

export function sortArray<T>(list: T[], ascending: boolean, ...attrs: string[]) {
    return list.sort((a, b) => {
        for (const attr of attrs) {
            const namespaces = attr.split('.');
            let valueA: any = a;
            let valueB: any = b;
            for (const name of namespaces) {
                if (valueA[name] !== undefined && valueB[name] !== undefined) {
                    valueA = valueA[name];
                    valueB = valueB[name];
                }
                else if (valueA[name] === undefined && valueB[name] === undefined) {
                    return 0;
                }
                else if (valueA[name] !== undefined) {
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

export function flatArray<T>(list: any[]): T[] {
    const result: T[] = [];
    for (let i = 0; i < list.length; i++) {
        const item = list[i];
        if (Array.isArray(item)) {
            if (item.length) {
                result.push(...flatArray<T>(item));
            }
        }
        else if (item !== undefined && item !== null) {
            result.push(item);
        }
    }
    return result;
}

export function partitionArray<T>(list: T[], predicate: IteratorPredicate<T, boolean>): [T[], T[]] {
    const valid: T[] = [];
    const invalid: T[] = [];
    for (let i = 0; i < list.length; i++) {
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

export function spliceArray<T>(list: T[], predicate: IteratorPredicate<T, boolean>, callback?: IteratorPredicate<T, void>) {
    for (let i = 0; i < list.length; i++) {
        if (predicate(list[i], i, list)) {
            if (callback) {
                callback(list[i], i, list);
            }
            list.splice(i--, 1);
        }
    }
    return list;
}

export function filterArray<T>(list: T[], predicate: IteratorPredicate<T, boolean>) {
    const result: T[] = [];
    for (let i = 0; i < list.length; i++) {
        if (predicate(list[i], i, list)) {
            result.push(list[i]);
        }
    }
    return result;
}

export function concatArray<T>(dest: T[], source: T[]) {
    for (const item of source) {
        dest.push(item);
    }
    return dest;
}

export function concatMultiArray<T>(dest: T[], ...source: T[][]) {
    for (const list of source) {
        for (const item of list) {
            dest.push(item);
        }
    }
    return dest;
}

export function flatMap<T, U>(list: T[], predicate: IteratorPredicate<T, U>): U[] {
    const result: U[] = [];
    for (let i = 0; i < list.length; i++) {
        const item = predicate(list[i], i, list);
        if (hasValue(item)) {
            result.push(item);
        }
    }
    return result;
}

export function filterMap<T, U>(list: T[], predicate: IteratorPredicate<T, boolean>, callback: IteratorPredicate<T, U>): U[] {
    const result: U[] = [];
    for (let i = 0; i < list.length; i++) {
        if (predicate(list[i], i, list)) {
            result.push(callback(list[i], i, list));
        }
    }
    return result;
}

export function replaceMap<T, U>(list: any[], predicate: IteratorPredicate<T, U>): U[] {
    for (let i = 0; i < list.length; i++) {
        list[i] = predicate(list[i], i, list);
    }
    return list;
}

export function objectMap<T, U>(list: T[], predicate: IteratorPredicate<T, U>): U[] {
    const result: U[] = new Array(list.length);
    for (let i = 0; i < list.length; i++) {
        result[i] = predicate(list[i], i, list);
    }
    return result;
}

export function joinMap<T>(list: T[], predicate: IteratorPredicate<T, string>, char = '\n'): string {
    let result = '';
    const length = list.length;
    for (let i = 0; i < length; i++) {
        const value = predicate(list[i], i, list);
        if (value !== '') {
            result += value;
            if (i < length - 1) {
                result += char;
            }
        }
    }
    return result;
}

export function captureMap<T>(list: T[], predicate: IteratorPredicate<T, boolean>, callback: IteratorPredicate<T, any>) {
    for (let i = 0; i < list.length; i++) {
        if (predicate(list[i], i, list)) {
            const value = callback(list[i], i, list);
            if (value === false) {
                break;
            }
        }
    }
}