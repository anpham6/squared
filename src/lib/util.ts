interface UtilRegExpString {
    URL: string;
    DECIMAL: string;
    ZERO_ONE: string;
    UNIT: string;
    PERCENT: string;
    DEGREE: string;
    LENGTH: string;
}

interface UtilRegExpPattern {
    UNIT: RegExp;
    DECIMAL: RegExp;
    PERCENT: RegExp;
    URL: RegExp;
    URI: RegExp;
    SEPARATOR: RegExp;
    ATTRIBUTE: RegExp;
    CUSTOMPROPERTY: RegExp;
}

const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const NUMERALS = [
    '', 'C', 'CC', 'CCC', 'CD', 'D', 'DC', 'DCC', 'DCCC', 'CM',
    '', 'X', 'XX', 'XXX', 'XL', 'L', 'LX', 'LXX', 'LXXX', 'XC',
    '', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX'
];

const REGEXP_UNDERSCORE = /([a-z][A-Z])/g;
const REGEXP_WORD = /[^\w]+/g;
const REGEXP_WORD_DASH = /[^a-zA-Z\d]+/g;

function compareObject(obj1: {}, obj2: {}, attr: string, numeric: boolean) {
    const namespaces = attr.split('.');
    let current1: any = obj1;
    let current2: any = obj2;
    for (const name of namespaces) {
        if (current1[name] !== undefined && current2[name] !== undefined) {
            current1 = current1[name];
            current2 = current2[name];
        }
        else if (current1[name] === undefined && current2[name] === undefined) {
            return false;
        }
        else if (current1[name] !== undefined) {
            return [1, 0];
        }
        else {
            return [0, 1];
        }
    }
    if (numeric) {
        const value1 = parseFloat(current1);
        const value2 = parseFloat(current2);
        if (!isNaN(value1) && !isNaN(value2)) {
            return [value1, value2];
        }
        else if (!isNaN(value1)) {
            return [1, 0];
        }
        else if (!isNaN(value2)) {
            return [0, 1];
        }
    }
    return [current1, current2];
}

export const REGEXP_STRING: UtilRegExpString = <any> {
    URL: 'url\\("?(.+?)"?\\)',
    DECIMAL: '-?\\d+(?:.\\d+)?',
    ZERO_ONE: '0(?:\\.\\d+)?|1(?:\\.0+)?',
    PERCENT: '\\d+(\\.\\d+)?%'
};

REGEXP_STRING.UNIT = `(${REGEXP_STRING.DECIMAL})(px|em|ch|pc|pt|vw|vh|vmin|vmax|mm|cm|in)`;
REGEXP_STRING.DEGREE = `(${REGEXP_STRING.DECIMAL})(deg|rad|turn|grad)`;
REGEXP_STRING.LENGTH = `(${REGEXP_STRING.DECIMAL}(?:[a-z]{2,}|%)?)`;

export const REGEXP_COMPILED: UtilRegExpPattern = {
    UNIT: new RegExp(`^${REGEXP_STRING.UNIT}$`),
    DECIMAL: new RegExp(`^${REGEXP_STRING.DECIMAL}$`),
    PERCENT: new RegExp(`^${REGEXP_STRING.PERCENT}$`),
    URL: new RegExp(REGEXP_STRING.URL),
    URI: /^[A-Za-z]+:\/\//,
    SEPARATOR: /\s*,\s*/,
    ATTRIBUTE: /([^\s]+)="([^"]+)"/,
    CUSTOMPROPERTY: /^(?:var|calc)\(.+\)$/
};

export function capitalize(value: string, upper = true) {
    if (value !== '') {
        if (upper) {
            return value.charAt(0).toUpperCase() + value.substring(1).toLowerCase();
        }
        else {
            return value.charAt(0).toLowerCase() + value.substring(1);
        }
    }
    return value;
}

