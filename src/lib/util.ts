import { CHAR, PREFIX, UNIT, XML } from './regex';

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
    XML.BREAKWORD_G.lastIndex = 0;
    const result = value.split('');
    let match: RegExpMatchArray | null;
    while ((match = XML.BREAKWORD_G.exec(value)) !== null) {
        if (match.index !== undefined) {
            result[match.index] = match[1].charAt(0).toUpperCase();
        }
    }
    return result.join('');
}

export function lowerCaseString(value: string) {
    XML.BREAKWORD_G.lastIndex = 0;
    let result = value;
    let match: RegExpMatchArray | null;
    while ((match = XML.BREAKWORD_G.exec(value)) !== null) {
        if (match.index !== undefined && !XML.ENTITY.test(match[1])) {
            result = (match.index > 0 ? result.substring(0, match.index) : '') + value.substring(match.index, match.index + match[1].length).toLowerCase() + result.substring(match.index + match[1].length);
        }
    }
    return result;
}

export function spliceString(value: string, index: number, length: number) {
    if (index === 0) {
        return value.substring(length);
    }
    return value.substring(0, index) + value.substring(index + length);
}

export function convertUnderscore(value: string) {
    if (CACHE_UNDERSCORE[value]) {
        return CACHE_UNDERSCORE[value];
    }
    const length = value.length;
    let result = value[0].toLowerCase();
    let lower = true;
    for (let i = 1; i < length; i++) {
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
    const length = value.length;
    let result = '';
    let previous = '';
    for (let i = 0; i < length; i++) {
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
    const length = value.length;
    let result = '';
    if (dash) {
        for (let i = 0; i < length; i++) {
            if (CHAR.WORDDASH.test(value[i])) {
                result += value[i];
            }
            else {
                result += '_';
            }
        }
    }
    else {
        for (let i = 0; i < length; i++) {
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

export function convertInt(value: string) {
    return parseInt(value) || 0;
}

export function convertFloat(value: string) {
    return parseFloat(value) || 0;
}

export function convertAlpha(value: number) {
    if (value >= 0) {
        const length = ALPHABET.length;
        let result = '';
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

export function isPlainObject(value: any): value is {} {
    return typeof value === 'object' && value !== null && value.constructor === Object;
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
            if (source[attr] !== values[attr]) {
                if (isPlainObject(source[attr]) && isPlainObject(values[attr]) && isEqual(source[attr], values[attr])) {
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
                pathname = pathname.slice(0, Math.max(pathname.length - levels, 0)).concat(segments);
                value = location.origin + pathname.join('/');
            }
            else {
                value = `${location.origin + pathname.join('/')}/${value}`;
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

export function aboveRange(a: number, b: number, offset = 1) {
    return a + offset > b;
}

export function belowRange(a: number, b: number, offset = 1) {
    return a - offset < b;
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
                if (current[name] === undefined || current[name] === null) {
                    current[name] = {};
                    current = current[name];
                }
                else if (typeof current[name] === 'object') {
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
    for (let i = 0; i < list.length; i++) {
        const item = list[i];
        if (item === undefined || item === null) {
            list.splice(i--, 1);
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
    const length = list.length;
    const result: T[] = new Array(length);
    let j = 0;
    for (let i = 0; i < length; i++) {
        if (predicate(list[i], i, list)) {
            result[j++] = list[i];
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
        if (predicate(list[i], i, list)) {
            result[j++] = callback(list[i], i, list);
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

export function joinMap<T>(list: T[], predicate: IteratorPredicate<T, string>, char = '\n', trailing = false): string {
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
        if (predicate(list[i], i, list)) {
            const value = callback(list[i], i, list);
            if (value === false) {
                break;
            }
        }
    }
}