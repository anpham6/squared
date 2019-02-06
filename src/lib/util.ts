const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const NUMERALS = [
    '', 'C', 'CC', 'CCC', 'CD', 'D', 'DC', 'DCC', 'DCCC', 'CM',
    '', 'X', 'XX', 'XXX', 'XL', 'L', 'LX', 'LXX', 'LXXX', 'XC',
    '', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX'
];

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
        const value1 = parseInt(current1);
        const value2 = parseInt(current2);
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

export const REGEXP_PATTERN = {
    URL: /url\("?(.*?)"?\)/,
    URI: /^[A-Za-z]+:\/\//,
    UNIT: /^(?:\s*(-?[\d.]+)(px|em|ch|pc|pt|vw|vh|vmin|vmax|mm|cm|in))+$/,
    ATTRIBUTE: /([^\s]+)="([^"]+)"/
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
    const matchArray = value.match(/([a-z][A-Z])/g);
    if (matchArray) {
        matchArray.forEach(match => value = value.replace(match, `${match[0]}_${match[1].toLowerCase()}`));
    }
    return value;
}

export function convertCamelCase(value: string, char = '-') {
    const matchArray = value.replace(new RegExp(`^${char}+`), '').match(new RegExp(`(${char}[a-z])`, 'g'));
    if (matchArray) {
        matchArray.forEach(match => value = value.replace(match, match[1].toUpperCase()));
    }
    return value;
}

export function convertWord(value: string, replaceDash = false) {
    if (value) {
        value = value.replace(/[^\w]/g, '_').trim();
        if (replaceDash) {
            value = value.replace(/-/g, '_');
        }
        return value;
    }
    return '';
}

export function convertInt(value: string) {
    return value && parseInt(value) || 0;
}

export function convertFloat(value: string) {
    return value && parseFloat(value) || 0;
}

export function convertPX(value: string, dpi: number, fontSize: number): string {
    if (value) {
        if (isNumber(value)) {
            return `${value}px`;
        }
        else {
            value = value.trim();
            if (value.endsWith('px') || value.endsWith('%') || value === 'auto') {
                return value;
            }
        }
        const match = value.match(REGEXP_PATTERN.UNIT);
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
                    result *= dpi || 96;
                    break;
            }
            return `${result}px`;
        }
    }
    return '0px';
}

export function convertPercent(value: number, precision = 0) {
    return value < 1 ? `${precision === 0 ? Math.round(value * 100) : parseFloat((value * 100).toFixed(precision))}%` : `100%`;
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
        const index: number = base[key];
        if (value === index) {
            return derived[key];
        }
    }
    return '';
}

export function formatPX(value: string | number) {
    if (typeof value === 'string') {
        value = parseFloat(value);
    }
    return isNaN(value) ? '0px' : `${Math.round(value)}px`;
}

export function formatPercent(value: string | number) {
    if (typeof value === 'string') {
        value = parseFloat(value);
    }
    if (isNaN(value)) {
        return '0%';
    }
    return value < 1 ? convertPercent(value) : `${Math.round(value)}%`;
}

export function formatString(value: string, ...params: string[]) {
    for (let i = 0; i < params.length; i++) {
        value = value.replace(`{${i}}`, params[i]);
    }
    return value;
}

export function hasBit(value: number, type: number) {
    return (value & type) === type;
}

export function isNumber(value: string | number): value is number {
    return typeof value === 'number' || /^-?\d+(\.\d+)?$/.test(value.trim());
}

export function isString(value: any): value is string {
    return typeof value === 'string' && value !== '';
}

export function isArray<T>(value: any): value is Array<T> {
    return Array.isArray(value) && value.length > 0;
}

export function isUnit(value: string) {
    return REGEXP_PATTERN.UNIT.test(value);
}

export function isPercent(value: string) {
    return /^\d+(\.\d+)?%$/.test(value);
}

export function includes(source: string | undefined, value: string, delimiter = ',') {
    return source ? source.split(delimiter).map(segment => segment.trim()).includes(value) : false;
}