export function convertUnderscore(value: string) {
    value = value.charAt(0).toLowerCase() + value.substring(1);
    const match = value.match(REGEXP_UNDERSCORE);
    if (match) {
        for (const capture of match) {
            value = value.replace(capture, `${capture[0]}_${capture[1].toLowerCase()}`);
        }
    }
    return value;
}

export function convertCamelCase(value: string, char = '-') {
    const match = value.replace(new RegExp(`^${char}+`), '').match(new RegExp(`(${char}[a-z])`, 'g'));
    if (match) {
        for (const capture of match) {
            value = value.replace(capture, capture[1].toUpperCase());
        }
    }
    return value;
}

export function convertWord(value: string, dash = false) {
    return dash ? value.trim().replace(REGEXP_WORD_DASH, '_') : value.replace(REGEXP_WORD, '_');
}

export function convertInt(value: string) {
    return value && parseInt(value) || 0;
}

export function convertFloat(value: string) {
    return value && parseFloat(value) || 0;
}

export function convertAngle(value: string, unit = 'deg') {
    let angle = parseFloat(value);
    switch (unit) {
        case 'rad':
            angle *= 180 / Math.PI;
            break;
        case 'grad':
            angle /= 400;
        case 'turn':
            angle *= 360;
            break;
    }
    return angle;
}

export function convertPX(value: string, fontSize?: number) {
    if (value) {
        value = value.trim();
        if (value.endsWith('%') || value === 'auto') {
            return value;
        }
        return `${calculateUnit(value, fontSize)}px`;
    }
    return '0px';
}

export function convertPercent(value: string, dimension: number, fontSize?: number) {
    return isPercent(value) ? convertFloat(value) / 100 : parseFloat(convertPX(value, fontSize)) / dimension;
}

export function convertUnit(value: string, dimension: number, fontSize?: number) {
    return isPercent(value) ? Math.round(dimension * (convertFloat(value) / 100)) : parseFloat(convertPX(value, fontSize));
}

