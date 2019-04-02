interface UtilRegExpString {
    DECIMAL: string;
    LENGTH: string;
    PERCENT: string;
    LENGTH_PERCENTAGE: string;
    ANGLE: string;
    CALC: string;
    VAR: string;
    ZERO_ONE: string;
    URL: string;
}

interface UtilRegExpPattern {
    DECIMAL: RegExp;
    LENGTH: RegExp;
    PERCENT: RegExp;
    ANGLE: RegExp;
    CALC: RegExp;
    URL: RegExp;
    PROTOCOL: RegExp;
    SEPARATOR: RegExp;
    ATTRIBUTE: RegExp;
    TAGNAME: RegExp;
    CUSTOMPROPERTY: RegExp;
    LEADINGSPACE: RegExp;
    TRAILINGSPACE: RegExp;
    LEADINGNEWLINE: RegExp;
}

const REGEXP_WORD = /\w/;
const REGEXP_WORDDASH = /[a-zA-Z\d]/;

const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const NUMERALS = [
    '', 'C', 'CC', 'CCC', 'CD', 'D', 'DC', 'DCC', 'DCCC', 'CM',
    '', 'X', 'XX', 'XXX', 'XL', 'L', 'LX', 'LXX', 'LXXX', 'XC',
    '', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX'
];
const UNIT_TYPE = 'px|em|pt|rem|ch|pc|vw|vh|vmin|vmax|mm|cm|in';
const CACHE_CAMELCASE: StringMap = {};
const CACHE_UNDERSCORE: StringMap = {};

export const enum USER_AGENT {
    CHROME = 2,
    SAFARI = 4,
    FIREFOX = 8,
    EDGE = 16
}

export const STRING_PATTERN: UtilRegExpString = <any> {
    URL: 'url\\("?(.+?)"?\\)',
    DECIMAL: '-?\\d+(?:\\.\\d+)?',
    PERCENT: '\\d+(?:\\.\\d+)?%',
    CALC: 'calc(\\(.+\\))',
    VAR: 'var\\((--[A-Za-z0-9\\-]+)(?!,\\s*var\\()(?:,\\s*([a-z\\-]+\\([^)]+\\)|[^)]+))?\\)',
    ZERO_ONE: '0(?:\\.\\d+)?|1(?:\\.0+)?'
};

STRING_PATTERN.LENGTH = `(${STRING_PATTERN.DECIMAL})(${UNIT_TYPE})?`;
STRING_PATTERN.LENGTH_PERCENTAGE = `(${STRING_PATTERN.DECIMAL}(?:${UNIT_TYPE}|%)?)`;
STRING_PATTERN.ANGLE = `(${STRING_PATTERN.DECIMAL})(deg|rad|turn|grad)`;

export const REGEXP_COMPILED: UtilRegExpPattern = {
    DECIMAL: new RegExp(`^${STRING_PATTERN.DECIMAL}$`),
    LENGTH: new RegExp(`^${STRING_PATTERN.LENGTH}$`),
    PERCENT: new RegExp(`^${STRING_PATTERN.PERCENT}$`),
    ANGLE: new RegExp(`^${STRING_PATTERN.ANGLE}$`),
    CALC: new RegExp(`^${STRING_PATTERN.CALC}$`),
    URL: new RegExp(STRING_PATTERN.URL),
    TAGNAME: /(<([^>]+)>)/g,
    PROTOCOL: /^[A-Za-z]+:\/\//,
    SEPARATOR: /\s*,\s*/,
    ATTRIBUTE: /([^\s]+)="([^"]+)"/,
    CUSTOMPROPERTY: /^(?:var|calc)\(.+\)$/,
    LEADINGSPACE: /^\s+/,
    TRAILINGSPACE: /\s+$/,
    LEADINGNEWLINE: /^\s*\n+/
};

