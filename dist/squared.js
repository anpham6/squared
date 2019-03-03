/* squared 0.7.2
   https://github.com/anpham6/squared */

(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
    typeof define === 'function' && define.amd ? define(['exports'], factory) :
    (global = global || self, factory(global.squared = {}));
}(this, function (exports) { 'use strict';

    const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const NUMERALS = [
        '', 'C', 'CC', 'CCC', 'CD', 'D', 'DC', 'DCC', 'DCCC', 'CM',
        '', 'X', 'XX', 'XXX', 'XL', 'L', 'LX', 'LXX', 'LXXX', 'XC',
        '', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX'
    ];
    function compareObject(obj1, obj2, attr, numeric) {
        const namespaces = attr.split('.');
        let current1 = obj1;
        let current2 = obj2;
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
    const REGEXP_STRING = {
        DECIMAL: '-?\\d+(?:.\\d+)?',
        ZERO_ONE: '0(?:\\.\\d+)?|1(?:\\.0+)?'
    };
    REGEXP_STRING.UNIT = `(${REGEXP_STRING.DECIMAL})(px|em|ch|pc|pt|vw|vh|vmin|vmax|mm|cm|in)`;
    REGEXP_STRING.DEGREE = `(${REGEXP_STRING.DECIMAL})(deg|rad|turn|grad)`;
    REGEXP_STRING.LENGTH = `(${REGEXP_STRING.DECIMAL}(?:[a-z]{2,}|%)?)`;
    const REGEXP_PATTERN = {
        URL: /url\("?(.+?)"?\)/,
        URI: /^[A-Za-z]+:\/\//,
        UNIT: new RegExp(`^${REGEXP_STRING.UNIT}$`),
        ATTRIBUTE: /([^\s]+)="([^"]+)"/
    };
    function capitalize(value, upper = true) {
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
    function convertUnderscore(value) {
        value = value.charAt(0).toLowerCase() + value.substring(1);
        const match = value.match(/([a-z][A-Z])/g);
        if (match) {
            for (const capture of match) {
                value = value.replace(capture, `${capture[0]}_${capture[1].toLowerCase()}`);
            }
        }
        return value;
    }
    function convertCamelCase(value, char = '-') {
        const match = value.replace(new RegExp(`^${char}+`), '').match(new RegExp(`(${char}[a-z])`, 'g'));
        if (match) {
            for (const capture of match) {
                value = value.replace(capture, capture[1].toUpperCase());
            }
        }
        return value;
    }
    function convertWord(value, dash = false) {
        return value ? (dash ? value.replace(/[^a-zA-Z\d]+/g, '_') : value.replace(/[^\w]+/g, '_')).trim() : '';
    }
    function convertInt(value) {
        return value && parseInt(value) || 0;
    }
    function convertFloat(value) {
        return value && parseFloat(value) || 0;
    }
    function convertAngle(value, unit = 'deg') {
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
    function convertPercent(value, precision = 0) {
        return value < 1 ? `${precision === 0 ? Math.round(value * 100) : parseFloat((value * 100).toPrecision(precision))}%` : `100%`;
    }
    function convertPX(value, fontSize) {
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
                        result *= window.devicePixelRatio * 96;
                        break;
                }
                return `${result}px`;
            }
        }
        return '0px';
    }
    function convertPercentPX(value, dimension, fontSize, percent = false) {
        if (percent) {
            return isPercent(value) ? convertFloat(value) / 100 : parseFloat(convertPX(value, fontSize)) / dimension;
        }
        else {
            return isPercent(value) ? Math.round(dimension * (convertFloat(value) / 100)) : parseFloat(convertPX(value, fontSize));
        }
    }
    function convertAlpha(value) {
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
            const index = base[key];
            if (value === index) {
                return derived[key];
            }
        }
        return '';
    }
    function formatPX(value) {
        if (typeof value === 'string') {
            value = parseFloat(value);
        }
        return isNaN(value) ? '0px' : `${Math.round(value)}px`;
    }
    function formatPercent(value) {
        if (typeof value === 'string') {
            value = parseFloat(value);
        }
        if (isNaN(value)) {
            return '0%';
        }
        return value < 1 ? convertPercent(value) : `${Math.round(value)}%`;
    }
    function formatString(value, ...params) {
        for (let i = 0; i < params.length; i++) {
            value = value.replace(`{${i}}`, params[i]);
        }
        return value;
    }
    function hasBit(value, type) {
        return (value & type) === type;
    }
    function isNumber(value) {
        return value !== '' && /^-?\d+(\.\d+)?$/.test(value.trim());
    }
    function isString(value) {
        return typeof value === 'string' && value.trim() !== '';
    }
    function isArray(value) {
        return Array.isArray(value) && value.length > 0;
    }
    function isUnit(value) {
        return REGEXP_PATTERN.UNIT.test(value);
    }
    function isPercent(value) {
        return /^\d+(\.\d+)?%$/.test(value);
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
    function cloneObject(data, result = {}, array = false) {
        for (const attr in data) {
            if (Array.isArray(data[attr])) {
                result[attr] = array ? cloneArray(data[attr], [], true) : data[attr];
            }
            else if (typeof data[attr] === 'object') {
                result[attr] = cloneObject(data[attr], {}, array);
            }
            else {
                result[attr] = data[attr];
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
                typeof result !== 'string' &&
                typeof result !== 'number' &&
                typeof result !== 'boolean');
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
        if (!REGEXP_PATTERN.URI.test(value)) {
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
                    pathname = pathname.slice(0, Math.max(pathname.length - levels, 0));
                    pathname.push(...segments);
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
        return value ? trimStart(trimEnd(value, char), char) : '';
    }
    function trimStart(value, char) {
        return value ? value.replace(new RegExp(`^${char}+`), '') : '';
    }
    function trimEnd(value, char) {
        return value ? value.replace(new RegExp(`${char}+$`), '') : '';
    }
    function indexOf(value, ...terms) {
        for (const term of terms) {
            const index = value.indexOf(term);
            if (index !== -1) {
                return index;
            }
        }
        return -1;
    }
    function lastIndexOf(value, char = '/') {
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
        return typeof value !== 'undefined' && value !== null && value.toString().trim() !== '';
    }
    function hasInSet(list, condition) {
        for (const item of list) {
            if (condition(item)) {
                return true;
            }
        }
        return false;
    }
    function withinRange(a, b, offset = 0) {
        return b >= (a - offset) && b <= (a + offset);
    }
    function withinFraction(lower, upper) {
        return (lower === upper ||
            Math.floor(lower) === Math.floor(upper) ||
            Math.ceil(lower) === Math.ceil(upper) ||
            Math.ceil(lower) === Math.floor(upper) ||
            Math.floor(lower) === Math.ceil(upper));
    }
    function assignWhenNull(destination, source) {
        for (const attr in source) {
            if (!hasValue(destination[attr])) {
                destination[attr] = source[attr];
            }
        }
    }
    function defaultWhenNull(options, ...attrs) {
        let current = options;
        for (let i = 0; i < attrs.length - 1; i++) {
            const name = attrs[i];
            if (i === attrs.length - 2) {
                if (!hasValue(current[name])) {
                    current[name] = attrs[i + 1];
                }
            }
            else if (isString(name)) {
                if (typeof current[name] === 'object') {
                    current = current[name];
                }
                else if (current[name] === undefined) {
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
    function sortNumber(values, descending = false) {
        return descending ? values.sort((a, b) => a > b ? -1 : 1) : values.sort((a, b) => a < b ? -1 : 1);
    }
    function sortArray(list, ascending, ...attrs) {
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
        const result = [];
        for (let i = 0; i < list.length; i++) {
            if (predicate(list[i], i, list)) {
                result.push(list[i]);
            }
        }
        return result;
    }
    function flatMap(list, predicate) {
        const result = [];
        for (let i = 0; i < list.length; i++) {
            const item = predicate(list[i], i, list);
            if (hasValue(item)) {
                result.push(item);
            }
        }
        return result;
    }
    function filterMap(list, predicate, callback) {
        const result = [];
        for (let i = 0; i < list.length; i++) {
            if (predicate(list[i], i, list)) {
                result.push(callback(list[i], i, list));
            }
        }
        return result;
    }
    function replaceMap(list, predicate) {
        for (let i = 0; i < list.length; i++) {
            list[i] = predicate(list[i], i, list);
        }
        return list;
    }
    function objectMap(list, predicate) {
        const result = [];
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
        return result.substring(0, result.length - char.length);
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
        REGEXP_STRING: REGEXP_STRING,
        REGEXP_PATTERN: REGEXP_PATTERN,
        capitalize: capitalize,
        convertUnderscore: convertUnderscore,
        convertCamelCase: convertCamelCase,
        convertWord: convertWord,
        convertInt: convertInt,
        convertFloat: convertFloat,
        convertAngle: convertAngle,
        convertPercent: convertPercent,
        convertPX: convertPX,
        convertPercentPX: convertPercentPX,
        convertAlpha: convertAlpha,
        convertRoman: convertRoman,
        convertEnum: convertEnum,
        formatPX: formatPX,
        formatPercent: formatPercent,
        formatString: formatString,
        hasBit: hasBit,
        isNumber: isNumber,
        isString: isString,
        isArray: isArray,
        isUnit: isUnit,
        isPercent: isPercent,
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
        indexOf: indexOf,
        lastIndexOf: lastIndexOf,
        searchObject: searchObject,
        hasValue: hasValue,
        hasInSet: hasInSet,
        withinRange: withinRange,
        withinFraction: withinFraction,
        assignWhenNull: assignWhenNull,
        defaultWhenNull: defaultWhenNull,
        sortNumber: sortNumber,
        sortArray: sortArray,
        flatArray: flatArray,
        partitionArray: partitionArray,
        spliceArray: spliceArray,
        filterArray: filterArray,
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
        cascade() {
            function cascade(container) {
                const result = [];
                for (const item of container.children) {
                    result.push(item);
                    if (item instanceof Container && item.length) {
                        result.push(...cascade(item));
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

    const HEX_CHAR = '0123456789ABCDEF';
    const X11_CSS3 = {
        'Pink': { value: '#FFC0CB' },
        'LightPink': { value: '#FFB6C1' },
        'HotPink': { value: '#FF69B4' },
        'DeepPink': { value: '#FF1493' },
        'PaleVioletRed': { value: '#DB7093' },
        'MediumVioletRed': { value: '#C71585' },
        'LightSalmon': { value: '#FFA07A' },
        'Salmon': { value: '#FA8072' },
        'DarkSalmon': { value: '#E9967A' },
        'LightCoral': { value: '#F08080' },
        'IndianRed': { value: '#CD5C5C' },
        'Crimson': { value: '#DC143C' },
        'Firebrick': { value: '#B22222' },
        'DarkRed': { value: '#8B0000' },
        'Red': { value: '#FF0000' },
        'OrangeRed': { value: '#FF4500' },
        'Tomato': { value: '#FF6347' },
        'Coral': { value: '#FF7F50' },
        'Orange': { value: '#FFA500' },
        'DarkOrange': { value: '#FF8C00' },
        'Yellow': { value: '#FFFF00' },
        'LightYellow': { value: '#FFFFE0' },
        'LemonChiffon': { value: '#FFFACD' },
        'LightGoldenrodYellow': { value: '#FAFAD2' },
        'PapayaWhip': { value: '#FFEFD5' },
        'Moccasin': { value: '#FFE4B5' },
        'PeachPuff': { value: '#FFDAB9' },
        'PaleGoldenrod': { value: '#EEE8AA' },
        'Khaki': { value: '#F0E68C' },
        'DarkKhaki': { value: '#BDB76B' },
        'Gold': { value: '#FFD700' },
        'Cornsilk': { value: '#FFF8DC' },
        'BlanchedAlmond': { value: '#FFEBCD' },
        'Bisque': { value: '#FFE4C4' },
        'NavajoWhite': { value: '#FFDEAD' },
        'Wheat': { value: '#F5DEB3' },
        'Burlywood': { value: '#DEB887' },
        'Tan': { value: '#D2B48C' },
        'RosyBrown': { value: '#BC8F8F' },
        'SandyBrown': { value: '#F4A460' },
        'Goldenrod': { value: '#DAA520' },
        'DarkGoldenrod': { value: '#B8860B' },
        'Peru': { value: '#CD853F' },
        'Chocolate': { value: '#D2691E' },
        'SaddleBrown': { value: '#8B4513' },
        'Sienna': { value: '#A0522D' },
        'Brown': { value: '#A52A2A' },
        'Maroon': { value: '#800000' },
        'DarkOliveGreen': { value: '#556B2F' },
        'Olive': { value: '#808000' },
        'OliveDrab': { value: '#6B8E23' },
        'YellowGreen': { value: '#9ACD32' },
        'LimeGreen': { value: '#32CD32' },
        'Lime': { value: '#00FF00' },
        'LawnGreen': { value: '#7CFC00' },
        'Chartreuse': { value: '#7FFF00' },
        'GreenYellow': { value: '#ADFF2F' },
        'SpringGreen': { value: '#00FF7F' },
        'MediumSpringGreen': { value: '#00FA9A' },
        'LightGreen': { value: '#90EE90' },
        'PaleGreen': { value: '#98FB98' },
        'DarkSeaGreen': { value: '#8FBC8F' },
        'MediumAquamarine': { value: '#66CDAA' },
        'MediumSeaGreen': { value: '#3CB371' },
        'SeaGreen': { value: '#2E8B57' },
        'ForestGreen': { value: '#228B22' },
        'Green': { value: '#008000' },
        'DarkGreen': { value: '#006400' },
        'Aqua': { value: '#00FFFF' },
        'Cyan': { value: '#00FFFF' },
        'LightCyan': { value: '#E0FFFF' },
        'PaleTurquoise': { value: '#AFEEEE' },
        'Aquamarine': { value: '#7FFFD4' },
        'Turquoise': { value: '#40E0D0' },
        'DarkTurquoise': { value: '#00CED1' },
        'MediumTurquoise': { value: '#48D1CC' },
        'LightSeaGreen': { value: '#20B2AA' },
        'CadetBlue': { value: '#5F9EA0' },
        'DarkCyan': { value: '#008B8B' },
        'Teal': { value: '#008080' },
        'LightSteelBlue': { value: '#B0C4DE' },
        'PowderBlue': { value: '#B0E0E6' },
        'LightBlue': { value: '#ADD8E6' },
        'SkyBlue': { value: '#87CEEB' },
        'LightSkyBlue': { value: '#87CEFA' },
        'DeepSkyBlue': { value: '#00BFFF' },
        'DodgerBlue': { value: '#1E90FF' },
        'Cornflower': { value: '#6495ED' },
        'SteelBlue': { value: '#4682B4' },
        'RoyalBlue': { value: '#4169E1' },
        'Blue': { value: '#0000FF' },
        'MediumBlue': { value: '#0000CD' },
        'DarkBlue': { value: '#00008B' },
        'Navy': { value: '#000080' },
        'MidnightBlue': { value: '#191970' },
        'Lavender': { value: '#E6E6FA' },
        'Thistle': { value: '#D8BFD8' },
        'Plum': { value: '#DDA0DD' },
        'Violet': { value: '#EE82EE' },
        'Orchid': { value: '#DA70D6' },
        'Fuchsia': { value: '#FF00FF' },
        'Magenta': { value: '#FF00FF' },
        'MediumOrchid': { value: '#BA55D3' },
        'MediumPurple': { value: '#9370DB' },
        'BlueViolet': { value: '#8A2BE2' },
        'DarkViolet': { value: '#9400D3' },
        'DarkOrchid': { value: '#9932CC' },
        'DarkMagenta': { value: '#8B008B' },
        'Purple': { value: '#800080' },
        'RebeccaPurple': { value: '#663399' },
        'Indigo': { value: '#4B0082' },
        'DarkSlateBlue': { value: '#483D8B' },
        'SlateBlue': { value: '#6A5ACD' },
        'MediumSlateBlue': { value: '#7B68EE' },
        'White': { value: '#FFFFFF' },
        'Snow': { value: '#FFFAFA' },
        'Honeydew': { value: '#F0FFF0' },
        'MintCream': { value: '#F5FFFA' },
        'Azure': { value: '#F0FFFF' },
        'AliceBlue': { value: '#F0F8FF' },
        'GhostWhite': { value: '#F8F8FF' },
        'WhiteSmoke': { value: '#F5F5F5' },
        'Seashell': { value: '#FFF5EE' },
        'Beige': { value: '#F5F5DC' },
        'OldLace': { value: '#FDF5E6' },
        'FloralWhite': { value: '#FFFAF0' },
        'Ivory': { value: '#FFFFF0' },
        'AntiqueWhite': { value: '#FAEBD7' },
        'Linen': { value: '#FAF0E6' },
        'LavenderBlush': { value: '#FFF0F5' },
        'MistyRose': { value: '#FFE4E1' },
        'Gainsboro': { value: '#DCDCDC' },
        'LightGray': { value: '#D3D3D3' },
        'Silver': { value: '#C0C0C0' },
        'DarkGray': { value: '#A9A9A9' },
        'Gray': { value: '#808080' },
        'DimGray': { value: '#696969' },
        'LightSlateGray': { value: '#778899' },
        'SlateGray': { value: '#708090' },
        'DarkSlateGray': { value: '#2F4F4F' },
        'LightGrey': { value: '#D3D3D3' },
        'DarkGrey': { value: '#A9A9A9' },
        'Grey': { value: '#808080' },
        'DimGrey': { value: '#696969' },
        'LightSlateGrey': { value: '#778899' },
        'SlateGrey': { value: '#708090' },
        'DarkSlateGrey': { value: '#2F4F4F' },
        'Black': { value: '#000000' }
    };
    const REGEXP_HEX = /[A-Za-z\d]{3,}/;
    const REGEXP_RGBA = /rgba?\((\d+), (\d+), (\d+)(?:, ([\d.]+))?\)/;
    const HSL_SORTED = [];
    for (const name in X11_CSS3) {
        const x11 = X11_CSS3[name];
        x11.name = name;
        const rgba = convertRGBA(x11.value);
        if (rgba) {
            x11.rgba = rgba;
            x11.hsl = convertHSL(x11.rgba);
            HSL_SORTED.push(x11);
        }
    }
    HSL_SORTED.sort(sortHSL);
    function convertHSL({ r = 0, g = 0, b = 0 }) {
        r /= 255;
        g /= 255;
        b /= 255;
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
            h: h * 360,
            s: s * 100,
            l: l * 100
        };
    }
    function sortHSL(a, b) {
        if (a.hsl && b.hsl) {
            let c = a.hsl.h;
            let d = b.hsl.h;
            if (c === d) {
                c = a.hsl.s;
                d = b.hsl.s;
                if (c === d) {
                    c = a.hsl.l;
                    d = b.hsl.l;
                }
            }
            return c >= d ? 1 : -1;
        }
        return 0;
    }
    function formatRGBA(rgba) {
        return `rgb${rgba.a < 255 ? 'a' : ''}(${rgba.r}, ${rgba.g}, ${rgba.b}${rgba.a < 255 ? `, ${(rgba.a / 255).toPrecision(2)}` : ''})`;
    }
    function convertAlpha$1(value) {
        return parseFloat(value) < 1 ? convertHex(255 * parseFloat(value)) : 'FF';
    }
    function getColorByName(value) {
        for (const color in X11_CSS3) {
            if (color.toLowerCase() === value.trim().toLowerCase()) {
                return X11_CSS3[color];
            }
        }
        return undefined;
    }
    function getColorByShade(value) {
        const sorted = HSL_SORTED.slice(0);
        let index = sorted.findIndex(item => item.value === value);
        if (index !== -1) {
            return sorted[index];
        }
        else {
            const rgb = convertRGBA(value);
            if (rgb) {
                const hsl = convertHSL(rgb);
                if (hsl) {
                    sorted.push({
                        name: '',
                        value: '',
                        hsl,
                        rgba: { r: -1, g: -1, b: -1, a: 1 },
                    });
                    sorted.sort(sortHSL);
                    index = sorted.findIndex(item => item.name === '');
                    return sorted[Math.min(index + 1, sorted.length - 1)];
                }
            }
            return undefined;
        }
    }
    function convertHex(...values) {
        let output = '';
        for (const value of values) {
            let rgb = typeof value === 'string' ? parseInt(value) : value;
            if (isNaN(rgb)) {
                return '00';
            }
            rgb = Math.max(0, Math.min(rgb, 255));
            output += HEX_CHAR.charAt((rgb - (rgb % 16)) / 16) + HEX_CHAR.charAt(rgb % 16);
        }
        return output;
    }
    function convertRGBA(value) {
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
    function parseRGBA(value, opacity = '1', transparency = false) {
        if (value && (value !== 'transparent' || transparency)) {
            if (opacity.trim() === '') {
                opacity = '1';
            }
            if (value.charAt(0) === '#') {
                const rgba = convertRGBA(value);
                if (rgba) {
                    value = formatRGBA(rgba);
                }
            }
            else if (value === 'initial') {
                value = formatRGBA({ r: 0, g: 0, b: 0, a: 1 });
            }
            else if (value === 'transparent') {
                value = formatRGBA({ r: 0, g: 0, b: 0, a: 0 });
            }
            else if (!value.startsWith('rgb')) {
                const color = getColorByName(value);
                if (color && color.rgba) {
                    color.rgba.a = parseFloat(convertAlpha$1(opacity));
                    value = formatRGBA(color.rgba);
                }
            }
            const match = value.match(REGEXP_RGBA);
            if (match && match.length >= 4 && (match[4] === undefined || parseFloat(match[4]) > 0 || transparency)) {
                if (match[4] === undefined) {
                    match[4] = parseFloat(opacity).toPrecision(2);
                }
                const valueHEX = convertHex(match[1]) + convertHex(match[2]) + convertHex(match[3]);
                const valueAlpha = convertAlpha$1(match[4]);
                const valueRGBA = `#${valueHEX + valueAlpha}`;
                const alpha = parseFloat(match[4]);
                return {
                    valueRGB: `#${valueHEX}`,
                    valueRGBA,
                    valueARGB: `#${valueAlpha + valueHEX}`,
                    alpha,
                    rgba: convertRGBA(valueRGBA),
                    opaque: alpha < 1,
                    visible: alpha > 0
                };
            }
        }
        return undefined;
    }
    function reduceRGBA(value, percent) {
        const rgba = convertRGBA(value);
        if (rgba) {
            const base = percent < 0 ? 0 : 255;
            percent = Math.abs(percent);
            rgba.r = Math.round((base - rgba.r) * percent) + rgba.r;
            rgba.g = Math.round((base - rgba.g) * percent) + rgba.g;
            rgba.b = Math.round((base - rgba.b) * percent) + rgba.b;
            return parseRGBA(formatRGBA(rgba));
        }
        return undefined;
    }

    var color = /*#__PURE__*/Object.freeze({
        getColorByName: getColorByName,
        getColorByShade: getColorByShade,
        convertHex: convertHex,
        convertRGBA: convertRGBA,
        parseRGBA: parseRGBA,
        reduceRGBA: reduceRGBA
    });

    const REGEXP_KEYFRAMERULE = /((?:\d+%\s*,?\s*)+|from|to)\s*{\s*(.+?)\s*}/;
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
                value |= 16 /* FIREFOX */;
            }
            if (name.indexOf('EDGE') !== -1) {
                value |= 8 /* EDGE */;
            }
        }
        let client;
        const userAgent = navigator.userAgent;
        if (userAgent.indexOf('Safari') !== -1 && userAgent.indexOf('Chrome') === -1) {
            client = 4 /* SAFARI */;
        }
        else if (userAgent.indexOf('Firefox') !== -1) {
            client = 16 /* FIREFOX */;
        }
        else if (userAgent.indexOf('Edge') !== -1) {
            client = 8 /* EDGE */;
        }
        else {
            client = 2 /* CHROME */;
        }
        return hasBit(value, client);
    }
    function getDeviceDPI() {
        return window.devicePixelRatio * 96;
    }
    function getKeyframeRules() {
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
                                    const match = REGEXP_KEYFRAMERULE.exec(item.cssRules[k].cssText);
                                    if (match) {
                                        for (let percent of (item.cssRules[k]['keyText'] || match[1].trim()).split(',')) {
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
    function checkStyleAttribute(element, attr, value, style, fontSize) {
        if (style === undefined) {
            style = getStyle(element);
        }
        if (value === 'inherit') {
            value = cssInheritStyle(element.parentElement, attr);
        }
        if (value !== 'initial') {
            if (value !== style[attr]) {
                switch (attr) {
                    case 'backgroundColor':
                    case 'borderTopColor':
                    case 'borderRightColor':
                    case 'borderBottomColor':
                    case 'borderLeftColor':
                    case 'color':
                    case 'fontSize':
                    case 'fontWeight':
                        return style[attr] || value;
                    case 'width':
                    case 'height':
                    case 'minWidth':
                    case 'maxWidth':
                    case 'minHeight':
                    case 'maxHeight':
                    case 'lineHeight':
                    case 'verticalAlign':
                    case 'textIndent':
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
                    case 'paddingLeft':
                        return /^[A-Za-z\-]+$/.test(value) || isPercent(value) ? value : convertPX(value, fontSize);
                }
            }
            return value;
        }
        return '';
    }
    function getDataSet(element, prefix) {
        const result = {};
        if (hasComputedStyle(element)) {
            prefix = convertCamelCase(prefix, '\\.');
            for (const attr in element.dataset) {
                if (attr.length > prefix.length && attr.startsWith(prefix)) {
                    result[capitalize(attr.substring(prefix.length), false)] = element.dataset[attr];
                }
            }
        }
        return result;
    }
    function newBoxRect() {
        return {
            top: 0,
            left: 0,
            right: 0,
            bottom: 0
        };
    }
    function newRectDimension() {
        return Object.assign({ width: 0, height: 0 }, newBoxRect());
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
    function getDOMRect(element) {
        const result = element.getBoundingClientRect();
        result.x = result.left;
        result.y = result.top;
        return result;
    }
    function createElement(parent, block = false) {
        const element = document.createElement(block ? 'div' : 'span');
        const style = element.style;
        style.position = 'static';
        style.margin = '0px';
        style.padding = '0px';
        style.border = 'none';
        style.cssFloat = 'none';
        style.clear = 'none';
        style.display = 'none';
        element.className = '__css.placeholder';
        if (parent) {
            parent.appendChild(element);
        }
        return element;
    }
    function removeElementsByClassName(className) {
        const elements = document.getElementsByClassName(className);
        for (let i = 0; i < elements.length; i++) {
            const element = elements[i];
            if (element.parentElement) {
                element.parentElement.removeChild(element);
            }
        }
    }
    function getRangeClientRect(element) {
        const range = document.createRange();
        range.selectNodeContents(element);
        const clientRects = range.getClientRects();
        const domRect = [];
        for (let i = 0; i < clientRects.length; i++) {
            const item = clientRects.item(i);
            if (!(Math.round(item.width) === 0 && withinFraction(item.left, item.right))) {
                domRect.push(item);
            }
        }
        let bounds = newRectDimension();
        let multiline = 0;
        if (domRect.length) {
            bounds = assignBounds(domRect[0]);
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
        return Object.assign({}, bounds, { multiline });
    }
    function assignBounds(bounds) {
        return {
            top: bounds.top,
            right: bounds.right,
            bottom: bounds.bottom,
            left: bounds.left,
            width: bounds.width,
            height: bounds.height
        };
    }
    function getStyle(element, cache = true) {
        if (element) {
            if (cache) {
                const style = getElementCache(element, 'style');
                if (style) {
                    return style;
                }
                else {
                    const node = getElementAsNode(element);
                    if (node && node.plainText) {
                        return node.unsafe('styleMap');
                    }
                }
            }
            if (hasComputedStyle(element)) {
                const style = getComputedStyle(element);
                setElementCache(element, 'style', style);
                return style;
            }
            return {};
        }
        return { display: 'none' };
    }
    function getFontSize(element) {
        return parseInt(getStyle(element).fontSize || '16px');
    }
    function cssResolveUrl(value) {
        const match = value.match(REGEXP_PATTERN.URL);
        if (match) {
            return resolvePath(match[1]);
        }
        return '';
    }
    function cssInheritStyle(element, attr, exclude, tagNames) {
        let value = '';
        if (element) {
            let current = element.parentElement;
            while (current && (tagNames === undefined || !tagNames.includes(current.tagName))) {
                value = getStyle(current)[attr] || '';
                if (value === 'inherit' || exclude && exclude.some(style => value.indexOf(style) !== -1)) {
                    value = '';
                }
                if (value !== '' || current === document.body) {
                    break;
                }
                current = current.parentElement;
            }
        }
        return value;
    }
    function cssParent(element, attr, ...styles) {
        if (element) {
            if (element.nodeName.charAt(0) !== '#') {
                if (styles.includes(getStyle(element)[attr])) {
                    return true;
                }
            }
            if (element.parentElement) {
                return styles.includes(getStyle(element.parentElement)[attr]);
            }
        }
        return false;
    }
    function cssFromParent(element, attr) {
        if (hasComputedStyle(element) && element.parentElement) {
            const node = getElementAsNode(element);
            const style = getStyle(element);
            if (node && style) {
                return style[attr] === getStyle(element.parentElement)[attr] && !node.cssInitial(attr);
            }
        }
        return false;
    }
    function cssInline(element, attr) {
        let value = '';
        if (typeof element['style'] === 'object') {
            value = element['style'][attr];
        }
        if (!value) {
            const styleMap = getElementCache(element, 'styleMap');
            if (styleMap) {
                value = styleMap[attr];
            }
        }
        return value || '';
    }
    function cssAttribute(element, attr, computed = false) {
        const node = getElementAsNode(element);
        const name = convertCamelCase(attr);
        return node && node.cssInitial(name) || cssInline(element, name) || getNamedItem(element, attr) || computed && getStyle(element)[name] || '';
    }
    function cssInheritAttribute(element, attr) {
        let current = element;
        let value = '';
        while (current) {
            value = cssAttribute(current, attr);
            if (value !== '' && value !== 'inherit') {
                break;
            }
            current = current.parentElement;
        }
        return value;
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
    function getBackgroundPosition(value, dimension, fontSize, leftPerspective = false, percent = false) {
        const result = {
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            horizontal: 'left',
            vertical: 'top',
            originalX: '',
            originalY: ''
        };
        const orientation = value === 'center' ? ['center', 'center'] : value.split(' ');
        if (orientation.length === 4) {
            for (let i = 0; i < orientation.length; i++) {
                const position = orientation[i];
                switch (i) {
                    case 0:
                        result.horizontal = position;
                        break;
                    case 2:
                        result.vertical = position;
                        break;
                    case 1:
                    case 3:
                        const clientXY = convertPercentPX(position, i === 1 ? dimension.width : dimension.height, fontSize, percent);
                        if (i === 1) {
                            if (leftPerspective) {
                                if (result.horizontal === 'right') {
                                    if (isPercent(position)) {
                                        result.originalX = formatPercent(100 - parseInt(position));
                                    }
                                    else {
                                        result.originalX = formatPX(dimension.width - parseInt(convertPX(position, fontSize)));
                                    }
                                    result.right = clientXY;
                                    result.left = percent ? 1 - clientXY : dimension.width - clientXY;
                                }
                                else {
                                    result.left = clientXY;
                                    result.originalX = position;
                                }
                            }
                            else {
                                if (result.horizontal !== 'center') {
                                    result[result.horizontal] = clientXY;
                                }
                            }
                        }
                        else {
                            if (leftPerspective) {
                                if (result.vertical === 'bottom') {
                                    if (isPercent(position)) {
                                        result.originalY = formatPercent(100 - parseInt(position));
                                    }
                                    else {
                                        result.originalY = formatPX(dimension.height - parseInt(convertPX(position, fontSize)));
                                    }
                                    result.bottom = clientXY;
                                    result.top = percent ? 1 - clientXY : dimension.height - clientXY;
                                }
                                else {
                                    result.top = clientXY;
                                    result.originalY = position;
                                }
                            }
                            else {
                                if (result.vertical !== 'center') {
                                    result[result.vertical] = clientXY;
                                }
                            }
                        }
                        break;
                }
            }
        }
        else if (orientation.length === 2) {
            for (let i = 0; i < orientation.length; i++) {
                const position = orientation[i];
                let offsetParent;
                let direction;
                let original;
                if (i === 0) {
                    offsetParent = dimension.width;
                    direction = 'left';
                    original = 'originalX';
                }
                else {
                    offsetParent = dimension.height;
                    direction = 'top';
                    original = 'originalY';
                }
                const clientXY = convertPercentPX(position, offsetParent, fontSize, percent);
                if (isPercent(position)) {
                    result[direction] = clientXY;
                    result[original] = position;
                }
                else {
                    if (/^[a-z]+$/.test(position)) {
                        result[i === 0 ? 'horizontal' : 'vertical'] = position;
                        if (leftPerspective) {
                            switch (position) {
                                case 'left':
                                case 'top':
                                    result[original] = '0%';
                                    break;
                                case 'right':
                                case 'bottom':
                                    result[direction] = percent ? 1 : offsetParent;
                                    result[original] = '100%';
                                    break;
                                case 'center':
                                    result[direction] = percent ? 0.5 : Math.round(offsetParent / 2);
                                    result[original] = '50%';
                                    break;
                            }
                        }
                    }
                    else {
                        result[direction] = clientXY;
                        result[original] = position;
                    }
                }
            }
        }
        return result;
    }
    function getFirstChildElement(element, lineBreak = false) {
        if (element) {
            for (let i = 0; i < element.childNodes.length; i++) {
                const node = getElementAsNode(element.childNodes[i]);
                if (node && (!node.excluded || (lineBreak && node.lineBreak))) {
                    return node.element;
                }
            }
        }
        return null;
    }
    function getLastChildElement(element, lineBreak = false) {
        if (element) {
            for (let i = element.childNodes.length - 1; i >= 0; i--) {
                const node = getElementAsNode(element.childNodes[i]);
                if (node && node.naturalElement && (!node.excluded || (lineBreak && node.lineBreak))) {
                    return node.element;
                }
            }
        }
        return null;
    }
    function hasFreeFormText(element, whiteSpace = true) {
        function findFreeForm(elements) {
            for (let i = 0; i < elements.length; i++) {
                const child = elements[i];
                if (child.nodeName === '#text') {
                    if (isPlainText(child, whiteSpace) || cssParent(child, 'whiteSpace', 'pre', 'pre-wrap') && child.textContent && child.textContent !== '') {
                        return true;
                    }
                }
                else if (findFreeForm(child.childNodes)) {
                    return true;
                }
            }
            return false;
        }
        return findFreeForm(element.nodeName === '#text' ? [element] : element.childNodes);
    }
    function isPlainText(element, whiteSpace = false) {
        if (element && element.nodeName === '#text' && element.textContent) {
            if (whiteSpace) {
                const value = element.textContent;
                for (let i = 0; i < value.length; i++) {
                    switch (value.charCodeAt(i)) {
                        case 9:
                        case 10:
                        case 13:
                        case 32:
                            continue;
                        default:
                            return true;
                    }
                }
                return false;
            }
            else {
                return element.textContent.trim() !== '';
            }
        }
        return false;
    }
    function hasLineBreak(element, lineBreak = false, trimString = false) {
        if (element) {
            let value = element.textContent || '';
            if (trimString) {
                value = value.trim();
            }
            if (element.children) {
                for (let i = 0; i < element.children.length; i++) {
                    if (element.children[i].tagName === 'BR') {
                        return true;
                    }
                }
            }
            else if (!lineBreak && /\n/.test(value)) {
                const node = getElementAsNode(element);
                const whiteSpace = node ? node.css('whiteSpace') : (getStyle(element).whiteSpace || '');
                return ['pre', 'pre-wrap'].includes(whiteSpace) || element.nodeName === '#text' && cssParent(element, 'whiteSpace', 'pre', 'pre-wrap');
            }
        }
        return false;
    }
    function isLineBreak(element, excluded = true) {
        if (element) {
            const node = getElementAsNode(element);
            if (node) {
                return node.tagName === 'BR' || excluded && node.excluded && node.blockStatic;
            }
        }
        return false;
    }
    function getElementsBetween(elementStart, elementEnd, whiteSpace = false) {
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
                        spliceArray(result, element => element.nodeName.charAt(0) === '#' && !isPlainText(element));
                    }
                    return result;
                }
            }
        }
        return [];
    }
    function getPreviousElementSibling(element) {
        if (element) {
            element = element.previousSibling;
            while (element) {
                const node = getElementAsNode(element);
                if (node && (!node.excluded || node.lineBreak)) {
                    return node.element;
                }
                element = element.previousSibling;
            }
        }
        return null;
    }
    function getNextElementSibling(element) {
        if (element) {
            element = element.nextSibling;
            while (element) {
                const node = getElementAsNode(element);
                if (node && (!node.excluded || node.lineBreak)) {
                    return node.element;
                }
                element = element.nextSibling;
            }
        }
        return null;
    }
    function hasComputedStyle(element) {
        return !!element && typeof element['style'] === 'object';
    }
    function hasVisibleRect(element, checkViewport = false) {
        const bounds = element.getBoundingClientRect();
        return bounds.width !== 0 && bounds.height !== 0 && (!checkViewport || withinViewport(bounds));
    }
    function withinViewport(bounds) {
        return !(bounds.left < 0 && bounds.top < 0 && Math.abs(bounds.left) >= bounds.width && Math.abs(bounds.top) >= bounds.height);
    }
    function setElementCache(element, attr, data) {
        element[`__${attr}`] = data;
    }
    function getElementCache(element, attr) {
        return element[`__${attr}`] || undefined;
    }
    function deleteElementCache(element, ...attrs) {
        for (const attr of attrs) {
            delete element[`__${attr}`];
        }
    }
    function getElementAsNode(element) {
        return isString(element.className) && element.className.startsWith('squared') ? undefined : getElementCache(element, 'node');
    }

    var dom = /*#__PURE__*/Object.freeze({
        ELEMENT_BLOCK: ELEMENT_BLOCK,
        ELEMENT_INLINE: ELEMENT_INLINE,
        isUserAgent: isUserAgent,
        getDeviceDPI: getDeviceDPI,
        getKeyframeRules: getKeyframeRules,
        checkStyleAttribute: checkStyleAttribute,
        getDataSet: getDataSet,
        newBoxRect: newBoxRect,
        newRectDimension: newRectDimension,
        newBoxModel: newBoxModel,
        getDOMRect: getDOMRect,
        createElement: createElement,
        removeElementsByClassName: removeElementsByClassName,
        getRangeClientRect: getRangeClientRect,
        assignBounds: assignBounds,
        getStyle: getStyle,
        getFontSize: getFontSize,
        cssResolveUrl: cssResolveUrl,
        cssInheritStyle: cssInheritStyle,
        cssParent: cssParent,
        cssFromParent: cssFromParent,
        cssInline: cssInline,
        cssAttribute: cssAttribute,
        cssInheritAttribute: cssInheritAttribute,
        getNamedItem: getNamedItem,
        getBackgroundPosition: getBackgroundPosition,
        getFirstChildElement: getFirstChildElement,
        getLastChildElement: getLastChildElement,
        hasFreeFormText: hasFreeFormText,
        isPlainText: isPlainText,
        hasLineBreak: hasLineBreak,
        isLineBreak: isLineBreak,
        getElementsBetween: getElementsBetween,
        getPreviousElementSibling: getPreviousElementSibling,
        getNextElementSibling: getNextElementSibling,
        hasComputedStyle: hasComputedStyle,
        hasVisibleRect: hasVisibleRect,
        withinViewport: withinViewport,
        setElementCache: setElementCache,
        getElementCache: getElementCache,
        deleteElementCache: deleteElementCache,
        getElementAsNode: getElementAsNode
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
    function distanceFromX(value, angle) {
        return value * Math.sin(convertRadian(angle));
    }
    function distanceFromY(value, angle) {
        return value * Math.cos(convertRadian(angle)) * -1;
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
        return value === Math.floor(value) ? value.toString() : value.toPrecision(precision).replace(/\.?0+$/, '');
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
    function offsetAngle(start, end) {
        const y = end.y - start.y;
        const value = Math.atan2(y, end.x - start.x) * 180 / Math.PI;
        if (value < 0) {
            return 270 + (y < 0 ? value : Math.abs(value)) % 360;
        }
        else {
            return (value + 90) % 360;
        }
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
    function nextMultiple(values, offset, minimum = 0) {
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
        distanceFromX: distanceFromX,
        distanceFromY: distanceFromY,
        isEqual: isEqual$1,
        moreEqual: moreEqual,
        lessEqual: lessEqual,
        truncate: truncate,
        truncateFraction: truncateFraction,
        truncateString: truncateString,
        convertRadian: convertRadian,
        offsetAngle: offsetAngle,
        clampRange: clampRange,
        nextMultiple: nextMultiple
    });

    function replaceTemplateSection(data, value) {
        for (const index in data) {
            value = value.replace(new RegExp(`\\t*<<${index}>>[\\w\\W]*<<${index}>>`), `{%${index}}`);
        }
        return value;
    }
    const TEMPLATE_ROOT = '__ROOT__';
    function formatPlaceholder(id, symbol = ':') {
        return `{${symbol + id.toString()}}`;
    }
    function replacePlaceholder(value, id, content, before = false) {
        const hash = typeof id === 'number' ? formatPlaceholder(id) : id;
        return value.replace(hash, (before ? hash : '') + content + '\n' + (before ? '' : hash));
    }
    function pushIndent(value, depth, char = '\t') {
        if (value !== '') {
            const pattern = new RegExp(`^${char.replace('\\', '\\\\')}+`);
            return joinMap(value.split('\n'), line => {
                const match = pattern.exec(line);
                if (match) {
                    return line.replace(match[0], char.repeat(depth + match[0].length));
                }
                return line;
            });
        }
        return value;
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
                    return match[1] + '\t'.repeat(depth + (match[2].length - indent)) + match[3];
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
                    const match = line.match(/^(\t+)(.*)$/);
                    if (match) {
                        return ' '.repeat(spaces * match[1].length) + match[2];
                    }
                    return line;
                });
            }
            else {
                return value.replace(/\t/g, ' '.repeat(spaces));
            }
        }
        return value;
    }
    function replaceEntity(value) {
        return value.replace(/&#(\d+);/g, (match, capture) => String.fromCharCode(parseInt(capture)))
            .replace(/\u00A0/g, '&#160;')
            .replace(/\u2002/g, '&#8194;')
            .replace(/\u2003/g, '&#8195;')
            .replace(/\u2009/g, '&#8201;')
            .replace(/\u200C/g, '&#8204;')
            .replace(/\u200D/g, '&#8205;')
            .replace(/\u200E/g, '&#8206;')
            .replace(/\u200F/g, '&#8207;');
    }
    function replaceCharacter(value) {
        return value.replace(/&nbsp;/g, '&#160;')
            .replace(/&(?!#?[A-Za-z0-9]{2,};)/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/'/g, '&apos;')
            .replace(/"/g, '&quot;');
    }
    function parseTemplate(value) {
        const result = {};
        function parseSection(section) {
            const data = {};
            const pattern = /(\t*<<(\w+)>>)\n*[\w\W]*\n*\1/g;
            let match;
            while ((match = pattern.exec(section)) !== null) {
                const seg = match[0].replace(new RegExp(`^${match[1]}\\n`), '').replace(new RegExp(`${match[1]}$`), '');
                data[match[2]] = replaceTemplateSection(parseSection(seg), seg);
            }
            Object.assign(result, data);
            return data;
        }
        result[TEMPLATE_ROOT] = replaceTemplateSection(parseSection(value), value);
        return result;
    }
    function createTemplate(value, data, format = false, index) {
        if (index === undefined) {
            index = TEMPLATE_ROOT;
        }
        let output = value[index] || '';
        for (const attr in data) {
            if (data[attr] !== undefined && data[attr] !== null) {
                const unknown = data[attr];
                let result = '';
                let hash = '';
                if (Array.isArray(unknown)) {
                    hash = '%';
                    if (Array.isArray(unknown[0])) {
                        function partial(section) {
                            return `((\\t*##${attr}-${section}##\\s*\\n)([\\w\\W]*?\\s*\\n)(\\t*##${attr}-${section}##\\s*\\n))`;
                        }
                        const match = new RegExp(partial('start') + `([\\w\\W]*?)` + partial('end')).exec(output);
                        if (match) {
                            const depth = unknown[0].length;
                            const guard = Object.assign({}, value);
                            let tagStart = '';
                            let tagEnd = '';
                            for (let i = 0; i < depth; i++) {
                                const key = `${index}_${attr}_${i}`;
                                guard[key] = match[3];
                                tagStart += createTemplate(guard, unknown[0][i], format, key);
                                tagEnd = match[8] + tagEnd;
                            }
                            output = output.replace(match[1], tagStart).replace(match[6], tagEnd);
                        }
                        else {
                            result = false;
                        }
                    }
                    else if (unknown.length === 0 || typeof unknown[0] !== 'object') {
                        result = false;
                    }
                    else {
                        for (let i = 0; i < unknown.length; i++) {
                            result += createTemplate(value, unknown[i], format, attr.toString());
                        }
                        if (result !== '') {
                            result = trimEnd(result, '\n');
                        }
                        else {
                            result = false;
                        }
                    }
                }
                else {
                    hash = '[&~]';
                    result = typeof unknown === 'boolean' ? false : unknown.toString();
                }
                if (!result) {
                    if (new RegExp(`{&${attr}}`).test(output)) {
                        return '';
                    }
                    else if (hash === '%') {
                        output = output.replace(new RegExp(`[ \\t]*{%${attr}}\\n*`), '');
                    }
                }
                else if (result !== '') {
                    output = output.replace(new RegExp(`{${hash + attr}}`), result);
                }
            }
        }
        if (index === TEMPLATE_ROOT) {
            output = output.replace(/\n*\t*{%\w+}\n+/g, '\n').replace(/\n\n/g, '\n').trim();
            if (format) {
                output = formatTemplate(output);
            }
        }
        return output.replace(/\s*((\w+:)?\w+="[^"]*)?{~\w+}"?/g, '');
    }
    function formatTemplate(value, closeEmpty = true, char = '\t') {
        const lines = [];
        const pattern = /\s*(<(\/)?([?\w]+)[^>]*>)\n?([^<]*)/g;
        let match;
        while ((match = pattern.exec(value)) !== null) {
            lines.push({
                tag: match[1],
                closing: !!match[2],
                tagName: match[3],
                value: match[4].trim() === '' ? '' : match[4]
            });
        }
        const closed = /\/>\n*$/;
        let output = '';
        let indent = -1;
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            let previous = indent;
            if (i > 0) {
                if (line.closing) {
                    indent--;
                }
                else {
                    previous++;
                    if (!closed.exec(line.tag)) {
                        if (closeEmpty && line.value.trim() === '') {
                            const next = lines[i + 1];
                            if (next && next.closing && next.tagName === line.tagName) {
                                line.tag = line.tag.replace(/\s*>$/, ' />');
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
                output += line.tag + '\n';
            }
            output += line.value;
        }
        return output.trim();
    }

    var xml = /*#__PURE__*/Object.freeze({
        formatPlaceholder: formatPlaceholder,
        replacePlaceholder: replacePlaceholder,
        pushIndent: pushIndent,
        replaceIndent: replaceIndent,
        replaceTab: replaceTab,
        replaceEntity: replaceEntity,
        replaceCharacter: replaceCharacter,
        parseTemplate: parseTemplate,
        createTemplate: createTemplate,
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
            if (Array.isArray(exports.settings.builtInExtensions)) {
                const register = new Set();
                for (let namespace of exports.settings.builtInExtensions) {
                    namespace = namespace.trim();
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
        if (main && !main.initialized && main.size) {
            main.finalize();
        }
    }
    function reset() {
        if (main) {
            main.reset();
        }
    }
    function saveAllToDisk() {
        if (main && !main.initialized && main.size) {
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
        dom,
        math,
        util,
        xml
    };

    exports.setFramework = setFramework;
    exports.parseDocument = parseDocument;
    exports.include = include;
    exports.includeAsync = includeAsync;
    exports.exclude = exclude;
    exports.configure = configure;
    exports.apply = apply;
    exports.retrieve = retrieve;
    exports.ready = ready;
    exports.close = close;
    exports.reset = reset;
    exports.saveAllToDisk = saveAllToDisk;
    exports.toString = toString;
    exports.lib = lib;

    Object.defineProperty(exports, '__esModule', { value: true });

}));
