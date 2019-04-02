/* squared 0.9.2
   https://github.com/anpham6/squared */

(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
    typeof define === 'function' && define.amd ? define(['exports'], factory) :
    (global = global || self, factory(global.squared = {}));
}(this, function (exports) { 'use strict';

    const REGEXP_WORD = /\w/;
    const REGEXP_WORDDASH = /[a-zA-Z\d]/;
    const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const NUMERALS = [
        '', 'C', 'CC', 'CCC', 'CD', 'D', 'DC', 'DCC', 'DCCC', 'CM',
        '', 'X', 'XX', 'XXX', 'XL', 'L', 'LX', 'LXX', 'LXXX', 'XC',
        '', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX'
    ];
    const UNIT_TYPE = 'px|em|pt|rem|ch|pc|vw|vh|vmin|vmax|mm|cm|in';
    const CACHE_CAMELCASE = {};
    const CACHE_UNDERSCORE = {};
    const STRING_PATTERN = {
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
    const REGEXP_COMPILED = {
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
    function isUserAgent(value) {
        if (typeof value === 'string') {
            const name = value.toUpperCase();
            value = 0;
            if (name.indexOf('CHROME') !== -1) {
                value |= 2 /* CHROME */;
            }
            if (name.indexOf('SAFARI') !== -1) {
                value |= 4 /* SAFARI */;
            }
            if (name.indexOf('FIREFOX') !== -1) {
                value |= 8 /* FIREFOX */;
            }
            if (name.indexOf('EDGE') !== -1) {
                value |= 16 /* EDGE */;
            }
        }
        const userAgent = navigator.userAgent;
        let client;
        if (userAgent.indexOf('Safari') !== -1 && userAgent.indexOf('Chrome') === -1) {
            client = 4 /* SAFARI */;
        }
        else if (userAgent.indexOf('Firefox') !== -1) {
            client = 8 /* FIREFOX */;
        }
        else if (userAgent.indexOf('Edge') !== -1) {
            client = 16 /* EDGE */;
        }
        else {
            client = 2 /* CHROME */;
        }
        return hasBit(value, client);
    }
    function getDeviceDPI() {
        return window.devicePixelRatio * 96;
    }
    function capitalize(value, upper = true) {
        if (upper) {
            return value.charAt(0).toUpperCase() + value.substring(1).toLowerCase();
        }
        else {
            return value.charAt(0).toLowerCase() + value.substring(1);
        }
    }
    function convertUnderscore(value) {
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
    function convertCamelCase(value, char = '-') {
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
    function convertWord(value, dash = false) {
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
    function convertInt(value) {
        return value && parseInt(value) || 0;
    }
    function convertFloat(value) {
        return value && parseFloat(value) || 0;
    }
    function convertAngle(value, unit = 'deg') {
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
    function convertPX(value, fontSize) {
        if (value) {
            value = value.trim();
            if (value.endsWith('%') || value === 'auto') {
                return value;
            }
            return `${parseUnit(value, fontSize)}px`;
        }
        return '0px';
    }
    function convertLength(value, dimension, fontSize) {
        return isPercent(value) ? Math.round(dimension * (convertFloat(value) / 100)) : parseUnit(value, fontSize);
    }
    function convertPercent(value, dimension, fontSize) {
        return isPercent(value) ? parseFloat(value) / 100 : parseUnit(value, fontSize) / dimension;
    }
    function convertAlpha(value) {
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
    function convertRoman(value) {
        const digits = value.toString().split('');
        let result = '';
        let i = 3;
        while (i--) {
            result = (NUMERALS[parseInt(digits.pop() || '') + (i * 10)] || '') + result;
        }
        return 'M'.repeat(parseInt(digits.join(''))) + result;
    }
    function convertEnum(value, base, derived) {
        for (const key of Object.keys(base)) {
            if (value === base[key]) {
                return derived[key];
            }
        }
        return '';
    }
    function calculate(value, dimension = 0, fontSize) {
        value = value.trim();
        if (value.charAt(0) !== '(' || value.charAt(value.length - 1) !== ')') {
            value = `(${value})`;
        }
        const opening = [];
        const closing = [];
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
            const equated = [];
            let index = 0;
            while (true) {
                for (let i = 0; i < closing.length; i++) {
                    let j = closing[i] - 1;
                    let valid = false;
                    for (; j >= 0; j--) {
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
                        const seg = [];
                        const evaluate = [];
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
    function parseUnit(value, fontSize) {
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
    function parseAngle(value) {
        if (value) {
            const match = REGEXP_COMPILED.ANGLE.exec(value);
            if (match) {
                return convertAngle(match[1], match[2]);
            }
        }
        return 0;
    }
    function formatPX(value) {
        if (typeof value === 'string') {
            value = parseFloat(value);
        }
        return isNaN(value) ? '0px' : `${Math.round(value)}px`;
    }
    function formatPercent(value, round = true) {
        if (typeof value === 'string') {
            value = parseFloat(value);
            if (isNaN(value)) {
                return '0%';
            }
        }
        return `${round ? Math.round(value) : value}%`;
    }
    function formatString(value, ...params) {
        for (let i = 0; i < params.length; i++) {
            value = value.replace(`{${i}}`, params[i]);
        }
        return value;
    }
    function hasBit(value, offset) {
        return (value & offset) === offset;
    }
    function isNumber(value) {
        return typeof value === 'string' && REGEXP_COMPILED.DECIMAL.test(value.trim());
    }
    function isString(value) {
        return typeof value === 'string' && value.trim() !== '';
    }
    function isArray(value) {
        return Array.isArray(value) && value.length > 0;
    }
    function isLength(value, percent = false) {
        return REGEXP_COMPILED.LENGTH.test(value) || percent && isPercent(value);
    }
    function isPercent(value) {
        return REGEXP_COMPILED.PERCENT.test(value);
    }
    function isCalc(value) {
        return REGEXP_COMPILED.CALC.test(value);
    }
    function isCustomProperty(value) {
        return REGEXP_COMPILED.CUSTOMPROPERTY.test(value);
    }
    function isAngle(value) {
        return REGEXP_COMPILED.ANGLE.test(value);
    }
    function isEqual(source, values) {
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
    function includes(source, value, delimiter = ',') {
        if (source) {
            for (const name of source.split(delimiter)) {
                if (name.trim() === value) {
                    return true;
                }
            }
        }
        return false;
    }
    function cloneInstance(value) {
        return Object.assign(Object.create(Object.getPrototypeOf(value)), value);
    }
    function cloneArray(data, result = [], object = false) {
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
    function cloneObject(data, result = {}, array = false) {
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
    function optional(obj, value, type) {
        let valid = false;
        let result;
        if (obj && typeof obj === 'object') {
            result = obj;
            const attrs = value.split('.');
            let i = 0;
            do {
                result = result[attrs[i]];
            } while (result !== null &&
                result !== undefined &&
                ++i < attrs.length &&
                typeof result === 'object');
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
    function optionalAsObject(obj, value) {
        return optional(obj, value, 'object');
    }
    function optionalAsString(obj, value) {
        return optional(obj, value, 'string');
    }
    function optionalAsNumber(obj, value) {
        return optional(obj, value, 'number');
    }
    function optionalAsBoolean(obj, value) {
        return optional(obj, value, 'boolean');
    }
    function resolvePath(value) {
        if (!REGEXP_COMPILED.PROTOCOL.test(value)) {
            let pathname = location.pathname.split('/');
            pathname.pop();
            if (value.charAt(0) === '/') {
                value = location.origin + value;
            }
            else {
                if (value.startsWith('../')) {
                    const segments = [];
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
    function trimNull(value) {
        return value ? value.trim() : '';
    }
    function trimString(value, char) {
        return trimStart(trimEnd(value, char), char);
    }
    function trimStart(value, char) {
        return value.replace(new RegExp(`^${char}+`), '');
    }
    function trimEnd(value, char) {
        return value.replace(new RegExp(`${char}+$`), '');
    }
    function firstIndexOf(value, ...terms) {
        for (const term of terms) {
            const index = value.indexOf(term);
            if (index !== -1) {
                return index;
            }
        }
        return -1;
    }
    function fromLastIndexOf(value, char = '/') {
        return value.substring(value.lastIndexOf(char) + 1);
    }
    function searchObject(obj, value) {
        const result = [];
        if (typeof value === 'object') {
            for (const term in value) {
                const attr = value[term];
                if (hasValue(obj[attr])) {
                    result.push([attr, obj[attr]]);
                }
            }
        }
        else {
            let search;
            if (/^\*.+\*$/.test(value)) {
                search = (a) => a.indexOf(value.replace(/\*/g, '')) !== -1;
            }
            else if (/^\*/.test(value)) {
                search = (a) => a.endsWith(value.replace(/\*/, ''));
            }
            else if (/\*$/.test(value)) {
                search = (a) => a.startsWith(value.replace(/\*/, ''));
            }
            else {
                search = (a) => a === value;
            }
            for (const i in obj) {
                if (search(i)) {
                    result.push([i, obj[i]]);
                }
            }
        }
        return result;
    }
    function hasValue(value) {
        return value !== undefined && value !== null && value.toString().trim() !== '';
    }
    function withinRange(a, b, offset = 0.5) {
        return b >= (a - offset) && b <= (a + offset);
    }
    function assignEmptyProperty(dest, source) {
        for (const attr in source) {
            if (!dest.hasOwnProperty(attr)) {
                dest[attr] = source[attr];
            }
        }
        return dest;
    }
    function assignEmptyValue(dest, ...attrs) {
        if (attrs.length > 1) {
            let current = dest;
            for (let i = 0;; i++) {
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
    function sortNumber(values, ascending = true) {
        if (ascending) {
            return values.sort((a, b) => a < b ? -1 : 1);
        }
        else {
            return values.sort((a, b) => a > b ? -1 : 1);
        }
    }
    function sortArray(list, ascending, ...attrs) {
        return list.sort((a, b) => {
            for (const attr of attrs) {
                const namespaces = attr.split('.');
                let valueA = a;
                let valueB = b;
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
    function flatArray(list) {
        let current = list;
        while (current.some(item => Array.isArray(item))) {
            current = [].concat.apply([], filterArray(current, item => item !== undefined && item !== null));
        }
        return current;
    }
    function partitionArray(list, predicate) {
        const valid = [];
        const invalid = [];
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
    function spliceArray(list, predicate, callback) {
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
    function filterArray(list, predicate) {
        const result = new Array(list.length);
        let j = 0;
        for (let i = 0; i < list.length; i++) {
            if (predicate(list[i], i, list)) {
                result[j++] = list[i];
            }
        }
        result.length = j;
        return result;
    }
    function concatArray(dest, source) {
        for (const item of source) {
            dest.push(item);
        }
        return dest;
    }
    function concatMultiArray(dest, ...source) {
        for (const list of source) {
            for (const item of list) {
                dest.push(item);
            }
        }
        return dest;
    }
    function flatMap(list, predicate) {
        const result = new Array(list.length);
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
    function filterMap(list, predicate, callback) {
        const result = new Array(list.length);
        let j = 0;
        for (let i = 0; i < list.length; i++) {
            if (predicate(list[i], i, list)) {
                result[j++] = callback(list[i], i, list);
            }
        }
        result.length = j;
        return result;
    }
    function replaceMap(list, predicate) {
        for (let i = 0; i < list.length; i++) {
            list[i] = predicate(list[i], i, list);
        }
        return list;
    }
    function objectMap(list, predicate) {
        const result = new Array(list.length);
        for (let i = 0; i < list.length; i++) {
            result[i] = predicate(list[i], i, list);
        }
        return result;
    }
    function joinMap(list, predicate, char = '\n') {
        let result = '';
        for (let i = 0; i < list.length; i++) {
            const value = predicate(list[i], i, list);
            if (value !== '') {
                result += value + char;
            }
        }
        return result;
    }
    function captureMap(list, predicate, callback) {
        for (let i = 0; i < list.length; i++) {
            if (predicate(list[i], i, list)) {
                const value = callback(list[i], i, list);
                if (value === false) {
                    break;
                }
            }
        }
    }

    var util = /*#__PURE__*/Object.freeze({
        STRING_PATTERN: STRING_PATTERN,
        REGEXP_COMPILED: REGEXP_COMPILED,
        isUserAgent: isUserAgent,
        getDeviceDPI: getDeviceDPI,
        capitalize: capitalize,
        convertUnderscore: convertUnderscore,
        convertCamelCase: convertCamelCase,
        convertWord: convertWord,
        convertInt: convertInt,
        convertFloat: convertFloat,
        convertAngle: convertAngle,
        convertPX: convertPX,
        convertLength: convertLength,
        convertPercent: convertPercent,
        convertAlpha: convertAlpha,
        convertRoman: convertRoman,
        convertEnum: convertEnum,
        calculate: calculate,
        parseUnit: parseUnit,
        parseAngle: parseAngle,
        formatPX: formatPX,
        formatPercent: formatPercent,
        formatString: formatString,
        hasBit: hasBit,
        isNumber: isNumber,
        isString: isString,
        isArray: isArray,
        isLength: isLength,
        isPercent: isPercent,
        isCalc: isCalc,
        isCustomProperty: isCustomProperty,
        isAngle: isAngle,
        isEqual: isEqual,
        includes: includes,
        cloneInstance: cloneInstance,
        cloneArray: cloneArray,
        cloneObject: cloneObject,
        optional: optional,
        optionalAsObject: optionalAsObject,
        optionalAsString: optionalAsString,
        optionalAsNumber: optionalAsNumber,
        optionalAsBoolean: optionalAsBoolean,
        resolvePath: resolvePath,
        trimNull: trimNull,
        trimString: trimString,
        trimStart: trimStart,
        trimEnd: trimEnd,
        firstIndexOf: firstIndexOf,
        fromLastIndexOf: fromLastIndexOf,
        searchObject: searchObject,
        hasValue: hasValue,
        withinRange: withinRange,
        assignEmptyProperty: assignEmptyProperty,
        assignEmptyValue: assignEmptyValue,
        sortNumber: sortNumber,
        sortArray: sortArray,
        flatArray: flatArray,
        partitionArray: partitionArray,
        spliceArray: spliceArray,
        filterArray: filterArray,
        concatArray: concatArray,
        concatMultiArray: concatMultiArray,
        flatMap: flatMap,
        filterMap: filterMap,
        replaceMap: replaceMap,
        objectMap: objectMap,
        joinMap: joinMap,
        captureMap: captureMap
    });

    class Container {
        constructor(children) {
            this._children = children || [];
        }
        [Symbol.iterator]() {
            const list = this._children;
            let i = 0;
            return {
                next() {
                    if (i < list.length) {
                        return { done: false, value: list[i++] };
                    }
                    else {
                        return { done: true, value: undefined };
                    }
                }
            };
        }
        item(index, value) {
            if (index !== undefined && value !== undefined) {
                if (index >= 0 && index < this._children.length) {
                    this._children[index] = value;
                    return value;
                }
            }
            else {
                if (index === undefined) {
                    return this._children[this._children.length - 1];
                }
                return this._children[index];
            }
            return undefined;
        }
        append(item) {
            this._children.push(item);
            return this;
        }
        remove(item) {
            for (let i = 0; i < this._children.length; i++) {
                if (this._children[i] === item) {
                    return this._children.splice(i, 1);
                }
            }
            return [];
        }
        contains(item) {
            return this._children.indexOf(item) !== -1;
        }
        retain(list) {
            this._children = list;
            return this;
        }
        duplicate() {
            return this._children.slice(0);
        }
        clear() {
            this._children.length = 0;
            return this;
        }
        each(predicate) {
            for (let i = 0; i < this._children.length; i++) {
                predicate(this._children[i], i, this._children);
            }
            return this;
        }
        find(predicate, value) {
            if (typeof predicate === 'string') {
                for (let i = 0; i < this._children.length; i++) {
                    if (this._children[i][predicate] === value) {
                        return this._children[i];
                    }
                }
            }
            else {
                for (let i = 0; i < this._children.length; i++) {
                    if (predicate(this._children[i], i, this._children)) {
                        return this._children[i];
                    }
                }
            }
            return undefined;
        }
        sort(predicate) {
            this._children.sort(predicate);
            return this;
        }
        concat(list) {
            concatArray(this._children, list);
            return this;
        }
        every(predicate) {
            if (this.length > 0) {
                for (let i = 0; i < this._children.length; i++) {
                    if (!predicate(this._children[i], i, this._children)) {
                        return false;
                    }
                }
                return true;
            }
            return false;
        }
        some(predicate) {
            for (let i = 0; i < this._children.length; i++) {
                if (predicate(this._children[i], i, this._children)) {
                    return true;
                }
            }
            return false;
        }
        filter(predicate) {
            return filterArray(this._children, predicate);
        }
        partition(predicate) {
            return partitionArray(this._children, predicate);
        }
        splice(predicate, callback) {
            return spliceArray(this._children, predicate, callback);
        }
        map(predicate) {
            return objectMap(this._children, predicate);
        }
        flatMap(predicate) {
            return flatMap(this._children, predicate);
        }
        cascadeSome(predicate) {
            function cascade(container) {
                for (let i = 0; i < container.children.length; i++) {
                    const item = container.children[i];
                    if (predicate(item, i, container.children)) {
                        return true;
                    }
                    if (item instanceof Container && item.length && cascade(item)) {
                        return true;
                    }
                }
                return false;
            }
            return cascade(this);
        }
        cascade() {
            function cascade(container) {
                const result = [];
                for (const item of container.children) {
                    result.push(item);
                    if (item instanceof Container && item.length) {
                        concatArray(result, cascade(item));
                    }
                }
                return result;
            }
            return cascade(this);
        }
        get children() {
            return this._children;
        }
        get length() {
            return this._children.length;
        }
    }

    const STRING_HEX = '0123456789ABCDEF';
    const REGEXP_HEX = /[A-Za-z\d]{3,}/;
    const REGEXP_RGBA = /rgba?\((\d+), (\d+), (\d+)(?:, ([\d.]+))?\)/;
    const CACHE_COLORDATA = {};
    const COLOR_CSS3 = [
        {
            value: '#000000',
            name: 'black',
            rgb: {
                r: 0,
                g: 0,
                b: 0
            },
            hsl: {
                h: 0,
                s: 0,
                l: 0
            }
        },
        {
            value: '#696969',
            name: 'dimgray',
            rgb: {
                r: 105,
                g: 105,
                b: 105
            },
            hsl: {
                h: 0,
                s: 0,
                l: 41
            }
        },
        {
            value: '#696969',
            name: 'dimgrey',
            rgb: {
                r: 105,
                g: 105,
                b: 105
            },
            hsl: {
                h: 0,
                s: 0,
                l: 41
            }
        },
        {
            value: '#808080',
            name: 'gray',
            rgb: {
                r: 128,
                g: 128,
                b: 128
            },
            hsl: {
                h: 0,
                s: 0,
                l: 50
            }
        },
        {
            value: '#808080',
            name: 'grey',
            rgb: {
                r: 128,
                g: 128,
                b: 128
            },
            hsl: {
                h: 0,
                s: 0,
                l: 50
            }
        },
        {
            value: '#A9A9A9',
            name: 'darkgray',
            rgb: {
                r: 169,
                g: 169,
                b: 169
            },
            hsl: {
                h: 0,
                s: 0,
                l: 66
            }
        },
        {
            value: '#A9A9A9',
            name: 'darkgrey',
            rgb: {
                r: 169,
                g: 169,
                b: 169
            },
            hsl: {
                h: 0,
                s: 0,
                l: 66
            }
        },
        {
            value: '#C0C0C0',
            name: 'silver',
            rgb: {
                r: 192,
                g: 192,
                b: 192
            },
            hsl: {
                h: 0,
                s: 0,
                l: 75
            }
        },
        {
            value: '#D3D3D3',
            name: 'lightgray',
            rgb: {
                r: 211,
                g: 211,
                b: 211
            },
            hsl: {
                h: 0,
                s: 0,
                l: 83
            }
        },
        {
            value: '#D3D3D3',
            name: 'lightgrey',
            rgb: {
                r: 211,
                g: 211,
                b: 211
            },
            hsl: {
                h: 0,
                s: 0,
                l: 83
            }
        },
        {
            value: '#DCDCDC',
            name: 'gainsboro',
            rgb: {
                r: 220,
                g: 220,
                b: 220
            },
            hsl: {
                h: 0,
                s: 0,
                l: 86
            }
        },
        {
            value: '#F5F5F5',
            name: 'whitesmoke',
            rgb: {
                r: 245,
                g: 245,
                b: 245
            },
            hsl: {
                h: 0,
                s: 0,
                l: 96
            }
        },
        {
            value: '#FFFFFF',
            name: 'white',
            rgb: {
                r: 255,
                g: 255,
                b: 255
            },
            hsl: {
                h: 0,
                s: 0,
                l: 100
            }
        },
        {
            value: '#BC8F8F',
            name: 'rosybrown',
            rgb: {
                r: 188,
                g: 143,
                b: 143
            },
            hsl: {
                h: 0,
                s: 25,
                l: 65
            }
        },
        {
            value: '#CD5C5C',
            name: 'indianred',
            rgb: {
                r: 205,
                g: 92,
                b: 92
            },
            hsl: {
                h: 0,
                s: 53,
                l: 58
            }
        },
        {
            value: '#A52A2A',
            name: 'brown',
            rgb: {
                r: 165,
                g: 42,
                b: 42
            },
            hsl: {
                h: 0,
                s: 59,
                l: 41
            }
        },
        {
            value: '#B22222',
            name: 'firebrick',
            rgb: {
                r: 178,
                g: 34,
                b: 34
            },
            hsl: {
                h: 0,
                s: 68,
                l: 42
            }
        },
        {
            value: '#F08080',
            name: 'lightcoral',
            rgb: {
                r: 240,
                g: 128,
                b: 128
            },
            hsl: {
                h: 0,
                s: 79,
                l: 72
            }
        },
        {
            value: '#800000',
            name: 'maroon',
            rgb: {
                r: 128,
                g: 0,
                b: 0
            },
            hsl: {
                h: 0,
                s: 100,
                l: 25
            }
        },
        {
            value: '#8B0000',
            name: 'darkred',
            rgb: {
                r: 139,
                g: 0,
                b: 0
            },
            hsl: {
                h: 0,
                s: 100,
                l: 27
            }
        },
        {
            value: '#FF0000',
            name: 'red',
            rgb: {
                r: 255,
                g: 0,
                b: 0
            },
            hsl: {
                h: 0,
                s: 100,
                l: 50
            }
        },
        {
            value: '#FFFAFA',
            name: 'snow',
            rgb: {
                r: 255,
                g: 250,
                b: 250
            },
            hsl: {
                h: 0,
                s: 100,
                l: 99
            }
        },
        {
            value: '#FFE4E1',
            name: 'mistyrose',
            rgb: {
                r: 255,
                g: 228,
                b: 225
            },
            hsl: {
                h: 6,
                s: 100,
                l: 94
            }
        },
        {
            value: '#FA8072',
            name: 'salmon',
            rgb: {
                r: 250,
                g: 128,
                b: 114
            },
            hsl: {
                h: 6,
                s: 93,
                l: 71
            }
        },
        {
            value: '#FF6347',
            name: 'tomato',
            rgb: {
                r: 255,
                g: 99,
                b: 71
            },
            hsl: {
                h: 9,
                s: 100,
                l: 64
            }
        },
        {
            value: '#E9967A',
            name: 'darksalmon',
            rgb: {
                r: 233,
                g: 150,
                b: 122
            },
            hsl: {
                h: 15,
                s: 72,
                l: 70
            }
        },
        {
            value: '#FF7F50',
            name: 'coral',
            rgb: {
                r: 255,
                g: 127,
                b: 80
            },
            hsl: {
                h: 16,
                s: 100,
                l: 66
            }
        },
        {
            value: '#FF4500',
            name: 'orangered',
            rgb: {
                r: 255,
                g: 69,
                b: 0
            },
            hsl: {
                h: 16,
                s: 100,
                l: 50
            }
        },
        {
            value: '#FFA07A',
            name: 'lightsalmon',
            rgb: {
                r: 255,
                g: 160,
                b: 122
            },
            hsl: {
                h: 17,
                s: 100,
                l: 74
            }
        },
        {
            value: '#A0522D',
            name: 'sienna',
            rgb: {
                r: 160,
                g: 82,
                b: 45
            },
            hsl: {
                h: 19,
                s: 56,
                l: 40
            }
        },
        {
            value: '#FFF5EE',
            name: 'seashell',
            rgb: {
                r: 255,
                g: 245,
                b: 238
            },
            hsl: {
                h: 25,
                s: 100,
                l: 97
            }
        },
        {
            value: '#D2691E',
            name: 'chocolate',
            rgb: {
                r: 210,
                g: 105,
                b: 30
            },
            hsl: {
                h: 25,
                s: 75,
                l: 47
            }
        },
        {
            value: '#8B4513',
            name: 'saddlebrown',
            rgb: {
                r: 139,
                g: 69,
                b: 19
            },
            hsl: {
                h: 25,
                s: 76,
                l: 31
            }
        },
        {
            value: '#F4A460',
            name: 'sandybrown',
            rgb: {
                r: 244,
                g: 164,
                b: 96
            },
            hsl: {
                h: 28,
                s: 87,
                l: 67
            }
        },
        {
            value: '#FFDAB9',
            name: 'peachpuff',
            rgb: {
                r: 255,
                g: 218,
                b: 185
            },
            hsl: {
                h: 28,
                s: 100,
                l: 86
            }
        },
        {
            value: '#CD853F',
            name: 'peru',
            rgb: {
                r: 205,
                g: 133,
                b: 63
            },
            hsl: {
                h: 30,
                s: 59,
                l: 53
            }
        },
        {
            value: '#FAF0E6',
            name: 'linen',
            rgb: {
                r: 250,
                g: 240,
                b: 230
            },
            hsl: {
                h: 30,
                s: 67,
                l: 94
            }
        },
        {
            value: '#FFE4C4',
            name: 'bisque',
            rgb: {
                r: 255,
                g: 228,
                b: 196
            },
            hsl: {
                h: 33,
                s: 100,
                l: 88
            }
        },
        {
            value: '#FF8C00',
            name: 'darkorange',
            rgb: {
                r: 255,
                g: 140,
                b: 0
            },
            hsl: {
                h: 33,
                s: 100,
                l: 50
            }
        },
        {
            value: '#DEB887',
            name: 'burlywood',
            rgb: {
                r: 222,
                g: 184,
                b: 135
            },
            hsl: {
                h: 34,
                s: 57,
                l: 70
            }
        },
        {
            value: '#FAEBD7',
            name: 'antiquewhite',
            rgb: {
                r: 250,
                g: 235,
                b: 215
            },
            hsl: {
                h: 34,
                s: 78,
                l: 91
            }
        },
        {
            value: '#D2B48C',
            name: 'tan',
            rgb: {
                r: 210,
                g: 180,
                b: 140
            },
            hsl: {
                h: 34,
                s: 44,
                l: 69
            }
        },
        {
            value: '#FFDEAD',
            name: 'navajowhite',
            rgb: {
                r: 255,
                g: 222,
                b: 173
            },
            hsl: {
                h: 36,
                s: 100,
                l: 84
            }
        },
        {
            value: '#FFEBCD',
            name: 'blanchedalmond',
            rgb: {
                r: 255,
                g: 235,
                b: 205
            },
            hsl: {
                h: 36,
                s: 100,
                l: 90
            }
        },
        {
            value: '#FFEFD5',
            name: 'papayawhip',
            rgb: {
                r: 255,
                g: 239,
                b: 213
            },
            hsl: {
                h: 37,
                s: 100,
                l: 92
            }
        },
        {
            value: '#FFE4B5',
            name: 'moccasin',
            rgb: {
                r: 255,
                g: 228,
                b: 181
            },
            hsl: {
                h: 38,
                s: 100,
                l: 85
            }
        },
        {
            value: '#FFA500',
            name: 'orange',
            rgb: {
                r: 255,
                g: 165,
                b: 0
            },
            hsl: {
                h: 39,
                s: 100,
                l: 50
            }
        },
        {
            value: '#F5DEB3',
            name: 'wheat',
            rgb: {
                r: 245,
                g: 222,
                b: 179
            },
            hsl: {
                h: 39,
                s: 77,
                l: 83
            }
        },
        {
            value: '#FDF5E6',
            name: 'oldlace',
            rgb: {
                r: 253,
                g: 245,
                b: 230
            },
            hsl: {
                h: 39,
                s: 85,
                l: 95
            }
        },
        {
            value: '#FFFAF0',
            name: 'floralwhite',
            rgb: {
                r: 255,
                g: 250,
                b: 240
            },
            hsl: {
                h: 40,
                s: 100,
                l: 97
            }
        },
        {
            value: '#B8860B',
            name: 'darkgoldenrod',
            rgb: {
                r: 184,
                g: 134,
                b: 11
            },
            hsl: {
                h: 43,
                s: 89,
                l: 38
            }
        },
        {
            value: '#DAA520',
            name: 'goldenrod',
            rgb: {
                r: 218,
                g: 165,
                b: 32
            },
            hsl: {
                h: 43,
                s: 74,
                l: 49
            }
        },
        {
            value: '#FFF8DC',
            name: 'cornsilk',
            rgb: {
                r: 255,
                g: 248,
                b: 220
            },
            hsl: {
                h: 48,
                s: 100,
                l: 93
            }
        },
        {
            value: '#FFD700',
            name: 'gold',
            rgb: {
                r: 255,
                g: 215,
                b: 0
            },
            hsl: {
                h: 51,
                s: 100,
                l: 50
            }
        },
        {
            value: '#FFFACD',
            name: 'lemonchiffon',
            rgb: {
                r: 255,
                g: 250,
                b: 205
            },
            hsl: {
                h: 54,
                s: 100,
                l: 90
            }
        },
        {
            value: '#F0E68C',
            name: 'khaki',
            rgb: {
                r: 240,
                g: 230,
                b: 140
            },
            hsl: {
                h: 54,
                s: 77,
                l: 75
            }
        },
        {
            value: '#EEE8AA',
            name: 'palegoldenrod',
            rgb: {
                r: 238,
                g: 232,
                b: 170
            },
            hsl: {
                h: 55,
                s: 67,
                l: 80
            }
        },
        {
            value: '#BDB76B',
            name: 'darkkhaki',
            rgb: {
                r: 189,
                g: 183,
                b: 107
            },
            hsl: {
                h: 56,
                s: 38,
                l: 58
            }
        },
        {
            value: '#F5F5DC',
            name: 'beige',
            rgb: {
                r: 245,
                g: 245,
                b: 220
            },
            hsl: {
                h: 60,
                s: 56,
                l: 91
            }
        },
        {
            value: '#FAFAD2',
            name: 'lightgoldenrodyellow',
            rgb: {
                r: 250,
                g: 250,
                b: 210
            },
            hsl: {
                h: 60,
                s: 80,
                l: 90
            }
        },
        {
            value: '#808000',
            name: 'olive',
            rgb: {
                r: 128,
                g: 128,
                b: 0
            },
            hsl: {
                h: 60,
                s: 100,
                l: 25
            }
        },
        {
            value: '#FFFF00',
            name: 'yellow',
            rgb: {
                r: 255,
                g: 255,
                b: 0
            },
            hsl: {
                h: 60,
                s: 100,
                l: 50
            }
        },
        {
            value: '#FFFFE0',
            name: 'lightyellow',
            rgb: {
                r: 255,
                g: 255,
                b: 224
            },
            hsl: {
                h: 60,
                s: 100,
                l: 94
            }
        },
        {
            value: '#FFFFF0',
            name: 'ivory',
            rgb: {
                r: 255,
                g: 255,
                b: 240
            },
            hsl: {
                h: 60,
                s: 100,
                l: 97
            }
        },
        {
            value: '#6B8E23',
            name: 'olivedrab',
            rgb: {
                r: 107,
                g: 142,
                b: 35
            },
            hsl: {
                h: 80,
                s: 60,
                l: 35
            }
        },
        {
            value: '#9ACD32',
            name: 'yellowgreen',
            rgb: {
                r: 154,
                g: 205,
                b: 50
            },
            hsl: {
                h: 80,
                s: 61,
                l: 50
            }
        },
        {
            value: '#556B2F',
            name: 'darkolivegreen',
            rgb: {
                r: 85,
                g: 107,
                b: 47
            },
            hsl: {
                h: 82,
                s: 39,
                l: 30
            }
        },
        {
            value: '#ADFF2F',
            name: 'greenyellow',
            rgb: {
                r: 173,
                g: 255,
                b: 47
            },
            hsl: {
                h: 84,
                s: 100,
                l: 59
            }
        },
        {
            value: '#7FFF00',
            name: 'chartreuse',
            rgb: {
                r: 127,
                g: 255,
                b: 0
            },
            hsl: {
                h: 90,
                s: 100,
                l: 50
            }
        },
        {
            value: '#7CFC00',
            name: 'lawngreen',
            rgb: {
                r: 124,
                g: 252,
                b: 0
            },
            hsl: {
                h: 90,
                s: 100,
                l: 49
            }
        },
        {
            value: '#8FBC8F',
            name: 'darkseagreen',
            rgb: {
                r: 143,
                g: 188,
                b: 143
            },
            hsl: {
                h: 120,
                s: 25,
                l: 65
            }
        },
        {
            value: '#228B22',
            name: 'forestgreen',
            rgb: {
                r: 34,
                g: 139,
                b: 34
            },
            hsl: {
                h: 120,
                s: 61,
                l: 34
            }
        },
        {
            value: '#32CD32',
            name: 'limegreen',
            rgb: {
                r: 50,
                g: 205,
                b: 50
            },
            hsl: {
                h: 120,
                s: 61,
                l: 50
            }
        },
        {
            value: '#90EE90',
            name: 'lightgreen',
            rgb: {
                r: 144,
                g: 238,
                b: 144
            },
            hsl: {
                h: 120,
                s: 73,
                l: 75
            }
        },
        {
            value: '#98FB98',
            name: 'palegreen',
            rgb: {
                r: 152,
                g: 251,
                b: 152
            },
            hsl: {
                h: 120,
                s: 93,
                l: 79
            }
        },
        {
            value: '#006400',
            name: 'darkgreen',
            rgb: {
                r: 0,
                g: 100,
                b: 0
            },
            hsl: {
                h: 120,
                s: 100,
                l: 20
            }
        },
        {
            value: '#008000',
            name: 'green',
            rgb: {
                r: 0,
                g: 128,
                b: 0
            },
            hsl: {
                h: 120,
                s: 100,
                l: 25
            }
        },
        {
            value: '#00FF00',
            name: 'lime',
            rgb: {
                r: 0,
                g: 255,
                b: 0
            },
            hsl: {
                h: 120,
                s: 100,
                l: 50
            }
        },
        {
            value: '#F0FFF0',
            name: 'honeydew',
            rgb: {
                r: 240,
                g: 255,
                b: 240
            },
            hsl: {
                h: 120,
                s: 100,
                l: 97
            }
        },
        {
            value: '#2E8B57',
            name: 'seagreen',
            rgb: {
                r: 46,
                g: 139,
                b: 87
            },
            hsl: {
                h: 146,
                s: 50,
                l: 36
            }
        },
        {
            value: '#3CB371',
            name: 'mediumseagreen',
            rgb: {
                r: 60,
                g: 179,
                b: 113
            },
            hsl: {
                h: 147,
                s: 50,
                l: 47
            }
        },
        {
            value: '#00FF7F',
            name: 'springgreen',
            rgb: {
                r: 0,
                g: 255,
                b: 127
            },
            hsl: {
                h: 150,
                s: 100,
                l: 50
            }
        },
        {
            value: '#F5FFFA',
            name: 'mintcream',
            rgb: {
                r: 245,
                g: 255,
                b: 250
            },
            hsl: {
                h: 150,
                s: 100,
                l: 98
            }
        },
        {
            value: '#00FA9A',
            name: 'mediumspringgreen',
            rgb: {
                r: 0,
                g: 250,
                b: 154
            },
            hsl: {
                h: 157,
                s: 100,
                l: 49
            }
        },
        {
            value: '#66CDAA',
            name: 'mediumaquamarine',
            rgb: {
                r: 102,
                g: 205,
                b: 170
            },
            hsl: {
                h: 160,
                s: 51,
                l: 60
            }
        },
        {
            value: '#7FFFD4',
            name: 'aquamarine',
            rgb: {
                r: 127,
                g: 255,
                b: 212
            },
            hsl: {
                h: 160,
                s: 100,
                l: 75
            }
        },
        {
            value: '#40E0D0',
            name: 'turquoise',
            rgb: {
                r: 64,
                g: 224,
                b: 208
            },
            hsl: {
                h: 174,
                s: 72,
                l: 56
            }
        },
        {
            value: '#20B2AA',
            name: 'lightseagreen',
            rgb: {
                r: 32,
                g: 178,
                b: 170
            },
            hsl: {
                h: 177,
                s: 70,
                l: 41
            }
        },
        {
            value: '#48D1CC',
            name: 'mediumturquoise',
            rgb: {
                r: 72,
                g: 209,
                b: 204
            },
            hsl: {
                h: 178,
                s: 60,
                l: 55
            }
        },
        {
            value: '#2F4F4F',
            name: 'darkslategray',
            rgb: {
                r: 47,
                g: 79,
                b: 79
            },
            hsl: {
                h: 180,
                s: 25,
                l: 25
            }
        },
        {
            value: '#2F4F4F',
            name: 'darkslategrey',
            rgb: {
                r: 47,
                g: 79,
                b: 79
            },
            hsl: {
                h: 180,
                s: 25,
                l: 25
            }
        },
        {
            value: '#AFEEEE',
            name: 'paleturquoise',
            rgb: {
                r: 175,
                g: 238,
                b: 238
            },
            hsl: {
                h: 180,
                s: 65,
                l: 81
            }
        },
        {
            value: '#008080',
            name: 'teal',
            rgb: {
                r: 0,
                g: 128,
                b: 128
            },
            hsl: {
                h: 180,
                s: 100,
                l: 25
            }
        },
        {
            value: '#008B8B',
            name: 'darkcyan',
            rgb: {
                r: 0,
                g: 139,
                b: 139
            },
            hsl: {
                h: 180,
                s: 100,
                l: 27
            }
        },
        {
            value: '#00FFFF',
            name: 'aqua',
            rgb: {
                r: 0,
                g: 255,
                b: 255
            },
            hsl: {
                h: 180,
                s: 100,
                l: 50
            }
        },
        {
            value: '#00FFFF',
            name: 'cyan',
            rgb: {
                r: 0,
                g: 255,
                b: 255
            },
            hsl: {
                h: 180,
                s: 100,
                l: 50
            }
        },
        {
            value: '#E0FFFF',
            name: 'lightcyan',
            rgb: {
                r: 224,
                g: 255,
                b: 255
            },
            hsl: {
                h: 180,
                s: 100,
                l: 94
            }
        },
        {
            value: '#F0FFFF',
            name: 'azure',
            rgb: {
                r: 240,
                g: 255,
                b: 255
            },
            hsl: {
                h: 180,
                s: 100,
                l: 97
            }
        },
        {
            value: '#00CED1',
            name: 'darkturquoise',
            rgb: {
                r: 0,
                g: 206,
                b: 209
            },
            hsl: {
                h: 181,
                s: 100,
                l: 41
            }
        },
        {
            value: '#5F9EA0',
            name: 'cadetblue',
            rgb: {
                r: 95,
                g: 158,
                b: 160
            },
            hsl: {
                h: 182,
                s: 25,
                l: 50
            }
        },
        {
            value: '#B0E0E6',
            name: 'powderblue',
            rgb: {
                r: 176,
                g: 224,
                b: 230
            },
            hsl: {
                h: 187,
                s: 52,
                l: 80
            }
        },
        {
            value: '#ADD8E6',
            name: 'lightblue',
            rgb: {
                r: 173,
                g: 216,
                b: 230
            },
            hsl: {
                h: 195,
                s: 53,
                l: 79
            }
        },
        {
            value: '#00BFFF',
            name: 'deepskyblue',
            rgb: {
                r: 0,
                g: 191,
                b: 255
            },
            hsl: {
                h: 195,
                s: 100,
                l: 50
            }
        },
        {
            value: '#87CEEB',
            name: 'skyblue',
            rgb: {
                r: 135,
                g: 206,
                b: 235
            },
            hsl: {
                h: 197,
                s: 71,
                l: 73
            }
        },
        {
            value: '#87CEFA',
            name: 'lightskyblue',
            rgb: {
                r: 135,
                g: 206,
                b: 250
            },
            hsl: {
                h: 203,
                s: 92,
                l: 75
            }
        },
        {
            value: '#4682B4',
            name: 'steelblue',
            rgb: {
                r: 70,
                g: 130,
                b: 180
            },
            hsl: {
                h: 207,
                s: 44,
                l: 49
            }
        },
        {
            value: '#F0F8FF',
            name: 'aliceblue',
            rgb: {
                r: 240,
                g: 248,
                b: 255
            },
            hsl: {
                h: 208,
                s: 100,
                l: 97
            }
        },
        {
            value: '#1E90FF',
            name: 'dodgerblue',
            rgb: {
                r: 30,
                g: 144,
                b: 255
            },
            hsl: {
                h: 210,
                s: 100,
                l: 56
            }
        },
        {
            value: '#708090',
            name: 'slategray',
            rgb: {
                r: 112,
                g: 128,
                b: 144
            },
            hsl: {
                h: 210,
                s: 13,
                l: 50
            }
        },
        {
            value: '#708090',
            name: 'slategrey',
            rgb: {
                r: 112,
                g: 128,
                b: 144
            },
            hsl: {
                h: 210,
                s: 13,
                l: 50
            }
        },
        {
            value: '#778899',
            name: 'lightslategray',
            rgb: {
                r: 119,
                g: 136,
                b: 153
            },
            hsl: {
                h: 210,
                s: 14,
                l: 53
            }
        },
        {
            value: '#778899',
            name: 'lightslategrey',
            rgb: {
                r: 119,
                g: 136,
                b: 153
            },
            hsl: {
                h: 210,
                s: 14,
                l: 53
            }
        },
        {
            value: '#B0C4DE',
            name: 'lightsteelblue',
            rgb: {
                r: 176,
                g: 196,
                b: 222
            },
            hsl: {
                h: 214,
                s: 41,
                l: 78
            }
        },
        {
            value: '#6495ED',
            name: 'cornflower',
            rgb: {
                r: 100,
                g: 149,
                b: 237
            },
            hsl: {
                h: 219,
                s: 79,
                l: 66
            }
        },
        {
            value: '#4169E1',
            name: 'royalblue',
            rgb: {
                r: 65,
                g: 105,
                b: 225
            },
            hsl: {
                h: 225,
                s: 73,
                l: 57
            }
        },
        {
            value: '#191970',
            name: 'midnightblue',
            rgb: {
                r: 25,
                g: 25,
                b: 112
            },
            hsl: {
                h: 240,
                s: 64,
                l: 27
            }
        },
        {
            value: '#E6E6FA',
            name: 'lavender',
            rgb: {
                r: 230,
                g: 230,
                b: 250
            },
            hsl: {
                h: 240,
                s: 67,
                l: 94
            }
        },
        {
            value: '#000080',
            name: 'navy',
            rgb: {
                r: 0,
                g: 0,
                b: 128
            },
            hsl: {
                h: 240,
                s: 100,
                l: 25
            }
        },
        {
            value: '#00008B',
            name: 'darkblue',
            rgb: {
                r: 0,
                g: 0,
                b: 139
            },
            hsl: {
                h: 240,
                s: 100,
                l: 27
            }
        },
        {
            value: '#0000CD',
            name: 'mediumblue',
            rgb: {
                r: 0,
                g: 0,
                b: 205
            },
            hsl: {
                h: 240,
                s: 100,
                l: 40
            }
        },
        {
            value: '#0000FF',
            name: 'blue',
            rgb: {
                r: 0,
                g: 0,
                b: 255
            },
            hsl: {
                h: 240,
                s: 100,
                l: 50
            }
        },
        {
            value: '#F8F8FF',
            name: 'ghostwhite',
            rgb: {
                r: 248,
                g: 248,
                b: 255
            },
            hsl: {
                h: 240,
                s: 100,
                l: 99
            }
        },
        {
            value: '#6A5ACD',
            name: 'slateblue',
            rgb: {
                r: 106,
                g: 90,
                b: 205
            },
            hsl: {
                h: 248,
                s: 53,
                l: 58
            }
        },
        {
            value: '#483D8B',
            name: 'darkslateblue',
            rgb: {
                r: 72,
                g: 61,
                b: 139
            },
            hsl: {
                h: 248,
                s: 39,
                l: 39
            }
        },
        {
            value: '#7B68EE',
            name: 'mediumslateblue',
            rgb: {
                r: 123,
                g: 104,
                b: 238
            },
            hsl: {
                h: 249,
                s: 80,
                l: 67
            }
        },
        {
            value: '#9370DB',
            name: 'mediumpurple',
            rgb: {
                r: 147,
                g: 112,
                b: 219
            },
            hsl: {
                h: 260,
                s: 60,
                l: 65
            }
        },
        {
            value: '#8A2BE2',
            name: 'blueviolet',
            rgb: {
                r: 138,
                g: 43,
                b: 226
            },
            hsl: {
                h: 271,
                s: 76,
                l: 53
            }
        },
        {
            value: '#4B0082',
            name: 'indigo',
            rgb: {
                r: 75,
                g: 0,
                b: 130
            },
            hsl: {
                h: 275,
                s: 100,
                l: 25
            }
        },
        {
            value: '#9932CC',
            name: 'darkorchid',
            rgb: {
                r: 153,
                g: 50,
                b: 204
            },
            hsl: {
                h: 280,
                s: 61,
                l: 50
            }
        },
        {
            value: '#9400D3',
            name: 'darkviolet',
            rgb: {
                r: 148,
                g: 0,
                b: 211
            },
            hsl: {
                h: 282,
                s: 100,
                l: 41
            }
        },
        {
            value: '#BA55D3',
            name: 'mediumorchid',
            rgb: {
                r: 186,
                g: 85,
                b: 211
            },
            hsl: {
                h: 288,
                s: 59,
                l: 58
            }
        },
        {
            value: '#D8BFD8',
            name: 'thistle',
            rgb: {
                r: 216,
                g: 191,
                b: 216
            },
            hsl: {
                h: 300,
                s: 24,
                l: 80
            }
        },
        {
            value: '#DDA0DD',
            name: 'plum',
            rgb: {
                r: 221,
                g: 160,
                b: 221
            },
            hsl: {
                h: 300,
                s: 47,
                l: 75
            }
        },
        {
            value: '#EE82EE',
            name: 'violet',
            rgb: {
                r: 238,
                g: 130,
                b: 238
            },
            hsl: {
                h: 300,
                s: 76,
                l: 72
            }
        },
        {
            value: '#800080',
            name: 'purple',
            rgb: {
                r: 128,
                g: 0,
                b: 128
            },
            hsl: {
                h: 300,
                s: 100,
                l: 25
            }
        },
        {
            value: '#8B008B',
            name: 'darkmagenta',
            rgb: {
                r: 139,
                g: 0,
                b: 139
            },
            hsl: {
                h: 300,
                s: 100,
                l: 27
            }
        },
        {
            value: '#FF00FF',
            name: 'fuchsia',
            rgb: {
                r: 255,
                g: 0,
                b: 255
            },
            hsl: {
                h: 300,
                s: 100,
                l: 50
            }
        },
        {
            value: '#FF00FF',
            name: 'magenta',
            rgb: {
                r: 255,
                g: 0,
                b: 255
            },
            hsl: {
                h: 300,
                s: 100,
                l: 50
            }
        },
        {
            value: '#DA70D6',
            name: 'orchid',
            rgb: {
                r: 218,
                g: 112,
                b: 214
            },
            hsl: {
                h: 302,
                s: 59,
                l: 65
            }
        },
        {
            value: '#C71585',
            name: 'mediumvioletred',
            rgb: {
                r: 199,
                g: 21,
                b: 133
            },
            hsl: {
                h: 322,
                s: 81,
                l: 43
            }
        },
        {
            value: '#FF1493',
            name: 'deeppink',
            rgb: {
                r: 255,
                g: 20,
                b: 147
            },
            hsl: {
                h: 328,
                s: 100,
                l: 54
            }
        },
        {
            value: '#FF69B4',
            name: 'hotpink',
            rgb: {
                r: 255,
                g: 105,
                b: 180
            },
            hsl: {
                h: 330,
                s: 100,
                l: 71
            }
        },
        {
            value: '#FFF0F5',
            name: 'lavenderblush',
            rgb: {
                r: 255,
                g: 240,
                b: 245
            },
            hsl: {
                h: 340,
                s: 100,
                l: 97
            }
        },
        {
            value: '#DB7093',
            name: 'palevioletred',
            rgb: {
                r: 219,
                g: 112,
                b: 147
            },
            hsl: {
                h: 340,
                s: 60,
                l: 65
            }
        },
        {
            value: '#DC143C',
            name: 'crimson',
            rgb: {
                r: 220,
                g: 20,
                b: 60
            },
            hsl: {
                h: 348,
                s: 83,
                l: 47
            }
        },
        {
            value: '#FFC0CB',
            name: 'pink',
            rgb: {
                r: 255,
                g: 192,
                b: 203
            },
            hsl: {
                h: 350,
                s: 100,
                l: 88
            }
        },
        {
            value: '#FFB6C1',
            name: 'lightpink',
            rgb: {
                r: 255,
                g: 182,
                b: 193
            },
            hsl: {
                h: 351,
                s: 100,
                l: 86
            }
        }
    ];
    for (const color of COLOR_CSS3) {
        Object.freeze(color);
    }
    const parseOpacity = (value) => parseFloat(value.trim() || '1') * 255;
    function findColorName(value) {
        for (const color of COLOR_CSS3) {
            if (color.name === value.toLowerCase()) {
                return color;
            }
        }
        return undefined;
    }
    function findColorShade(value) {
        const rgba = parseRGBA(value);
        if (rgba) {
            const hsl = convertHSLA(rgba);
            const result = [];
            let baseline = -1;
            for (const color of COLOR_CSS3) {
                if (color.value === value) {
                    return color;
                }
                else if (baseline !== -1) {
                    if (baseline === color.hsl.h) {
                        result.push(color);
                    }
                }
                else if (hsl.h >= color.hsl.h) {
                    result.push(color);
                    baseline = color.hsl.h;
                }
            }
            if (result.length === 1) {
                return result[0];
            }
            else if (result.length > 1) {
                const total = hsl.l + hsl.s;
                const combined = [];
                for (const color of result) {
                    combined.push(Math.abs(total - (color.hsl.l + color.hsl.s)));
                }
                let nearest = Number.POSITIVE_INFINITY;
                let index = -1;
                for (let i = 0; i < combined.length; i++) {
                    if (combined[i] < nearest) {
                        nearest = combined[i];
                        index = i;
                    }
                }
                return result[index];
            }
            else {
                return COLOR_CSS3[COLOR_CSS3.length - 1];
            }
        }
        return undefined;
    }
    function parseColor(value, opacity = '1', transparency = false) {
        if (value && (value !== 'transparent' || transparency)) {
            if (CACHE_COLORDATA[value]) {
                return CACHE_COLORDATA[value];
            }
            let name = '';
            let rgba;
            if (value.charAt(0) === '#') {
                rgba = parseRGBA(value);
            }
            else if (value.startsWith('rgb')) {
                const match = value.match(REGEXP_RGBA);
                if (match) {
                    rgba = {
                        r: parseInt(match[1]),
                        g: parseInt(match[2]),
                        b: parseInt(match[3]),
                        a: match[4] ? parseFloat(match[4]) * 255 : parseOpacity(opacity)
                    };
                }
            }
            else {
                switch (value) {
                    case 'transparent':
                        rgba = { r: 0, g: 0, b: 0, a: 0 };
                        name = 'transparent';
                        break;
                    case 'initial':
                        rgba = { r: 0, g: 0, b: 0, a: 255 };
                        name = 'black';
                        break;
                    default:
                        const color = findColorName(value);
                        if (color) {
                            rgba = Object.assign({}, color.rgb, { a: parseOpacity(opacity) });
                            name = value;
                        }
                        break;
                }
            }
            if (rgba && (rgba.a > 0 || transparency)) {
                const hexAsString = getHexCode(rgba.r, rgba.g, rgba.b);
                const alphaAsString = getHexCode(rgba.a);
                const alpha = rgba.a / 255;
                CACHE_COLORDATA[value] = {
                    name,
                    value: `#${hexAsString}`,
                    valueAsRGBA: `#${hexAsString + alphaAsString}`,
                    valueAsARGB: `#${alphaAsString + hexAsString}`,
                    rgba,
                    hsl: convertHSLA(rgba),
                    opacity: alpha,
                    semiopaque: alpha > 0 && alpha < 1,
                    transparent: alpha === 0
                };
                Object.freeze(CACHE_COLORDATA[value]);
                return CACHE_COLORDATA[value];
            }
        }
        return undefined;
    }
    function reduceColor(value, percent) {
        const rgba = parseRGBA(value);
        if (rgba) {
            const base = percent < 0 ? 0 : 255;
            percent = Math.abs(percent);
            return parseColor(formatRGBA({
                r: (rgba.r + Math.round((base - rgba.r) * percent)) % 255,
                g: (rgba.g + Math.round((base - rgba.g) * percent)) % 255,
                b: (rgba.b + Math.round((base - rgba.b) * percent)) % 255,
                a: rgba.a
            }));
        }
        return undefined;
    }
    function getHexCode(...values) {
        let output = '';
        for (const value of values) {
            const rgb = Math.max(0, Math.min(value, 255));
            output += isNaN(rgb) ? '00' : STRING_HEX.charAt((rgb - (rgb % 16)) / 16) + STRING_HEX.charAt(rgb % 16);
        }
        return output;
    }
    function convertHex(value) {
        return `#${getHexCode(value.r, value.g, value.b) + (value.a < 255 ? getHexCode(value.a) : '')}`;
    }
    function parseRGBA(value) {
        value = value.replace(/#/g, '').trim();
        if (REGEXP_HEX.test(value)) {
            let a = 255;
            switch (value.length) {
                case 4:
                    a = parseInt(value.charAt(3).repeat(2), 16);
                case 3:
                    value = value.charAt(0).repeat(2) + value.charAt(1).repeat(2) + value.charAt(2).repeat(2);
                    break;
                case 5:
                    value += value.charAt(4);
                    break;
                default:
                    if (value.length >= 8) {
                        a = parseInt(value.substring(6, 8), 16);
                    }
                    value = value.substring(0, 6);
                    break;
            }
            if (value.length === 6) {
                return {
                    r: parseInt(value.substring(0, 2), 16),
                    g: parseInt(value.substring(2, 4), 16),
                    b: parseInt(value.substring(4), 16),
                    a
                };
            }
        }
        return undefined;
    }
    function convertHSLA(value) {
        const r = value.r / 255;
        const g = value.g / 255;
        const b = value.b / 255;
        const min = Math.min(r, g, b);
        const max = Math.max(r, g, b);
        let h = (max + min) / 2;
        let s = h;
        const l = h;
        if (max === min) {
            h = 0;
            s = 0;
        }
        else {
            const d = max - min;
            s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
            switch (max) {
                case r:
                    h = (g - b) / d + (g < b ? 6 : 0);
                    break;
                case g:
                    h = (b - r) / d + 2;
                    break;
                case b:
                    h = (r - g) / d + 4;
                    break;
            }
            h /= 6;
        }
        return {
            h: Math.round(h * 360),
            s: Math.round(s * 100),
            l: Math.round(l * 100),
            a: value.a / 255
        };
    }
    function formatRGBA(value) {
        return `rgb${value.a < 255 ? 'a' : ''}(${value.r}, ${value.g}, ${value.b}${value.a < 255 ? `, ${(value.a / 255).toPrecision(2)}` : ''})`;
    }
    function formatHSLA(value) {
        return `hsl${value.a < 255 ? 'a' : ''}(${value.h}, ${value.s}%, ${value.l}%${value.a < 255 ? `, ${(value.a / 255).toPrecision(2)}` : ''})`;
    }

    var color = /*#__PURE__*/Object.freeze({
        findColorName: findColorName,
        findColorShade: findColorShade,
        parseColor: parseColor,
        reduceColor: reduceColor,
        getHexCode: getHexCode,
        convertHex: convertHex,
        parseRGBA: parseRGBA,
        convertHSLA: convertHSLA,
        formatRGBA: formatRGBA,
        formatHSLA: formatHSLA
    });

    function isLineBreak(element, sessionId) {
        if (element.tagName === 'BR') {
            return true;
        }
        else {
            const node = getElementAsNode(element, sessionId);
            if (node) {
                return node.excluded && node.blockStatic;
            }
        }
        return false;
    }
    function setElementCache(element, attr, sessionId, data) {
        element[`__${attr}::${sessionId}`] = data;
    }
    function getElementCache(element, attr, sessionId) {
        return element[`__${attr}::${sessionId}`];
    }
    function deleteElementCache(element, attr, sessionId) {
        delete element[`__${attr}::${sessionId}`];
    }
    function getElementAsNode(element, sessionId) {
        const node = getElementCache(element, 'node', sessionId);
        return node && node.naturalElement ? node : undefined;
    }

    var session = /*#__PURE__*/Object.freeze({
        isLineBreak: isLineBreak,
        setElementCache: setElementCache,
        getElementCache: getElementCache,
        deleteElementCache: deleteElementCache,
        getElementAsNode: getElementAsNode
    });

    const BOX_POSITION = ['top', 'right', 'bottom', 'left'];
    const BOX_MARGIN = ['marginTop', 'marginRight', 'marginBottom', 'marginLeft'];
    const BOX_PADDING = ['paddingTop', 'paddingRight', 'paddingBottom', 'paddingLeft'];
    function getKeyframeRules() {
        const keyFrameRule = /((?:\d+%\s*,?\s*)+|from|to)\s*{\s*(.+?)\s*}/;
        const result = new Map();
        violation: {
            for (let i = 0; i < document.styleSheets.length; i++) {
                const styleSheet = document.styleSheets[i];
                if (styleSheet.cssRules) {
                    for (let j = 0; j < styleSheet.cssRules.length; j++) {
                        try {
                            const item = styleSheet.cssRules[j];
                            if (item.type === 7) {
                                const map = {};
                                for (let k = 0; k < item.cssRules.length; k++) {
                                    const match = keyFrameRule.exec(item.cssRules[k].cssText);
                                    if (match) {
                                        for (let percent of (item.cssRules[k]['keyText'] || match[1].trim()).split(REGEXP_COMPILED.SEPARATOR)) {
                                            percent = percent.trim();
                                            switch (percent) {
                                                case 'from':
                                                    percent = '0%';
                                                    break;
                                                case 'to':
                                                    percent = '100%';
                                                    break;
                                            }
                                            map[percent] = {};
                                            for (const property of match[2].split(';')) {
                                                const [name, value] = property.split(':');
                                                if (value) {
                                                    map[percent][name.trim()] = value.trim();
                                                }
                                            }
                                        }
                                    }
                                }
                                result.set(item.name, map);
                            }
                        }
                        catch (_a) {
                            break violation;
                        }
                    }
                }
            }
        }
        return result;
    }
    function hasComputedStyle(element) {
        if (element) {
            return typeof element['style'] === 'object' && element['style'] !== null && element['style']['display'] !== null;
        }
        return false;
    }
    function checkStyleValue(element, attr, value, fontSize, style) {
        if (value === 'inherit') {
            value = getInheritedStyle(element, attr);
        }
        if (value && value !== 'initial') {
            const computed = style ? style[attr] : '';
            if (value !== computed) {
                if (computed !== '') {
                    switch (attr) {
                        case 'backgroundColor':
                        case 'borderTopColor':
                        case 'borderRightColor':
                        case 'borderBottomColor':
                        case 'borderLeftColor':
                        case 'color':
                        case 'fontSize':
                        case 'fontWeight':
                            return computed;
                    }
                    if (REGEXP_COMPILED.CUSTOMPROPERTY.test(value)) {
                        return computed;
                    }
                }
                switch (attr) {
                    case 'width':
                    case 'height':
                    case 'minWidth':
                    case 'maxWidth':
                    case 'minHeight':
                    case 'maxHeight':
                    case 'lineHeight':
                    case 'verticalAlign':
                    case 'textIndent':
                    case 'letterSpacing':
                    case 'columnGap':
                    case 'top':
                    case 'right':
                    case 'bottom':
                    case 'left':
                    case 'marginTop':
                    case 'marginRight':
                    case 'marginBottom':
                    case 'marginLeft':
                    case 'paddingTop':
                    case 'paddingRight':
                    case 'paddingBottom':
                    case 'paddingLeft': {
                        if (isNumber(value)) {
                            return computed;
                        }
                        return isLength(value) ? convertPX(value, fontSize) : value;
                    }
                }
            }
            return value;
        }
        return '';
    }
    function getDataSet(element, prefix) {
        const result = {};
        if (element) {
            prefix = convertCamelCase(prefix, '.');
            for (const attr in element.dataset) {
                if (attr.startsWith(prefix)) {
                    result[capitalize(attr.substring(prefix.length), false)] = element.dataset[attr];
                }
            }
        }
        return result;
    }
    function getStyle(element, target, cache = true) {
        if (element) {
            const attr = 'style' + (target ? '::' + target : '');
            if (cache) {
                const style = getElementCache(element, attr, '0');
                if (style) {
                    return style;
                }
            }
            if (hasComputedStyle(element)) {
                const style = getComputedStyle(element, target);
                setElementCache(element, attr, '0', style);
                return style;
            }
            return { display: 'inline' };
        }
        return { display: 'none' };
    }
    function getFontSize(element) {
        return parseFloat(getStyle(element).getPropertyValue('font-size')) || undefined;
    }
    function isParentStyle(element, attr, ...styles) {
        if (element) {
            return element.nodeName.charAt(0) !== '#' && styles.includes(getStyle(element)[attr]) || element.parentElement && styles.includes(getStyle(element.parentElement)[attr]);
        }
        return false;
    }
    function getInheritedStyle(element, attr, exclude, ...tagNames) {
        let value = '';
        if (element) {
            let current = element.parentElement;
            while (current && !tagNames.includes(current.tagName)) {
                value = getStyle(current)[attr];
                if (value === 'inherit' || exclude && exclude.test(value)) {
                    value = '';
                }
                if (value || current === document.body) {
                    break;
                }
                current = current.parentElement;
            }
        }
        return value;
    }
    function parseVar(element, value) {
        const style = getStyle(element);
        let match;
        while ((match = new RegExp(`${STRING_PATTERN.VAR}`).exec(value)) !== null) {
            let propertyValue = style.getPropertyValue(match[1]).trim();
            if (match[2] && (isLength(match[2], true) && !isLength(propertyValue, true) || parseColor(match[2]) !== undefined && parseColor(propertyValue) === undefined)) {
                propertyValue = match[2];
            }
            if (propertyValue !== '') {
                value = value.replace(match[0], propertyValue);
            }
            else {
                return undefined;
            }
        }
        return value;
    }
    function calculateVar(element, value, attr, dimension) {
        const result = parseVar(element, value);
        if (result) {
            if (attr && !dimension) {
                const vertical = /(top|bottom|height)/.test(attr.toLowerCase());
                if (element instanceof SVGElement) {
                    const rect = element.getBoundingClientRect();
                    dimension = vertical || attr.length <= 2 && attr.indexOf('y') !== -1 ? rect.height : rect.width;
                }
                else {
                    const rect = (element.parentElement || element).getBoundingClientRect();
                    dimension = vertical ? rect.height : rect.width;
                }
            }
            return calculate(result, dimension, getFontSize(element));
        }
        return undefined;
    }
    function getBackgroundPosition(value, dimension, fontSize) {
        const result = {
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            topAsPercent: 0,
            leftAsPercent: 0,
            rightAsPercent: 0,
            bottomAsPercent: 0,
            horizontal: 'left',
            vertical: 'top'
        };
        const orientation = value === 'center' ? ['center', 'center'] : value.split(' ');
        if (orientation.length === 2) {
            for (let i = 0; i < orientation.length; i++) {
                const position = orientation[i];
                let direction;
                let offsetParent;
                if (i === 0) {
                    direction = 'left';
                    offsetParent = dimension.width;
                    result.horizontal = position;
                }
                else {
                    direction = 'top';
                    offsetParent = dimension.height;
                    result.vertical = position;
                }
                const directionAsPercent = `${direction}AsPercent`;
                switch (position) {
                    case 'start':
                        result.horizontal = 'left';
                        break;
                    case 'end':
                        result.horizontal = 'right';
                    case 'right':
                    case 'bottom':
                        result[direction] = offsetParent;
                        result[directionAsPercent] = 1;
                        break;
                    case 'center':
                        result[direction] = offsetParent / 2;
                        result[directionAsPercent] = 0.5;
                        break;
                    default:
                        result[direction] = convertLength(position, offsetParent, fontSize);
                        result[directionAsPercent] = convertPercent(position, offsetParent, fontSize);
                        break;
                }
            }
        }
        else if (orientation.length === 4) {
            for (let i = 0; i < orientation.length; i++) {
                const position = orientation[i];
                switch (i) {
                    case 0:
                        result.horizontal = position;
                        break;
                    case 1: {
                        const location = convertLength(position, dimension.width, fontSize);
                        const locationAsPercent = convertPercent(position, dimension.width, fontSize);
                        switch (result.horizontal) {
                            case 'end:':
                                result.horizontal = 'right';
                            case 'right':
                                result.right = location;
                                result.left = dimension.width - location;
                                result.rightAsPercent = locationAsPercent;
                                result.leftAsPercent = 1 - locationAsPercent;
                                break;
                            case 'start':
                                result.horizontal = 'left';
                            default:
                                result.left = location;
                                result.leftAsPercent = locationAsPercent;
                                break;
                        }
                        break;
                    }
                    case 2:
                        result.vertical = position;
                        break;
                    case 3: {
                        const location = convertLength(position, dimension.height, fontSize);
                        const locationAsPercent = convertPercent(position, dimension.height, fontSize);
                        if (result.vertical === 'bottom') {
                            result.bottom = location;
                            result.top = dimension.height - location;
                            result.bottomAsPercent = locationAsPercent;
                            result.topAsPercent = 1 - locationAsPercent;
                        }
                        else {
                            result.top = location;
                            result.topAsPercent = locationAsPercent;
                        }
                        break;
                    }
                }
            }
        }
        return result;
    }
    function convertListStyle(name, value, valueAsDefault = false) {
        switch (name) {
            case 'decimal':
                return value.toString();
            case 'decimal-leading-zero':
                return (value < 9 ? '0' : '') + value.toString();
            case 'upper-alpha':
            case 'upper-latin':
                if (value >= 1) {
                    return convertAlpha(value - 1);
                }
                break;
            case 'lower-alpha':
            case 'lower-latin':
                if (value >= 1) {
                    return convertAlpha(value - 1).toLowerCase();
                }
                break;
            case 'upper-roman':
                return convertRoman(value);
            case 'lower-roman':
                return convertRoman(value).toLowerCase();
        }
        return valueAsDefault ? value.toString() : '';
    }
    function resolveURL(value) {
        const match = value.match(REGEXP_COMPILED.URL);
        return match ? resolvePath(match[1]) : '';
    }
    function insertStyleSheetRule(value, index = 0) {
        const style = document.createElement('style');
        if (isUserAgent(4 /* SAFARI */)) {
            style.appendChild(document.createTextNode(''));
        }
        document.head.appendChild(style);
        const sheet = style.sheet;
        if (sheet && typeof sheet['insertRule'] === 'function') {
            try {
                sheet.insertRule(value, index);
            }
            catch (_a) {
                return null;
            }
        }
        return style;
    }

    var css = /*#__PURE__*/Object.freeze({
        BOX_POSITION: BOX_POSITION,
        BOX_MARGIN: BOX_MARGIN,
        BOX_PADDING: BOX_PADDING,
        getKeyframeRules: getKeyframeRules,
        hasComputedStyle: hasComputedStyle,
        checkStyleValue: checkStyleValue,
        getDataSet: getDataSet,
        getStyle: getStyle,
        getFontSize: getFontSize,
        isParentStyle: isParentStyle,
        getInheritedStyle: getInheritedStyle,
        parseVar: parseVar,
        calculateVar: calculateVar,
        getBackgroundPosition: getBackgroundPosition,
        convertListStyle: convertListStyle,
        resolveURL: resolveURL,
        insertStyleSheetRule: insertStyleSheetRule
    });

    const ELEMENT_BLOCK = [
        'ADDRESS',
        'ARTICLE',
        'ASIDE',
        'BLOCKQUOTE',
        'CANVAS',
        'DD',
        'DIV',
        'DL',
        'DT',
        'FIELDSET',
        'FIGCAPTION',
        'FIGURE',
        'FOOTER',
        'FORM',
        'H1',
        'H2',
        'H3',
        'H4',
        'H5',
        'H6',
        'HEADER',
        'LI',
        'MAIN',
        'NAV',
        'OL',
        'OUTPUT',
        'P',
        'PRE',
        'SECTION',
        'TFOOT',
        'TH',
        'THEAD',
        'TR',
        'UL',
        'VIDEO'
    ];
    const ELEMENT_INLINE = [
        'A',
        'ABBR',
        'ACRONYM',
        'B',
        'BDO',
        'BIG',
        'BR',
        'BUTTON',
        'CITE',
        'CODE',
        'DFN',
        'EM',
        'I',
        'IFRAME',
        'IMG',
        'INPUT',
        'KBD',
        'LABEL',
        'MAP',
        'OBJECT',
        'Q',
        'S',
        'SAMP',
        'SCRIPT',
        'SELECT',
        'SMALL',
        'SPAN',
        'STRIKE',
        'STRONG',
        'SUB',
        'SUP',
        'TEXTAREA',
        'TIME',
        'TT',
        'U',
        'VAR',
        'PLAINTEXT'
    ];
    const withinViewport = (rect) => !(rect.left < 0 && rect.top < 0 && Math.abs(rect.left) >= rect.width && Math.abs(rect.top) >= rect.height);
    function newBoxRect() {
        return {
            top: 0,
            left: 0,
            right: 0,
            bottom: 0
        };
    }
    function newRectDimension() {
        return {
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            width: 0,
            height: 0
        };
    }
    function newBoxModel() {
        return {
            marginTop: 0,
            marginRight: 0,
            marginBottom: 0,
            marginLeft: 0,
            paddingTop: 0,
            paddingRight: 0,
            paddingBottom: 0,
            paddingLeft: 0
        };
    }
    function getRangeClientRect(element) {
        const range = document.createRange();
        range.selectNodeContents(element);
        const clientRects = range.getClientRects();
        const domRect = [];
        for (let i = 0; i < clientRects.length; i++) {
            const item = clientRects.item(i);
            if (!(Math.round(item.width) === 0 && withinRange(item.left, item.right))) {
                domRect.push(item);
            }
        }
        let bounds = newRectDimension();
        let multiline = 0;
        if (domRect.length) {
            bounds = assignRect(domRect[0]);
            const top = new Set([bounds.top]);
            const bottom = new Set([bounds.bottom]);
            let minTop = bounds.top;
            let maxBottom = bounds.bottom;
            for (let i = 1; i < domRect.length; i++) {
                const rect = domRect[i];
                top.add(Math.round(rect.top));
                bottom.add(Math.round(rect.bottom));
                minTop = Math.min(minTop, rect.top);
                maxBottom = Math.min(maxBottom, rect.bottom);
                bounds.width += rect.width;
                bounds.right = Math.max(rect.right, bounds.right);
                bounds.height = Math.max(rect.height, bounds.height);
            }
            if (top.size > 1 && bottom.size > 1) {
                bounds.top = minTop;
                bounds.bottom = maxBottom;
                if (domRect[domRect.length - 1].top >= domRect[0].bottom && element.textContent && (element.textContent.trim() !== '' || /^\s*\n/.test(element.textContent))) {
                    multiline = domRect.length - 1;
                }
            }
        }
        bounds.multiline = multiline;
        return bounds;
    }
    function assignRect(rect) {
        return {
            top: rect.top,
            right: rect.right,
            bottom: rect.bottom,
            left: rect.left,
            width: rect.width,
            height: rect.height
        };
    }
    function removeElementsByClassName(className) {
        for (const element of Array.from(document.getElementsByClassName(className))) {
            if (element.parentElement) {
                element.parentElement.removeChild(element);
            }
        }
    }
    function isElementVisible(element, viewport = false) {
        const rect = element.getBoundingClientRect();
        if (!viewport || withinViewport(rect)) {
            if (rect.width !== 0 && rect.height !== 0) {
                return true;
            }
            const style = getStyle(element);
            return style.getPropertyValue('display') === 'block' && (parseInt(style.getPropertyValue('margin-top')) !== 0 || parseInt(style.getPropertyValue('margin-bottom')) !== 0);
        }
        return false;
    }
    function getElementsBetweenSiblings(elementStart, elementEnd, whiteSpace = false) {
        if (!elementStart || elementStart.parentElement === elementEnd.parentElement) {
            const parent = elementEnd.parentElement;
            if (parent) {
                let startIndex = elementStart ? -1 : 0;
                let endIndex = -1;
                const elements = Array.from(parent.childNodes);
                for (let i = 0; i < elements.length; i++) {
                    if (elements[i] === elementStart) {
                        startIndex = i;
                    }
                    if (elements[i] === elementEnd) {
                        endIndex = i;
                    }
                }
                if (startIndex !== -1 && endIndex !== -1 && startIndex !== endIndex) {
                    const result = elements.slice(Math.min(startIndex, endIndex) + 1, Math.max(startIndex, endIndex));
                    if (whiteSpace) {
                        spliceArray(result, element => element.nodeName === '#comment');
                    }
                    else {
                        spliceArray(result, element => element.nodeName.charAt(0) === '#' && (element.nodeName !== 'text' || !!element.textContent && element.textContent.trim() === ''));
                    }
                    return result.length ? result : undefined;
                }
            }
        }
        return undefined;
    }
    function createElement(parent, tagName = 'span', placeholder = true, index = -1) {
        const element = document.createElement(tagName);
        const style = element.style;
        if (placeholder) {
            style.setProperty('position', 'static');
            style.setProperty('margin', '0px');
            style.setProperty('padding', '0px');
            style.setProperty('border', 'none');
            style.setProperty('cssFloat', 'none');
            style.setProperty('clear', 'none');
            element.className = 'squared.placeholder';
        }
        else {
            element.className = '__squared.pseudo';
        }
        style.setProperty('display', 'none');
        if (parent) {
            if (index >= 0 && index < parent.childNodes.length) {
                parent.insertBefore(element, parent.childNodes[index]);
            }
            else {
                parent.appendChild(element);
            }
        }
        return element;
    }
    function getNamedItem(element, attr) {
        if (element) {
            const item = element.attributes.getNamedItem(attr);
            if (item) {
                return item.value.trim();
            }
        }
        return '';
    }

    var dom = /*#__PURE__*/Object.freeze({
        ELEMENT_BLOCK: ELEMENT_BLOCK,
        ELEMENT_INLINE: ELEMENT_INLINE,
        newBoxRect: newBoxRect,
        newRectDimension: newRectDimension,
        newBoxModel: newBoxModel,
        getRangeClientRect: getRangeClientRect,
        assignRect: assignRect,
        removeElementsByClassName: removeElementsByClassName,
        isElementVisible: isElementVisible,
        getElementsBetweenSiblings: getElementsBetweenSiblings,
        createElement: createElement,
        getNamedItem: getNamedItem
    });

    function minArray(list) {
        if (list.length) {
            return Math.min.apply(null, list);
        }
        return Number.POSITIVE_INFINITY;
    }
    function maxArray(list) {
        if (list.length) {
            return Math.max.apply(null, list);
        }
        return Number.NEGATIVE_INFINITY;
    }
    function isEqual$1(valueA, valueB, precision = 8) {
        return valueA.toPrecision(precision) === valueB.toPrecision(precision);
    }
    function moreEqual(valueA, valueB, precision = 8) {
        return valueA > valueB || isEqual$1(valueA, valueB, precision);
    }
    function lessEqual(valueA, valueB, precision = 8) {
        return valueA < valueB || isEqual$1(valueA, valueB, precision);
    }
    function truncate(value, precision = 3) {
        if (value === Math.floor(value)) {
            return value.toString();
        }
        else {
            if (value > 1) {
                precision += 1;
                let i = 1;
                while (value / Math.pow(10, i++) >= 1) {
                    precision += 1;
                }
            }
            return value.toPrecision(precision).replace(/\.?0+$/, '');
        }
    }
    function truncateFraction(value) {
        if (value !== Math.floor(value)) {
            const match = /^(\d+)\.(\d*?)(0{5,}|9{5,})\d*$/.exec(value.toString());
            if (match) {
                return match[2] === '' ? Math.round(value) : parseFloat(value.toPrecision((match[1] !== '0' ? match[1].length : 0) + match[2].length));
            }
        }
        return value;
    }
    function truncateString(value, precision = 3) {
        const pattern = new RegExp(`(\\d+\\.\\d{${precision}})(\\d)\\d*`, 'g');
        let match;
        let output = value;
        while ((match = pattern.exec(value)) !== null) {
            if (parseInt(match[2]) >= 5) {
                match[1] = truncateFraction((parseFloat(match[1]) + 1 / Math.pow(10, precision))).toString();
            }
            output = output.replace(match[0], match[1]);
        }
        return output;
    }
    function convertRadian(value) {
        return value * Math.PI / 180;
    }
    function triangulateASA(a, b, clen) {
        const c = 180 - a - b;
        return [
            (clen / Math.sin(convertRadian(c))) * Math.sin(convertRadian(a)),
            (clen / Math.sin(convertRadian(c))) * Math.sin(convertRadian(b))
        ];
    }
    function offsetAngle(start, end) {
        const x = end.x - start.x;
        const y = end.y - start.y;
        let value = (Math.atan2(y, x) * 180 / Math.PI) + 90;
        if (value < 0) {
            value += 360;
        }
        return value;
    }
    function offsetAngleX(angle, value) {
        return value * Math.sin(convertRadian(angle));
    }
    function offsetAngleY(angle, value) {
        return value * Math.cos(convertRadian(angle)) * -1;
    }
    function clampRange(value, min = 0, max = 1) {
        if (value < min) {
            value = min;
        }
        else if (value > max) {
            value = max;
        }
        return value;
    }
    function nextMultiple(values, minimum = 0, offset) {
        if (values.length > 1) {
            const increment = minArray(values);
            if (offset && offset.length === values.length) {
                for (let i = 0; i < offset.length; i++) {
                    minimum = Math.max(minimum, offset[i] + values[i]);
                }
            }
            else {
                offset = undefined;
                minimum = Math.max(minimum, increment);
            }
            let value = 0;
            while (value < minimum) {
                value += increment;
            }
            const start = offset ? offset[0] : 0;
            let valid = false;
            while (!valid) {
                const total = start + value;
                for (let i = 1; i < values.length; i++) {
                    const multiple = values[i] + (offset ? offset[i] : 0);
                    if (total % multiple === 0) {
                        valid = true;
                    }
                    else {
                        valid = false;
                        value += increment;
                        break;
                    }
                }
            }
            return start + value;
        }
        return values[0];
    }

    var math = /*#__PURE__*/Object.freeze({
        minArray: minArray,
        maxArray: maxArray,
        isEqual: isEqual$1,
        moreEqual: moreEqual,
        lessEqual: lessEqual,
        truncate: truncate,
        truncateFraction: truncateFraction,
        truncateString: truncateString,
        convertRadian: convertRadian,
        triangulateASA: triangulateASA,
        offsetAngle: offsetAngle,
        offsetAngleX: offsetAngleX,
        offsetAngleY: offsetAngleY,
        clampRange: clampRange,
        nextMultiple: nextMultiple
    });

    const REGEXP_INDENT = /^(\t+)(.*)$/;
    const STRING_XMLENCODING = '<?xml version="1.0" encoding="utf-8"?>\n';
    function pushIndent(value, depth, char = '\t', indent) {
        if (depth > 0) {
            if (indent === undefined) {
                indent = char.repeat(depth);
            }
            return joinMap(value.split('\n'), line => line !== '' ? indent + line : '');
        }
        return value;
    }
    function pushIndentArray(values, depth, char = '\t', separator = '') {
        if (depth > 0) {
            const indent = char.repeat(depth);
            for (let i = 0; i < values.length; i++) {
                values[i] = pushIndent(values[i], depth, char, indent);
            }
        }
        return values.join(separator);
    }
    function replaceIndent(value, depth, pattern) {
        if (depth >= 0) {
            let indent = -1;
            return joinMap(value.split('\n'), line => {
                const match = pattern.exec(line);
                if (match) {
                    if (indent === -1) {
                        indent = match[2].length;
                    }
                    return (match[1] || '') + '\t'.repeat(depth + (match[2].length - indent)) + match[3];
                }
                return line;
            });
        }
        return value;
    }
    function replaceTab(value, spaces = 4, preserve = false) {
        if (spaces > 0) {
            if (preserve) {
                return joinMap(value.split('\n'), line => {
                    const match = line.match(REGEXP_INDENT);
                    if (match) {
                        return ' '.repeat(spaces * match[1].length) + match[2];
                    }
                    return line;
                })
                    .trim();
            }
            else {
                return value.replace(/\t/g, ' '.repeat(spaces));
            }
        }
        return value;
    }
    function applyTemplate(tagName, template, children, depth) {
        const tag = template[tagName];
        const nested = tag['>>'] === true;
        let output = '';
        let indent = '';
        if (depth === undefined) {
            output += STRING_XMLENCODING;
            depth = 0;
        }
        else {
            indent += '\t'.repeat(depth);
        }
        for (let i = 0; i < children.length; i++) {
            const item = children[i];
            const include = tag['#'] && item[tag['#']];
            const closed = !nested && !include;
            let valid = false;
            output += indent + '<' + tagName;
            if (tag['@']) {
                for (const attr of tag['@']) {
                    if (item[attr]) {
                        output += ` ${(tag['^'] ? tag['^'] + ':' : '') + attr}="${item[attr]}"`;
                    }
                }
            }
            if (tag['>']) {
                let innerText = '';
                const childDepth = depth + (nested ? i : 0) + 1;
                for (const name in tag['>']) {
                    if (Array.isArray(item[name])) {
                        innerText += applyTemplate(name, tag['>'], item[name], childDepth);
                    }
                    else if (typeof item[name] === 'object') {
                        innerText += applyTemplate(name, tag['>'], [item[name]], childDepth);
                    }
                }
                if (innerText !== '') {
                    output += '>\n' +
                        innerText;
                    if (closed) {
                        output += indent + `</${tagName}>\n`;
                    }
                }
                else {
                    output += closed ? ' />\n' : '>\n';
                }
                valid = true;
            }
            else if (tag['~']) {
                output += '>' + item.innerText;
                if (closed) {
                    output += `</${tagName}>\n`;
                }
                valid = true;
            }
            else if (closed) {
                output += ' />\n';
            }
            if (include) {
                if (!valid) {
                    output += '>\n';
                }
                output += include;
                if (!nested) {
                    output += indent + `</${tagName}>\n`;
                }
            }
            if (nested) {
                indent += '\t';
            }
        }
        if (nested) {
            for (let i = 0; i < children.length; i++) {
                indent = indent.substring(1);
                output += indent + `</${tagName}>\n`;
            }
        }
        return output;
    }
    function formatTemplate(value, closeEmpty = true, startIndent = -1, char = '\t') {
        const REGEXP_FORMAT = {
            ITEM: /\s*(<(\/)?([?\w]+)[^>]*>)\n?([^<]*)/g,
            OPENTAG: /\s*>$/,
            CLOSETAG: /\/>\n*$/
        };
        const lines = [];
        let match;
        while ((match = REGEXP_FORMAT.ITEM.exec(value)) !== null) {
            lines.push({
                tag: match[1],
                closing: !!match[2],
                tagName: match[3],
                value: match[4].trim() === '' ? '' : match[4]
            });
        }
        let output = '';
        let indent = startIndent;
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            let previous = indent;
            if (i > 0) {
                if (line.closing) {
                    indent--;
                }
                else {
                    previous++;
                    if (!REGEXP_FORMAT.CLOSETAG.exec(line.tag)) {
                        if (closeEmpty && line.value.trim() === '') {
                            const next = lines[i + 1];
                            if (next && next.closing && next.tagName === line.tagName) {
                                line.tag = line.tag.replace(REGEXP_FORMAT.OPENTAG, ' />');
                                i++;
                            }
                            else {
                                indent++;
                            }
                        }
                        else {
                            indent++;
                        }
                    }
                }
                let firstLine = true;
                for (const partial of line.tag.trim().split('\n')) {
                    const depth = previous + (firstLine ? 0 : 1);
                    output += (depth > 0 ? char.repeat(depth) : '') + partial.trim() + '\n';
                    firstLine = false;
                }
            }
            else {
                output += (startIndent > 0 ? char.repeat(startIndent) : '') + line.tag + '\n';
            }
            output += line.value;
        }
        return output;
    }

    var xml = /*#__PURE__*/Object.freeze({
        STRING_XMLENCODING: STRING_XMLENCODING,
        pushIndent: pushIndent,
        pushIndentArray: pushIndentArray,
        replaceIndent: replaceIndent,
        replaceTab: replaceTab,
        applyTemplate: applyTemplate,
        formatTemplate: formatTemplate
    });

    let main;
    let framework;
    exports.settings = {};
    exports.system = {};
    const extensionsAsync = new Set();
    const optionsAsync = new Map();
    function setFramework(value, cached = false) {
        if (framework !== value) {
            const appBase = cached ? value.cached() : value.create();
            if (framework === undefined) {
                Object.assign(appBase.userSettings, exports.settings);
            }
            exports.settings = appBase.userSettings;
            main = appBase.application;
            main.userSettings = exports.settings;
            const register = new Set();
            for (const namespace of exports.settings.builtInExtensions) {
                if (main.builtInExtensions[namespace]) {
                    register.add(main.builtInExtensions[namespace]);
                }
                else {
                    for (const extension in main.builtInExtensions) {
                        if (extension.startsWith(`${namespace}.`)) {
                            register.add(main.builtInExtensions[extension]);
                        }
                    }
                }
            }
            for (const extension of register) {
                main.extensionManager.include(extension);
            }
            framework = value;
            exports.system = value.system;
        }
        reset();
    }
    function parseDocument(...elements) {
        if (main && !main.closed) {
            if (exports.settings.handleExtensionsAsync) {
                for (const item of extensionsAsync) {
                    main.extensionManager.include(item);
                }
                for (const [name, options] of optionsAsync.entries()) {
                    configure(name, options);
                }
                extensionsAsync.clear();
                optionsAsync.clear();
            }
            return main.parseDocument(...elements);
        }
        return {
            then: (callback) => {
                if (!main) {
                    alert('ERROR: Framework not installed.');
                }
                else if (main.closed) {
                    if (confirm('ERROR: Document is closed. Reset and rerun?')) {
                        main.reset();
                        parseDocument.call(null, ...elements).then(callback);
                    }
                }
            }
        };
    }
    function include(value) {
        if (main) {
            if (value instanceof squared.base.Extension) {
                return main.extensionManager.include(value);
            }
            else if (typeof value === 'string') {
                value = value.trim();
                const extension = main.builtInExtensions[value] || retrieve(value);
                if (extension) {
                    return main.extensionManager.include(extension);
                }
            }
        }
        return false;
    }
    function includeAsync(value) {
        if (include(value)) {
            return true;
        }
        else if (value instanceof squared.base.Extension) {
            extensionsAsync.add(value);
            if (exports.settings.handleExtensionsAsync) {
                return true;
            }
        }
        return false;
    }
    function exclude(value) {
        if (main) {
            if (value instanceof squared.base.Extension) {
                if (extensionsAsync.has(value)) {
                    extensionsAsync.delete(value);
                    main.extensionManager.exclude(value);
                    return true;
                }
                else {
                    return main.extensionManager.exclude(value);
                }
            }
            else if (typeof value === 'string') {
                value = value.trim();
                const extension = main.extensionManager.retrieve(value);
                if (extension) {
                    return main.extensionManager.exclude(extension);
                }
            }
        }
        return false;
    }
    function configure(value, options) {
        if (typeof options === 'object') {
            if (value instanceof squared.base.Extension) {
                Object.assign(value.options, options);
                return true;
            }
            else if (typeof value === 'string') {
                if (main) {
                    value = value.trim();
                    const extension = main.extensionManager.retrieve(value) || Array.from(extensionsAsync).find(item => item.name === value);
                    if (extension) {
                        Object.assign(extension.options, options);
                        return true;
                    }
                    else {
                        optionsAsync.set(value, options);
                        if (exports.settings.handleExtensionsAsync) {
                            return true;
                        }
                    }
                }
            }
        }
        return false;
    }
    function apply(value, options) {
        if (value instanceof squared.base.Extension) {
            return include(value);
        }
        else if (typeof value === 'string') {
            value = value.trim();
            if (typeof options === 'object') {
                return configure(value, options);
            }
            else {
                return retrieve(value);
            }
        }
        return false;
    }
    function retrieve(value) {
        return main && main.extensionManager.retrieve(value);
    }
    function ready() {
        return !!main && !main.initialized && !main.closed;
    }
    function close() {
        if (main && !main.initialized && main.length) {
            main.finalize();
        }
    }
    function reset() {
        if (main) {
            main.reset();
        }
    }
    function saveAllToDisk() {
        if (main && !main.initialized && main.length) {
            if (!main.closed) {
                main.finalize();
            }
            main.saveAllToDisk();
        }
    }
    function toString() {
        return main ? main.toString() : '';
    }
    const lib = {
        base: {
            Container
        },
        color,
        css,
        dom,
        math,
        session,
        util,
        xml
    };

    exports.apply = apply;
    exports.close = close;
    exports.configure = configure;
    exports.exclude = exclude;
    exports.include = include;
    exports.includeAsync = includeAsync;
    exports.lib = lib;
    exports.parseDocument = parseDocument;
    exports.ready = ready;
    exports.reset = reset;
    exports.retrieve = retrieve;
    exports.saveAllToDisk = saveAllToDisk;
    exports.setFramework = setFramework;
    exports.toString = toString;

    Object.defineProperty(exports, '__esModule', { value: true });

}));