export function cloneObject(data: {}) {
    const result = {};
    for (const attr in data) {
        if (data.hasOwnProperty(attr)) {
            if (data && typeof data[attr] === 'object') {
                result[attr] = cloneObject(data[attr]);
            }
            else {
                result[attr] = data[attr];
            }
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
            typeof result !== 'string' &&
            typeof result !== 'number' &&
            typeof result !== 'boolean'
        );
        valid = result !== undefined && result !== null && i === attrs.length;
    }
    switch (type) {
        case 'object':
            return valid ? result : null;
        case 'number':
            return valid && !isNaN(parseInt(result)) ? parseInt(result) : 0;
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
    if (!REGEXP_PATTERN.URI.test(value)) {
        let pathname = location.pathname.split('/');
        pathname.pop();
        if (value.charAt(0) === '/') {
            value = location.origin + value;
        }
        else {
            if (value.startsWith('../')) {
                const parts: string[] = [];
                let levels = 0;
                value.split('/').forEach(dir => {
                    if (dir === '..') {
                        levels++;
                    }
                    else {
                        parts.push(dir);
                    }
                });
                pathname = pathname.slice(0, Math.max(pathname.length - levels, 0));
                pathname.push(...parts);
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

export function trimString(value: string | undefined, char: string) {
    return value ? trimStart(trimEnd(value, char), char) : '';
}

export function trimStart(value: string | undefined, char: string) {
    return value ? value.replace(new RegExp(`^${char}+`, 'g'), '') : '';
}

export function trimEnd(value: string | undefined, char: string) {
    return value ? value.replace(new RegExp(`${char}+$`, 'g'), '') : '';
}

export function repeat(many: number, value = '\t') {
    return value.repeat(many);
}

export function indexOf(value: string, ...terms: string[]) {
    for (const term of terms) {
        const index = value.indexOf(term);
        if (index !== -1) {
            return index;
        }
    }
    return -1;
}

export function lastIndexOf(value: string, char = '/') {
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
    return typeof value !== 'undefined' && value !== null && value.toString().trim() !== '';
}

export function withinRange(a: number, b: number, offset = 0) {
    return b >= (a - offset) && b <= (a + offset);
}

export function withinFraction(lower: number, upper: number) {
    return (
        lower === upper ||
        Math.floor(lower) === Math.floor(upper) ||
        Math.ceil(lower) === Math.ceil(upper) ||
        Math.ceil(lower) === Math.floor(upper) ||
        Math.floor(lower) === Math.ceil(upper)
    );
}

export function assignWhenNull(destination: {}, source: {}) {
    for (const attr in source) {
        if (!destination.hasOwnProperty(attr)) {
            destination[attr] = source[attr];
        }
    }
}

export function defaultWhenNull(options: {}, ...attrs: string[]) {
    let current = options;
    for (let i = 0 ; i < attrs.length - 1; i++) {
        const value = attrs[i];
        if (i === attrs.length - 2) {
            if (!hasValue(current[value])) {
                current[value] = attrs[i + 1];
            }
        }
        else if (isString(value)) {
            if (typeof current[value] === 'object') {
                current = current[value];
            }
            else if (current[value] === undefined) {
                current[value] = {};
                current = current[value];
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

export function minArray(list: number[]): number {
    if (list.length) {
        return Math.min.apply(null, list);
    }
    return Number.POSITIVE_INFINITY;
}

export function maxArray(list: number[]): number {
    if (list.length) {
        return Math.max.apply(null, list);
    }
    return Number.NEGATIVE_INFINITY;
}

export function partitionArray<T>(list: T[], predicate: IteratorPredicate<T, boolean>): [T[], T[]] {
    const valid: T[] = [];
    const invalid: T[] = [];
    for (let i = 0; i < list.length; i++) {
        const item = list[i];
        if (predicate(item, i)) {
            valid.push(item);
        }
        else {
            invalid.push(item);
        }
    }
    return [valid, invalid];
}

export function retainArray<T>(list: T[], predicate: IteratorPredicate<T, any>) {
    const retain = list.filter(predicate);
    list.length = 0;
    list.push(...retain);
}

export function spliceArray<T, U = boolean>(list: T[], predicate: IteratorPredicate<T, U>, callback?: IteratorCallback<T>) {
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
        current = [].concat.apply([], current.filter(item => item));
    }
    return current;
}

export function flatMap<T, U>(list: T[], predicate: IteratorPredicate<T, U>): U[] {
    return list.map((item: T, index) => predicate(item, index)).filter((item: U) => hasValue(item));
}