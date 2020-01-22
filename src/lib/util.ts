import { CHAR, COMPONENT, UNIT, XML } from './regex';

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

export function capitalizeString(value: string) {
    const result = value.split('');
    let match: RegExpMatchArray | null;
    while ((match = XML.BREAKWORD_G.exec(value)) !== null) {
        const index = match.index;
        if (index !== undefined) {
            result[index] = match[1].charAt(0).toUpperCase();
        }
    }
    XML.BREAKWORD_G.lastIndex = 0;
    return result.join('');
}

export function lowerCaseString(value: string) {
    let result = value;
    let match: RegExpMatchArray | null;
    while ((match = XML.BREAKWORD_G.exec(value)) !== null) {
        const index = match.index;
        if (index !== undefined) {
            const word = match[1];
            if (!XML.ENTITY.test(word)) {
                result = (index > 0 ? result.substring(0, match.index) : '') + value.substring(index, index + word.length).toLowerCase() + result.substring(index + word.length);
            }
        }
    }
    XML.BREAKWORD_G.lastIndex = 0;
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
    for (let i = 1; i < length; i++) {
        const ch = value[i];
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
    const cacheData = CACHE_CAMELCASE[value];
    if (cacheData) {
        return cacheData;
    }
    let result = '';
    let previous = '';
    const length = value.length;
    for (let i = 0; i < length; i++) {
        const ch = value.charAt(i);
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

export function convertWord(value: string, dash = false) {
    const pattern = dash ? CHAR.WORDDASH : CHAR.WORD;
    let result = '';
    const length = value.length;
    for (let i = 0; i < length; i++) {
        const ch = value.charAt(i);
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

export function buildAlphaString(length: number) {
    let result = '';
    for (let i = 0; i < length; i++) {
        result += ALPHABET.charAt(Math.floor(Math.random() * 26));
    }
    return result;
}

export function formatString(value: string, ...params: string[]) {
    const length = params.length;
    for (let i = 0; i < length; i++) {
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

export function isObject(value: any): value is {} {
    return typeof value === 'object' && value !== null;
}

export function isPlainObject(value: any): value is {} {
    return isObject(value) && value.constructor === Object;
}

export function isEqual(source: any, values: any) {
    if (source === values) {
        return true;
    }
    else if (Array.isArray(source) && Array.isArray(values)) {
        const length = source.length;
        if (length === values.length) {
            for (let i = 0; i < length; i++) {
                if (source[i] !== values[i]) {
                    return false;
                }
            }
            return true;
        }
    }
    else if (Object.keys(source).length === Object.keys(values).length) {
        for (const attr in source) {
            const a = source[attr];
            const b = values[attr];
            if (a !== b) {
                if (isPlainObject(a) && isPlainObject(b) && isEqual(a, b)) {
                    continue;
                }
                return false;
            }
        }
        return true;
    }
    return false;
}

export function includes(source: string | undefined, value: string, delimiter = XML.SEPARATOR) {
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
    for (const value of data) {
        if (Array.isArray(value)) {
            result.push(cloneArray(value, [], object));
        }
        else if (object && isPlainObject(value)) {
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
        else if (isPlainObject(value)) {
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
    let result: any;
    if (isObject(obj)) {
        result = obj;
        const attrs = value.split('.');
        let i = 0;
        do {
            result = result[attrs[i]];
        }
        while (
            result !== undefined &&
            isObject(result) &&
            ++i < attrs.length
        );
        valid = i === attrs.length && result !== undefined && result !== null;
    }
    switch (type) {
        case 'object':
            return valid ? result : null;
        case 'number':
            return valid ? parseFloat(result) : NaN;
        case 'boolean':
            return result === true;
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

export function resolvePath(value: string, href?: string) {
    if (!COMPONENT.PROTOCOL.test(value)) {
        const origin = location.origin;
        let pathname = (href?.replace(origin, '') || location.pathname).split('/');
        pathname.pop();
        if (value.charAt(0) === '/') {
            value = origin + value;
        }
        else {
            if (/^\.\.\//.test(value)) {
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
                pathname = pathname.slice(0, Math.max(pathname.length - levels, 0)).concat(segments);
                value = origin + pathname.join('/');
            }
            else {
                value = origin + pathname.join('/') + '/' + value;
            }
        }
    }
    return value;
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
            /^\*.+\*$/.test(value) ? (a: string) => a.includes(value.replace(/\*/g, '')) :
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
    if (attrs.length > 1) {
        let current = dest;
        for (let i = 0; ; i++) {
            const name = attrs[i];
            const value = current[name];
            if (i === attrs.length - 2) {
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

export function sortArray<T>(list: T[], ascending: boolean, ...attrs: string[]) {
    return list.sort((a, b) => {
        for (const attr of attrs) {
            const namespaces = attr.split('.');
            let valueA: any = a;
            let valueB: any = b;
            for (const name of namespaces) {
                const vA = valueA[name];
                const vB = valueB[name];
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

export function flatArray<T>(list: any[]): T[] {
    let length = list.length;
    for (let i = 0; i < length; i++) {
        const item = list[i];
        if (item === undefined || item === null) {
            list.splice(i--, 1);
            length--;
        }
    }
    return list;
}

export function flatMultiArray<T>(list: any[]): T[] {
    const result: T[] = [];
    const length = list.length;
    for (let i = 0; i < length; i++) {
        const item = list[i];
        if (Array.isArray(item)) {
            if (item.length) {
                result.push(...flatMultiArray<T>(item));
            }
        }
        else if (item !== undefined && item !== null) {
            result.push(item);
        }
    }
    return result;
}

export function partitionArray<T>(list: T[], predicate: IteratorPredicate<T, boolean>): [T[], T[]] {
    const length = list.length;
    const valid: T[] = new Array(length);
    const invalid: T[] = new Array(length);
    let j = 0;
    let k = 0;
    for (let i = 0; i < length; i++) {
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

export function spliceArray<T>(list: T[], predicate: IteratorPredicate<T, boolean>, callback?: IteratorPredicate<T, void>) {
    for (let i = 0; i < list.length; i++) {
        const item = list[i];
        if (predicate(item, i, list)) {
            if (callback) {
                callback(item, i, list);
            }
            list.splice(i--, 1);
        }
    }
    return list;
}

export function filterArray<T>(list: T[], predicate: IteratorPredicate<T, boolean>) {
    const length = list.length;
    const result: T[] = new Array(length);
    let j = 0;
    for (let i = 0; i < length; i++) {
        const item = list[i];
        if (predicate(item, i, list)) {
            result[j++] = item;
        }
    }
    result.length = j;
    return result;
}

export function sameArray<T>(list: T[], predicate: IteratorPredicate<T, any>) {
    const length = list.length;
    if (length) {
        let baseValue!: any;
        for (let i = 0; i < length; i++) {
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

export function flatMap<T, U>(list: T[], predicate: IteratorPredicate<T, U>): U[] {
    const length = list.length;
    const result: U[] = new Array(length);
    let j = 0;
    for (let i = 0; i < length; i++) {
        const item = predicate(list[i], i, list);
        if (hasValue(item)) {
            result[j++] = item;
        }
    }
    result.length = j;
    return result;
}

export function filterMap<T, U>(list: T[], predicate: IteratorPredicate<T, boolean>, callback: IteratorPredicate<T, U>): U[] {
    const length = list.length;
    const result: U[] = new Array(length);
    let j = 0;
    for (let i = 0; i < length; i++) {
        const item = list[i];
        if (predicate(item, i, list)) {
            result[j++] = callback(item, i, list);
        }
    }
    result.length = j;
    return result;
}

export function replaceMap<T, U>(list: any[], predicate: IteratorPredicate<T, U>): U[] {
    const length = list.length;
    for (let i = 0; i < length; i++) {
        list[i] = predicate(list[i], i, list);
    }
    return list;
}

export function objectMap<T, U>(list: T[], predicate: IteratorPredicate<T, U>): U[] {
    const length = list.length;
    const result: U[] = new Array(length);
    for (let i = 0; i < length; i++) {
        result[i] = predicate(list[i], i, list);
    }
    return result;
}

export function joinMap<T>(list: T[], predicate: IteratorPredicate<T, string>, char = '\n', trailing = true): string {
    let result = '';
    const length = list.length;
    for (let i = 0; i < length; i++) {
        const value = predicate(list[i], i, list);
        if (value !== '') {
            result += value + char;
        }
    }
    return trailing ? result : result.substring(0, result.length - char.length);
}

export function captureMap<T>(list: T[], predicate: IteratorPredicate<T, boolean>, callback: IteratorPredicate<T, any>) {
    const length = list.length;
    for (let i = 0; i < length; i++) {
        const item = list[i];
        if (predicate(item, i, list)) {
            const value = callback(item, i, list);
            if (value === false) {
                break;
            }
        }
    }
}