export function isUserAgent(value: string | number) {
    if (typeof value === 'string') {
        const name = value.toUpperCase();
        value = 0;
        if (name.indexOf('CHROME') !== -1) {
            value |= USER_AGENT.CHROME;
        }
        if (name.indexOf('SAFARI') !== -1) {
            value |= USER_AGENT.SAFARI;
        }
        if (name.indexOf('FIREFOX') !== -1) {
            value |= USER_AGENT.FIREFOX;
        }
        if (name.indexOf('EDGE') !== -1) {
            value |= USER_AGENT.EDGE;
        }
    }
    const userAgent = navigator.userAgent;
    let client: number;
    if (userAgent.indexOf('Safari') !== -1 && userAgent.indexOf('Chrome') === -1) {
        client = USER_AGENT.SAFARI;
    }
    else if (userAgent.indexOf('Firefox') !== -1) {
        client = USER_AGENT.FIREFOX;
    }
    else if (userAgent.indexOf('Edge') !== -1) {
        client = USER_AGENT.EDGE;
    }
    else {
        client = USER_AGENT.CHROME;
    }
    return hasBit(value, client);
}

export function getDeviceDPI() {
    return window.devicePixelRatio * 96;
}

export function capitalize(value: string, upper = true) {
    if (upper) {
        return value.charAt(0).toUpperCase() + value.substring(1).toLowerCase();
    }
    else {
        return value.charAt(0).toLowerCase() + value.substring(1);
    }
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
            if (REGEXP_WORDDASH.test(value[i])) {
                result += value[i];
            }
            else {
                result += '_';
            }
        }
    }
    else {
        for (let i = 0; i < value.length; i++) {
            if (REGEXP_WORD.test(value[i])) {
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
    return value && parseInt(value) || 0;
}

export function convertFloat(value: string) {
    return value && parseFloat(value) || 0;
}

export function convertAngle(value: string, unit = 'deg') {
    let angle = parseFloat(value);
    if (!isNaN(angle)) {
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
    return 0;
}

export function convertPX(value: string, fontSize?: number) {
    if (value) {
        value = value.trim();
        if (value.endsWith('%') || value === 'auto') {
            return value;
        }
        return `${parseUnit(value, fontSize)}px`;
    }
    return '0px';
}

export function convertLength(value: string, dimension: number, fontSize?: number) {
    return isPercent(value) ? Math.round(dimension * (convertFloat(value) / 100)) : parseUnit(value, fontSize);
}

export function convertPercent(value: string, dimension: number, fontSize?: number) {
    return isPercent(value) ? parseFloat(value) / 100 : parseUnit(value, fontSize) / dimension;
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

export function calculate(value: string, dimension = 0, fontSize?: number) {
    value = value.trim();
    if (value.charAt(0) !== '(' || value.charAt(value.length - 1) !== ')') {
        value = `(${value})`;
    }
    const opening: boolean[] = [];
    const closing: number[] = [];
    let opened = 0;
    for (let i = 0; i < value.length; i++) {
        switch (value.charAt(i)) {
            case '(':
                opened++;
                opening[i] = true;
                break;
            case ')':
                closing.push(i);
                break;
        }
    }
    if (opened === closing.length) {
        const symbol = /(\s+[+\-]\s+|\s*[*/]\s*)/;
        const placeholder = /{(\d+)}/;
        const equated: number[] = [];
        let index = 0;
        while (true) {
            for (let i = 0; i < closing.length; i++) {
                let j = closing[i] - 1;
                let valid = false;
                for ( ; j >= 0; j--) {
                    if (opening[j]) {
                        valid = true;
                        opening[j] = false;
                        break;
                    }
                    else if (closing.includes(j)) {
                        break;
                    }
                }
                if (valid) {
                    const seg: number[] = [];
                    const evaluate: string[] = [];
                    for (let partial of value.substring(j + 1, closing[i]).split(symbol)) {
                        partial = partial.trim();
                        switch (partial) {
                            case '+':
                            case '-':
                            case '*':
                            case '/':
                                evaluate.push(partial);
                                break;
                            default:
                                const match = placeholder.exec(partial);
                                if (match) {
                                    seg.push(equated[parseInt(match[1])]);
                                }
                                else if (isLength(partial)) {
                                    seg.push(parseUnit(partial, fontSize));
                                }
                                else if (isPercent(partial)) {
                                    seg.push(parseFloat(partial) / 100 * dimension);
                                }
                                else if (isAngle(partial)) {
                                    seg.push(parseAngle(partial));
                                }
                                else {
                                    return undefined;
                                }
                                break;
                        }
                    }
                    if (seg.length !== evaluate.length + 1) {
                        return undefined;
                    }
                    for (let k = 0; k < evaluate.length; k++) {
                        if (evaluate[k] === '/') {
                            if (Math.abs(seg[k + 1]) !== 0) {
                                seg.splice(k, 2, seg[k] / seg[k + 1]);
                                evaluate.splice(k--, 1);
                            }
                            else {
                                return undefined;
                            }
                        }
                    }
                    for (let k = 0; k < evaluate.length; k++) {
                        if (evaluate[k] === '*') {
                            seg.splice(k, 2, seg[k] * seg[k + 1]);
                            evaluate.splice(k--, 1);
                        }
                    }
                    for (let k = 0; k < evaluate.length; k++) {
                        seg.splice(k, 2, seg[k] + (evaluate[k] === '-' ? -seg[k + 1] : seg[k + 1]));
                        evaluate.splice(k--, 1);
                    }
                    if (seg.length === 1) {
                        if (closing.length === 1) {
                            return seg[0];
                        }
                        else {
                            equated[index] = seg[0];
                            const hash = `{${index++}}`;
                            const remaining = closing[i] + 1;
                            value = value.substring(0, j) + `${hash + ' '.repeat(remaining - (j + hash.length))}` + value.substring(remaining);
                            closing.splice(i--, 1);
                        }
                    }
                    else {
                        return undefined;
                    }
                }
            }
        }
    }
    return undefined;
}

export function parseUnit(value: string, fontSize?: number) {
    if (value) {
        const match = value.match(REGEXP_COMPILED.LENGTH);
        if (match) {
            let result = parseFloat(match[1]);
            switch (match[2]) {
                case 'px':
                    return result;
                case 'em':
                case 'ch':
                    result *= fontSize || 16;
                    break;
                case 'rem':
                    result *= parseFloat(getComputedStyle(document.body).getPropertyValue('font-size'));
                    break;
                case 'pc':
                    result *= 12;
                case 'pt':
                    result *= 4 / 3;
                    break;
                case 'mm':
                    result /= 10;
                case 'cm':
                    result /= 2.54;
                case 'in':
                    result *= getDeviceDPI();
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
            }
            return result;
        }
    }
    return 0;
}

export function parseAngle(value: string) {
    if (value) {
        const match = REGEXP_COMPILED.ANGLE.exec(value);
        if (match) {
            return convertAngle(match[1], match[2]);
        }
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
        if (isNaN(value)) {
            return '0%';
        }
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
    return typeof value === 'string' && REGEXP_COMPILED.DECIMAL.test(value.trim());
}

export function isString(value: any): value is string {
    return typeof value === 'string' && value.trim() !== '';
}

export function isArray<T>(value: any): value is Array<T> {
    return Array.isArray(value) && value.length > 0;
}

export function isLength(value: string, percent = false) {
    return REGEXP_COMPILED.LENGTH.test(value) || percent && isPercent(value);
}

export function isPercent(value: string) {
    return REGEXP_COMPILED.PERCENT.test(value);
}

export function isCalc(value: string) {
    return REGEXP_COMPILED.CALC.test(value);
}

export function isCustomProperty(value: string) {
    return REGEXP_COMPILED.CUSTOMPROPERTY.test(value);
}

export function isAngle(value: string) {
    return REGEXP_COMPILED.ANGLE.test(value);
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
    if (!REGEXP_COMPILED.PROTOCOL.test(value)) {
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

export function withinRange(a: number, b: number, offset = 0.5) {
    return b >= (a - offset) && b <= (a + offset);
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
    const result: T[] = new Array(list.length);
    let j = 0;
    for (let i = 0; i < list.length; i++) {
        if (predicate(list[i], i, list)) {
            result[j++] = list[i];
        }
    }
    result.length = j;
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
    const result: U[] = new Array(list.length);
    let j = 0;
    for (let i = 0; i < list.length; i++) {
        const item = predicate(list[i], i, list);
        if (hasValue(item)) {
            result[j++] = item;
        }
    }
    result.length = j;
    return result;
}

export function filterMap<T, U>(list: T[], predicate: IteratorPredicate<T, boolean>, callback: IteratorPredicate<T, U>): U[] {
    const result: U[] = new Array(list.length);
    let j = 0;
    for (let i = 0; i < list.length; i++) {
        if (predicate(list[i], i, list)) {
            result[j++] = callback(list[i], i, list);
        }
    }
    result.length = j;
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
    for (let i = 0; i < list.length; i++) {
        const value = predicate(list[i], i, list);
        if (value !== '') {
            result += value + char;
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