export function convertAlpha(value: number) {
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
    result = ALPHABET.charAt(value) + result;
    return result;
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

export function calculateUnit(value: string, fontSize?: number) {
    const match = value.match(REGEXP_COMPILED.UNIT);
    if (match) {
        let result = parseFloat(match[1]);
        switch (match[2]) {
            case 'em':
            case 'ch':
                result *= fontSize || 16;
                break;
            case 'pc':
                result *= 12;
            case 'pt':
                result *= 4 / 3;
                break;
            case 'vw':
                result *= window.innerWidth / 100;
                break;
            case 'vh':
                result *= window.innerHeight / 100;
                break;
            case 'vmin':
                result *= Math.min(window.innerWidth, window.innerHeight) / 100;
                break;
            case 'vmax':
                result *= Math.max(window.innerWidth, window.innerHeight) / 100;
                break;
            case 'mm':
                result /= 10;
            case 'cm':
                result /= 2.54;
            case 'in':
                result *= window.devicePixelRatio * 96;
                break;
        }
        return result;
    }
    else if (isNumber(value)) {
        return parseFloat(value);
    }
    return 0;
}

export function formatPX(value: string | number) {
    if (typeof value === 'string') {
        value = parseFloat(value);
    }
    return isNaN(value) ? '0px' : `${Math.round(value)}px`;
}

export function formatPercent(value: string | number, round = true) {
    if (typeof value === 'string') {
        value = parseFloat(value);
    }
    if (isNaN(value)) {
        return '0%';
    }
    return `${round ? Math.round(value) : value}%`;
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

export function isNumber(value: string): boolean {
    return value !== '' && REGEXP_COMPILED.DECIMAL.test(value.trim());
}

export function isString(value: any): value is string {
    return typeof value === 'string' && value.trim() !== '';
}

export function isArray<T>(value: any): value is Array<T> {
    return Array.isArray(value) && value.length > 0;
}

export function isUnit(value: string) {
    return REGEXP_COMPILED.UNIT.test(value);
}

export function isPercent(value: string) {
    return REGEXP_COMPILED.PERCENT.test(value);
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
    for (const item of data) {
        if (Array.isArray(item)) {
            result.push(cloneArray(item, [], object));
        }
        else if (object && typeof item === 'object') {
            result.push(cloneObject(item, {}, true));
        }
        else {
            result.push(item);
        }
    }
    return result;
}

export function cloneObject(data: {}, result = {}, array = false) {
    for (const attr in data) {
        const item = data[attr];
        if (Array.isArray(item)) {
            result[attr] = array ? cloneArray(item, [], true) : item;
        }
        else if (item && typeof item === 'object') {
            result[attr] = cloneObject(item, {}, array);
        }
        else {
            result[attr] = item;
        }
    }
    return result;
}

export function optional(obj: UndefNull<object>, value: string, type?: string) {
    let valid = false;
    let result;
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
    if (!REGEXP_COMPILED.URI.test(value)) {
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
        return value;
    }
    return '';
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

export function fromLastIndexOf(value: string, char = '/') {
    return value.substring(value.lastIndexOf(char) + 1);
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
        let search: (a: string) => boolean;
        if (/^\*.+\*$/.test(value)) {
            search = (a: string) => a.indexOf(value.replace(/\*/g, '')) !== -1;
        }
        else if (/^\*/.test(value)) {
            search = (a: string) => a.endsWith(value.replace(/\*/, ''));
        }
        else if (/\*$/.test(value)) {
            search = (a: string) => a.startsWith(value.replace(/\*/, ''));
        }
        else {
            search = (a: string): boolean => a === value;
        }
        for (const i in obj) {
            if (search(i)) {
                result.push([i, obj[i]]);
            }
        }
    }
    return result;
}

export function hasValue<T>(value: T): value is T {
    return value !== undefined && value !== null && value.toString().trim() !== '';
}

export function hasInSet<T>(list: Set<T>, condition: (x: T) => boolean) {
    for (const item of list) {
        if (condition(item)) {
            return true;
        }
    }
    return false;
}

export function withinRange(a: number, b: number, offset = 0.5) {
    return b >= (a - offset) && b <= (a + offset);
}

export function assignEmptyProperty(dest: {}, source: {}) {
    for (const attr in source) {
        if (!dest.hasOwnProperty(dest[attr])) {
            dest[attr] = source[attr];
        }
    }
    return dest;
}

export function assignEmptyValue(dest: {}, ...attrs: string[]) {
    if (attrs.length > 1) {
        let current = dest;
        for (let i = 0 ; ; i++) {
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

export function sortNumber(values: number[], descending = false) {
    return descending ? values.sort((a, b) => a > b ? -1 : 1) : values.sort((a, b) => a < b ? -1 : 1);
}

export function sortArray<T>(list: T[], ascending: boolean, ...attrs: string[]) {
    return list.sort((a, b) => {
        for (const attr of attrs) {
            const result = compareObject(a, b, attr, true);
            if (result && result[0] !== result[1]) {
                if (ascending) {
                    return result[0] > result[1] ? 1 : -1;
                }
                else {
                    return result[0] < result[1] ? 1 : -1;
                }
            }
        }
        return 0;
    });
}

export function flatArray<T>(list: any[]): T[] {
    let current = list;
    while (current.some(item => Array.isArray(item))) {
        current = [].concat.apply([], filterArray(current, item => item !== undefined && item !== null));
    }
    return current;
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
    const result: U[] = [];
    for (let i = 0; i < list.length; i++) {
        result[i] = predicate(list[i], i, list);
    }
    return result;
}

export function joinMap<T>(list: T[], predicate: IteratorPredicate<T, string>, char = '\n'): string {
    let result = '';
    for (let i = 0; i < list.length; i++) {
        const value = predicate(list[i], i, list);
        if (value !== '') {
            result += value + char;
        }
    }
    return result.substring(0, result.length - char.length);
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