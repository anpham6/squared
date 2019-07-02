/* squared 1.2.3
   https://github.com/anpham6/squared */

(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
    typeof define === 'function' && define.amd ? define(['exports'], factory) :
    (global = global || self, factory(global.squared = {}));
}(this, function (exports) { 'use strict';

    const DECIMAL = '-?\\d+(?:\\.\\d+)?';
    const UNIT_TYPE = 'px|em|pt|rem|ch|pc|vw|vh|vmin|vmax|mm|cm|in';
    const STRING = {
        DECIMAL,
        PERCENT: '-?\\d+(?:\\.\\d+)?%',
        LENGTH: `(${DECIMAL})(${UNIT_TYPE})?`,
        LENGTH_PERCENTAGE: `(${DECIMAL}(?:${UNIT_TYPE}|%)?)`,
        DATAURI: '(?:data:([^;]+);([^,]+),)?(.*?)',
        CSS_SELECTOR_LABEL: '[\\.#]?[\\w\\-]+',
        CSS_SELECTOR_PSEUDO_ELEMENT: '::[\\w\\-]+',
        CSS_SELECTOR_PSEUDO_CLASS: ':[\\w\\-]+(?:\\(\\s*([^()]+)\\s*\\)|\\(\\s*([\\w\\-]+\\(.+?\\))\\s*\\))?',
        CSS_SELECTOR_ATTR: '\\[([\\w\\-]+)(?:([~^$*|])?=(?:"([^"]+)"|\'([^\']+)\'|([^\\s\\]]+))\\s*(i)?)?\\]',
        CSS_ANGLE: `(${DECIMAL})(deg|rad|turn|grad)`,
        CSS_CALC: 'calc(\\(.+\\))'
    };
    const UNIT = {
        DECIMAL: new RegExp(`^${STRING.DECIMAL}$`),
        LENGTH: new RegExp(`^${STRING.LENGTH}$`),
        PERCENT: new RegExp(`^${STRING.PERCENT}$`)
    };
    const CSS = {
        ANGLE: new RegExp(`^${STRING.CSS_ANGLE}$`),
        CALC: new RegExp(`^${STRING.CSS_CALC}$`),
        VAR: /var\((--[A-Za-z\d\-]+)(?!,\s*var\()(?:,\s*([a-z\-]+\([^)]+\)|[^)]+))?\)/,
        URL: /^url\("?(.+?)"?\)$/,
        CUSTOM_PROPERTY: /^(?:var|calc)\(.+\)$/,
        HEX: /[A-Za-z\d]{3,8}/,
        RGBA: /rgba?\((\d+), (\d+), (\d+)(?:, ([\d.]+))?\)/,
        SELECTOR_G: new RegExp(`\\s*((?:${STRING.CSS_SELECTOR_ATTR}|${STRING.CSS_SELECTOR_PSEUDO_CLASS}|${STRING.CSS_SELECTOR_PSEUDO_ELEMENT}|${STRING.CSS_SELECTOR_LABEL})+|[>~+])\\s*`, 'g'),
        SELECTOR_LABEL: new RegExp(STRING.CSS_SELECTOR_LABEL),
        SELECTOR_PSEUDO_ELEMENT: new RegExp(STRING.CSS_SELECTOR_PSEUDO_ELEMENT),
        SELECTOR_PSEUDO_CLASS: new RegExp(STRING.CSS_SELECTOR_PSEUDO_CLASS),
        SELECTOR_ATTR: new RegExp(STRING.CSS_SELECTOR_ATTR)
    };
    const XML = {
        ATTRIBUTE: /([^\s]+)="([^"]+)"/,
        ENTITY: /&#?[A-Za-z\d]+;/,
        SEPARATOR: /\s*,\s*/,
        BREAKWORD_G: /([A-Za-z\d]+|&#?[A-Za-z\d]+;)/g,
        NONWORD_G: /[^A-Za-z\d]+/g,
        TAGNAME_G: /(<([^>]+)>)/g
    };
    const CHAR = {
        SPACE: /\s+/,
        LEADINGSPACE: /^\s+/,
        TRAILINGSPACE: /\s+$/,
        TRAILINGZERO: /\.(\d*?)(0+)$/,
        LEADINGNEWLINE: /^\s*\n+/,
        LEADINGNUMBER: /^\d/,
        LOWERCASE: /^[a-z]+$/,
        WORD: /\w/,
        WORDDASH: /[a-zA-Z\d]/
    };
    const COMPONENT = {
        PROTOCOL: /^([A-Za-z]+:\/\/)([A-Za-z0-9\-.]+)(:[0-9]+)?(\/.*)?$/
    };
    const ESCAPE = {
        ENTITY: /&#(\d+);/g,
        NONENTITY: /&(?!#?[A-Za-z\d]{2,};)/g
    };

    var regex = /*#__PURE__*/Object.freeze({
        STRING: STRING,
        UNIT: UNIT,
        CSS: CSS,
        XML: XML,
        CHAR: CHAR,
        COMPONENT: COMPONENT,
        ESCAPE: ESCAPE
    });

    const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const NUMERALS = [
        '', 'C', 'CC', 'CCC', 'CD', 'D', 'DC', 'DCC', 'DCCC', 'CM',
        '', 'X', 'XX', 'XXX', 'XL', 'L', 'LX', 'LXX', 'LXXX', 'XC',
        '', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX'
    ];
    const CACHE_CAMELCASE = {};
    const CACHE_UNDERSCORE = {};
    function capitalize(value, upper = true) {
        return upper ? value.charAt(0).toUpperCase() + value.substring(1).toLowerCase() : value.charAt(0).toLowerCase() + value.substring(1);
    }
    function capitalizeString(value) {
        XML.BREAKWORD_G.lastIndex = 0;
        const result = value.split('');
        let match;
        while ((match = XML.BREAKWORD_G.exec(value)) !== null) {
            if (match.index !== undefined) {
                result[match.index] = match[1].charAt(0).toUpperCase();
            }
        }
        return result.join('');
    }
    function lowerCaseString(value) {
        XML.BREAKWORD_G.lastIndex = 0;
        let result = value;
        let match;
        while ((match = XML.BREAKWORD_G.exec(value)) !== null) {
            if (match.index !== undefined && !XML.ENTITY.test(match[1])) {
                result = (match.index > 0 ? result.substring(0, match.index) : '') + value.substring(match.index, match.index + match[1].length).toLowerCase() + result.substring(match.index + match[1].length);
            }
        }
        return result;
    }
    function spliceString(value, index, length) {
        if (index === 0) {
            return value.substring(length);
        }
        return value.substring(0, index) + value.substring(index + length);
    }
    function convertUnderscore(value) {
        if (CACHE_UNDERSCORE[value]) {
            return CACHE_UNDERSCORE[value];
        }
        let result = value[0].toLowerCase();
        let lower = true;
        const length = value.length;
        for (let i = 1; i < length; i++) {
            const ch = value[i];
            const upper = ch === ch.toUpperCase();
            if (ch !== '_' && lower && upper) {
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
    function convertCamelCase(value, char = '-') {
        if (CACHE_CAMELCASE[value]) {
            return CACHE_CAMELCASE[value];
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
    function convertWord(value, dash = false) {
        const pattern = dash ? CHAR.WORDDASH : CHAR.WORD;
        let result = '';
        const length = value.length;
        for (let i = 0; i < length; i++) {
            const ch = value.charAt(i);
            result += pattern.test(ch) ? ch : '_';
        }
        return result;
    }
    function convertInt(value) {
        return parseInt(value) || 0;
    }
    function convertFloat(value) {
        return parseFloat(value) || 0;
    }
    function convertAlpha(value) {
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
    function buildAlphaString(length) {
        let result = '';
        for (let i = 0; i < length; i++) {
            result += ALPHABET.charAt(Math.floor(Math.random() * 26));
        }
        return result;
    }
    function formatString(value, ...params) {
        const length = params.length;
        for (let i = 0; i < length; i++) {
            value = value.replace(`{${i}}`, params[i]);
        }
        return value;
    }
    function hasBit(value, offset) {
        return (value & offset) === offset;
    }
    function isNumber(value) {
        return typeof value === 'string' && UNIT.DECIMAL.test(value.trim());
    }
    function isString(value) {
        return typeof value === 'string' && value.trim() !== '';
    }
    function isArray(value) {
        return Array.isArray(value) && value.length > 0;
    }
    function isPlainObject(value) {
        return typeof value === 'object' && value !== null && value.constructor === Object;
    }
    function isEqual(source, values) {
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
            else if (object && isPlainObject(value)) {
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
            else if (isPlainObject(value)) {
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
        if (typeof obj === 'object' && obj !== null) {
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
        if (!COMPONENT.PROTOCOL.test(value)) {
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
                    pathname = pathname.slice(0, Math.max(pathname.length - levels, 0)).concat(segments);
                    value = location.origin + pathname.join('/');
                }
                else {
                    value = location.origin + pathname.join('/') + '/' + value;
                }
            }
        }
        return value;
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
    function fromLastIndexOf(value, ...char) {
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
            const search = /^\*.+\*$/.test(value) ? (a) => a.indexOf(value.replace(/\*/g, '')) !== -1 :
                /^\*/.test(value) ? (a) => a.endsWith(value.replace(/\*/, '')) :
                    /\*$/.test(value) ? (a) => a.startsWith(value.replace(/\*/, '')) :
                        (a) => a === value;
            for (const i in obj) {
                if (search(i)) {
                    result.push([i, obj[i]]);
                }
            }
        }
        return result;
    }
    function hasValue(value) {
        return value !== undefined && value !== null && value !== '';
    }
    function withinRange(a, b, offset = 1) {
        return b >= (a - offset) && b <= (a + offset);
    }
    function aboveRange(a, b, offset = 1) {
        return a + offset > b;
    }
    function belowRange(a, b, offset = 1) {
        return a - offset < b;
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
    function sortNumber(values, ascending = true) {
        return ascending ? values.sort((a, b) => a < b ? -1 : 1) : values.sort((a, b) => a > b ? -1 : 1);
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
        for (let i = 0; i < list.length; i++) {
            const item = list[i];
            if (item === undefined || item === null) {
                list.splice(i--, 1);
            }
        }
        return list;
    }
    function flatMultiArray(list) {
        const result = [];
        const length = list.length;
        for (let i = 0; i < length; i++) {
            const item = list[i];
            if (Array.isArray(item)) {
                if (item.length) {
                    result.push(...flatMultiArray(item));
                }
            }
            else if (item !== undefined && item !== null) {
                result.push(item);
            }
        }
        return result;
    }
    function partitionArray(list, predicate) {
        const length = list.length;
        const valid = new Array(length);
        const invalid = new Array(length);
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
        const length = list.length;
        const result = new Array(length);
        let j = 0;
        for (let i = 0; i < length; i++) {
            if (predicate(list[i], i, list)) {
                result[j++] = list[i];
            }
        }
        result.length = j;
        return result;
    }
    function sameArray(list, predicate) {
        const length = list.length;
        if (length) {
            let baseValue;
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
    function flatMap(list, predicate) {
        const length = list.length;
        const result = new Array(length);
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
    function filterMap(list, predicate, callback) {
        const length = list.length;
        const result = new Array(length);
        let j = 0;
        for (let i = 0; i < length; i++) {
            if (predicate(list[i], i, list)) {
                result[j++] = callback(list[i], i, list);
            }
        }
        result.length = j;
        return result;
    }
    function replaceMap(list, predicate) {
        const length = list.length;
        for (let i = 0; i < length; i++) {
            list[i] = predicate(list[i], i, list);
        }
        return list;
    }
    function objectMap(list, predicate) {
        const length = list.length;
        const result = new Array(length);
        for (let i = 0; i < length; i++) {
            result[i] = predicate(list[i], i, list);
        }
        return result;
    }
    function joinMap(list, predicate, char = '\n', trailing = false) {
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
    function captureMap(list, predicate, callback) {
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

    var util = /*#__PURE__*/Object.freeze({
        capitalize: capitalize,
        capitalizeString: capitalizeString,
        lowerCaseString: lowerCaseString,
        spliceString: spliceString,
        convertUnderscore: convertUnderscore,
        convertCamelCase: convertCamelCase,
        convertWord: convertWord,
        convertInt: convertInt,
        convertFloat: convertFloat,
        convertAlpha: convertAlpha,
        convertRoman: convertRoman,
        convertEnum: convertEnum,
        buildAlphaString: buildAlphaString,
        formatString: formatString,
        hasBit: hasBit,
        isNumber: isNumber,
        isString: isString,
        isArray: isArray,
        isPlainObject: isPlainObject,
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
        trimString: trimString,
        trimStart: trimStart,
        trimEnd: trimEnd,
        fromLastIndexOf: fromLastIndexOf,
        searchObject: searchObject,
        hasValue: hasValue,
        withinRange: withinRange,
        aboveRange: aboveRange,
        belowRange: belowRange,
        assignEmptyProperty: assignEmptyProperty,
        assignEmptyValue: assignEmptyValue,
        sortNumber: sortNumber,
        sortArray: sortArray,
        flatArray: flatArray,
        flatMultiArray: flatMultiArray,
        partitionArray: partitionArray,
        spliceArray: spliceArray,
        filterArray: filterArray,
        sameArray: sameArray,
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
            const data = { done: false, value: undefined };
            const list = this._children;
            const length = list.length;
            let i = 0;
            return {
                next() {
                    if (i < length) {
                        data.value = list[i++];
                    }
                    else {
                        data.done = true;
                    }
                    return data;
                }
            };
        }
        item(index, value) {
            if (index !== undefined) {
                if (value !== undefined) {
                    if (index >= 0 && index < this._children.length) {
                        this._children[index] = value;
                        return value;
                    }
                    return undefined;
                }
                return this._children[index];
            }
            return this._children[this._children.length - 1];
        }
        append(item) {
            this._children.push(item);
            return this;
        }
        remove(item) {
            const children = this._children;
            const length = children.length;
            for (let i = 0; i < length; i++) {
                if (children[i] === item) {
                    return children.splice(i, 1);
                }
            }
            return [];
        }
        contains(item) {
            return this._children.includes(item);
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
            const children = this._children;
            const length = children.length;
            for (let i = 0; i < length; i++) {
                predicate(children[i], i, children);
            }
            return this;
        }
        find(predicate, value) {
            const children = this._children;
            const length = children.length;
            if (typeof predicate === 'string') {
                for (let i = 0; i < length; i++) {
                    if (children[i][predicate] === value) {
                        return children[i];
                    }
                }
            }
            else {
                for (let i = 0; i < length; i++) {
                    if (predicate(children[i], i, children)) {
                        return children[i];
                    }
                }
            }
            return undefined;
        }
        sort(predicate) {
            if (predicate) {
                this._children.sort(predicate);
            }
            return this;
        }
        concat(list) {
            this._children = this._children.concat(list);
            return this;
        }
        every(predicate) {
            const children = this._children;
            const length = children.length;
            if (length) {
                for (let i = 0; i < length; i++) {
                    if (!predicate(children[i], i, children)) {
                        return false;
                    }
                }
                return true;
            }
            return false;
        }
        some(predicate) {
            const children = this._children;
            const length = children.length;
            for (let i = 0; i < length; i++) {
                if (predicate(children[i], i, children)) {
                    return true;
                }
            }
            return false;
        }
        same(predicate) {
            return sameArray(this._children, predicate);
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
                const children = container.children;
                const length = children.length;
                for (let i = 0; i < length; i++) {
                    const item = children[i];
                    if (predicate(item, i, children)) {
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
        cascade(predicate) {
            function cascade(container) {
                let result = [];
                for (const item of container.children) {
                    if (predicate === undefined || predicate(item)) {
                        result.push(item);
                    }
                    if (item instanceof Container && item.length) {
                        result = result.concat(cascade(item));
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
    const COLOR_CSS3 = [
        {
            value: '#000000',
            key: 'black',
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
            key: 'dimgray',
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
            key: 'dimgrey',
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
            key: 'gray',
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
            key: 'grey',
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
            key: 'darkgray',
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
            key: 'darkgrey',
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
            key: 'silver',
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
            key: 'lightgray',
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
            key: 'lightgrey',
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
            key: 'gainsboro',
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
            key: 'whitesmoke',
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
            key: 'white',
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
            key: 'rosybrown',
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
            key: 'indianred',
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
            key: 'brown',
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
            key: 'firebrick',
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
            key: 'lightcoral',
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
            key: 'maroon',
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
            key: 'darkred',
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
            key: 'red',
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
            key: 'snow',
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
            key: 'mistyrose',
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
            key: 'salmon',
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
            key: 'tomato',
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
            key: 'darksalmon',
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
            key: 'coral',
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
            key: 'orangered',
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
            key: 'lightsalmon',
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
            key: 'sienna',
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
            key: 'seashell',
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
            key: 'chocolate',
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
            key: 'saddlebrown',
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
            key: 'sandybrown',
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
            key: 'peachpuff',
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
            key: 'peru',
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
            key: 'linen',
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
            key: 'bisque',
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
            key: 'darkorange',
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
            key: 'burlywood',
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
            key: 'antiquewhite',
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
            key: 'tan',
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
            key: 'navajowhite',
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
            key: 'blanchedalmond',
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
            key: 'papayawhip',
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
            key: 'moccasin',
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
            key: 'orange',
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
            key: 'wheat',
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
            key: 'oldlace',
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
            key: 'floralwhite',
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
            key: 'darkgoldenrod',
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
            key: 'goldenrod',
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
            key: 'cornsilk',
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
            key: 'gold',
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
            key: 'lemonchiffon',
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
            key: 'khaki',
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
            key: 'palegoldenrod',
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
            key: 'darkkhaki',
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
            key: 'beige',
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
            key: 'lightgoldenrodyellow',
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
            key: 'olive',
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
            key: 'yellow',
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
            key: 'lightyellow',
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
            key: 'ivory',
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
            key: 'olivedrab',
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
            key: 'yellowgreen',
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
            key: 'darkolivegreen',
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
            key: 'greenyellow',
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
            key: 'chartreuse',
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
            key: 'lawngreen',
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
            key: 'darkseagreen',
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
            key: 'forestgreen',
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
            key: 'limegreen',
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
            key: 'lightgreen',
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
            key: 'palegreen',
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
            key: 'darkgreen',
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
            key: 'green',
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
            key: 'lime',
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
            key: 'honeydew',
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
            key: 'seagreen',
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
            key: 'mediumseagreen',
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
            key: 'springgreen',
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
            key: 'mintcream',
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
            key: 'mediumspringgreen',
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
            key: 'mediumaquamarine',
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
            key: 'aquamarine',
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
            key: 'turquoise',
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
            key: 'lightseagreen',
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
            key: 'mediumturquoise',
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
            key: 'darkslategray',
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
            key: 'darkslategrey',
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
            key: 'paleturquoise',
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
            key: 'teal',
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
            key: 'darkcyan',
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
            key: 'aqua',
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
            key: 'cyan',
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
            key: 'lightcyan',
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
            key: 'azure',
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
            key: 'darkturquoise',
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
            key: 'cadetblue',
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
            key: 'powderblue',
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
            key: 'lightblue',
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
            key: 'deepskyblue',
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
            key: 'skyblue',
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
            key: 'lightskyblue',
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
            key: 'steelblue',
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
            key: 'aliceblue',
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
            key: 'dodgerblue',
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
            key: 'slategray',
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
            key: 'slategrey',
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
            key: 'lightslategray',
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
            key: 'lightslategrey',
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
            key: 'lightsteelblue',
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
            key: 'cornflower',
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
            key: 'royalblue',
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
            key: 'midnightblue',
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
            key: 'lavender',
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
            key: 'navy',
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
            key: 'darkblue',
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
            key: 'mediumblue',
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
            key: 'blue',
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
            key: 'ghostwhite',
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
            key: 'slateblue',
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
            key: 'darkslateblue',
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
            key: 'mediumslateblue',
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
            key: 'mediumpurple',
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
            key: 'blueviolet',
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
            key: 'indigo',
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
            key: 'darkorchid',
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
            key: 'darkviolet',
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
            key: 'mediumorchid',
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
            key: 'thistle',
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
            key: 'plum',
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
            key: 'violet',
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
            key: 'purple',
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
            key: 'darkmagenta',
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
            key: 'fuchsia',
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
            key: 'magenta',
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
            key: 'orchid',
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
            key: 'mediumvioletred',
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
            key: 'deeppink',
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
            key: 'hotpink',
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
            key: 'lavenderblush',
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
            key: 'palevioletred',
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
            key: 'crimson',
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
            key: 'pink',
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
            key: 'lightpink',
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
    const CACHE_COLORDATA = {};
    const parseOpacity = (value) => parseFloat(value.trim() || '1') * 255;
    function findColorName(value) {
        for (const color of COLOR_CSS3) {
            if (color.key === value.toLowerCase()) {
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
                else if (hsl.h <= color.hsl.h) {
                    result.push(color);
                    baseline = color.hsl.h;
                }
            }
            const length = result.length;
            if (length === 1) {
                return result[0];
            }
            else if (length > 1) {
                const total = hsl.l + hsl.s;
                let nearest = Number.POSITIVE_INFINITY;
                let index = -1;
                for (let i = 0; i < length; i++) {
                    const offset = Math.abs(total - (result[i].hsl.l + result[i].hsl.s));
                    if (offset < nearest) {
                        nearest = offset;
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
            if (CACHE_COLORDATA[value] && opacity === '1') {
                return CACHE_COLORDATA[value];
            }
            let key = '';
            let rgba;
            if (value.charAt(0) === '#') {
                rgba = parseRGBA(value);
            }
            else if (value.startsWith('rgb')) {
                const match = CSS.RGBA.exec(value);
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
                        key = 'transparent';
                        break;
                    case 'initial':
                        rgba = { r: 0, g: 0, b: 0, a: 255 };
                        key = 'black';
                        break;
                    default:
                        const color = findColorName(value);
                        if (color) {
                            rgba = color.rgb;
                            rgba.a = parseOpacity(opacity);
                            key = value;
                        }
                        break;
                }
            }
            if (rgba && (rgba.a > 0 || transparency)) {
                const hexAsString = getHexCode(rgba.r, rgba.g, rgba.b);
                const alphaAsString = getHexCode(rgba.a);
                const valueAsRGBA = `#${hexAsString + alphaAsString}`;
                if (CACHE_COLORDATA[valueAsRGBA]) {
                    return CACHE_COLORDATA[valueAsRGBA];
                }
                const alpha = rgba.a / 255;
                const colorData = {
                    key,
                    value: `#${hexAsString}`,
                    valueAsRGBA,
                    valueAsARGB: `#${alphaAsString + hexAsString}`,
                    rgba,
                    hsl: convertHSLA(rgba),
                    opacity: alpha,
                    semiopaque: alpha > 0 && alpha < 1,
                    transparent: alpha === 0
                };
                if (opacity === '1') {
                    CACHE_COLORDATA[value] = colorData;
                }
                else {
                    CACHE_COLORDATA[valueAsRGBA] = colorData;
                }
                return colorData;
            }
        }
        return undefined;
    }
    function reduceRGBA(value, percent, cacheName) {
        if (cacheName) {
            cacheName = `${cacheName}_${percent}`;
            if (CACHE_COLORDATA[cacheName]) {
                return CACHE_COLORDATA[cacheName];
            }
        }
        if (value.r === 0 && value.g === 0 && value.b === 0) {
            value = { r: 255, g: 255, b: 255, a: value.a };
            if (percent > 0) {
                percent *= -1;
            }
        }
        const base = percent < 0 ? 0 : 255;
        percent = Math.abs(percent);
        const result = parseColor(formatRGBA({
            r: (value.r + Math.round((base - value.r) * percent)) % 255,
            g: (value.g + Math.round((base - value.g) * percent)) % 255,
            b: (value.b + Math.round((base - value.b) * percent)) % 255,
            a: value.a
        }));
        if (cacheName) {
            CACHE_COLORDATA[cacheName] = result;
        }
        return result;
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
        if (CSS.HEX.test(value)) {
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
        reduceRGBA: reduceRGBA,
        getHexCode: getHexCode,
        convertHex: convertHex,
        parseRGBA: parseRGBA,
        convertHSLA: convertHSLA,
        formatRGBA: formatRGBA,
        formatHSLA: formatHSLA
    });

    const CSS$1 = {
        TOP: 'top',
        RIGHT: 'right',
        BOTTOM: 'bottom',
        LEFT: 'left',
        START: 'start',
        END: 'end',
        CENTER: 'center',
        MIDDLE: 'middle',
        PX_0: '0px',
        PERCENT_0: '0%',
        PERCENT_50: '50%',
        PERCENT_100: '100%',
        WIDTH: 'width',
        HEIGHT: 'height',
        AUTO: 'auto',
        NONE: 'none'
    };

    var constant = /*#__PURE__*/Object.freeze({
        CSS: CSS$1
    });

    function isPlatform(value) {
        const platform = navigator.platform.toLowerCase();
        if (typeof value === 'string') {
            return platform.indexOf(value.toLowerCase()) !== -1;
        }
        else {
            if (hasBit(value, 4 /* MAC */) && /mac|iphone|ipad/.test(platform)) {
                return true;
            }
            else if (hasBit(value, 2 /* WINDOWS */) && /windows/.test(platform)) {
                return true;
            }
        }
        return false;
    }
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
        let client = 2 /* CHROME */;
        if (userAgent.indexOf('Safari') !== -1 && userAgent.indexOf('Chrome') === -1) {
            client = 4 /* SAFARI */;
        }
        else if (userAgent.indexOf('Firefox') !== -1) {
            client = 8 /* FIREFOX */;
        }
        else if (userAgent.indexOf('Edge') !== -1) {
            client = 16 /* EDGE */;
        }
        return hasBit(value, client);
    }
    function getDeviceDPI() {
        return window.devicePixelRatio * 96;
    }

    var client = /*#__PURE__*/Object.freeze({
        isPlatform: isPlatform,
        isUserAgent: isUserAgent,
        getDeviceDPI: getDeviceDPI
    });

    const ELEMENT_BLOCK = [
        'ADDRESS',
        'ARTICLE',
        'ASIDE',
        'BLOCKQUOTE',
        'DD',
        'DETAILS',
        'DIALOG',
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
        'HGROUP',
        'HR',
        'LI',
        'MAIN',
        'NAV',
        'OL',
        'P',
        'PRE',
        'SECTION',
        'TABLE',
        'UL'
    ];
    function newBoxRect() {
        return {
            top: 0,
            left: 0,
            right: 0,
            bottom: 0
        };
    }
    function newBoxRectDimension() {
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
    function assignRect(rect, scrollPosition = false) {
        const result = {
            top: rect.top,
            right: rect.right,
            bottom: rect.bottom,
            left: rect.left,
            width: rect.width,
            height: rect.height
        };
        if (scrollPosition) {
            if (window.scrollY !== 0) {
                result.top += window.scrollY;
                result.bottom += window.scrollY;
            }
            if (window.scrollX !== 0) {
                result.left += window.scrollX;
                result.right += window.scrollX;
            }
        }
        return result;
    }
    function removeElementsByClassName(className) {
        for (const element of Array.from(document.getElementsByClassName(className))) {
            if (element.parentElement) {
                element.parentElement.removeChild(element);
            }
        }
    }
    function getElementsBetweenSiblings(elementStart, elementEnd, whiteSpace = false) {
        if (!elementStart || elementStart.parentElement === elementEnd.parentElement) {
            const parent = elementEnd.parentElement;
            if (parent) {
                let startIndex = elementStart ? -1 : 0;
                let endIndex = -1;
                const elements = Array.from(parent.childNodes);
                const length = elements.length;
                for (let i = 0; i < length; i++) {
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
    function createElement(parent, tagName, attrs) {
        const element = document.createElement(tagName);
        for (const attr in attrs) {
            element.style.setProperty(attr, attrs[attr]);
        }
        parent.appendChild(element);
        return element;
    }
    function measureTextWidth(value, fontFamily, fontSize) {
        if (fontFamily && fontSize) {
            const canvas = document.createElement('canvas');
            const context = canvas.getContext('2d');
            if (context) {
                context.font = `${fontSize}px ${fontFamily}`;
                return context.measureText(value).width;
            }
        }
        return 0;
    }
    function getNamedItem(element, attr) {
        const item = element.attributes.getNamedItem(attr);
        if (item) {
            return item.value.trim();
        }
        return '';
    }
    function isPlainText(element) {
        return element.nodeName === '#text';
    }

    var dom = /*#__PURE__*/Object.freeze({
        ELEMENT_BLOCK: ELEMENT_BLOCK,
        newBoxRect: newBoxRect,
        newBoxRectDimension: newBoxRectDimension,
        newBoxModel: newBoxModel,
        assignRect: assignRect,
        removeElementsByClassName: removeElementsByClassName,
        getElementsBetweenSiblings: getElementsBetweenSiblings,
        createElement: createElement,
        measureTextWidth: measureTextWidth,
        getNamedItem: getNamedItem,
        isPlainText: isPlainText
    });

    function getClientRect(element, sessionId, cache = true) {
        if (cache) {
            const rect = getElementCache(element, 'boundingClientRect', sessionId);
            if (rect) {
                return rect;
            }
        }
        const bounds = element.getBoundingClientRect();
        setElementCache(element, 'boundingClientRect', sessionId, bounds);
        return bounds;
    }
    function getRangeClientRect(element, sessionId, cache = true) {
        if (cache) {
            const rect = getElementCache(element, 'rangeClientRect', sessionId);
            if (rect) {
                return rect;
            }
        }
        const range = document.createRange();
        range.selectNodeContents(element);
        const clientRects = range.getClientRects();
        let length = clientRects.length;
        const domRect = [];
        for (let i = 0; i < length; i++) {
            const item = clientRects.item(i);
            if (Math.round(item.width) > 0 && !withinRange(item.left, item.right, 0.5)) {
                domRect.push(item);
            }
        }
        let bounds;
        let maxTop = Number.NEGATIVE_INFINITY;
        length = domRect.length;
        if (length) {
            bounds = assignRect(domRect[0]);
            for (let i = 1; i < length; i++) {
                const rect = domRect[i];
                if (rect.left < bounds.left) {
                    bounds.left = rect.left;
                }
                if (rect.right > bounds.right) {
                    bounds.right = rect.right;
                }
                if (rect.top < bounds.top) {
                    bounds.top = rect.top;
                }
                if (rect.bottom > bounds.bottom) {
                    bounds.bottom = rect.bottom;
                }
                bounds.width += rect.width;
                if (rect.top > maxTop) {
                    maxTop = rect.top;
                }
            }
            bounds.height = bounds.bottom - bounds.top;
            if (domRect.length > 1 && maxTop >= domRect[0].bottom && element.textContent && (element.textContent.trim() !== '' || /^\s*\n/.test(element.textContent))) {
                bounds.numberOfLines = domRect.length - 1;
            }
        }
        else {
            bounds = newBoxRectDimension();
        }
        setElementCache(element, 'rangeClientRect', sessionId, bounds);
        return bounds;
    }
    function setElementCache(element, attr, sessionId, data) {
        element[`__${attr}::${sessionId}`] = data;
    }
    function getElementCache(element, attr, sessionId) {
        if (!sessionId) {
            sessionId = element['__sessionId::0'];
        }
        return element[`__${attr}::${sessionId}`];
    }
    function deleteElementCache(element, attr, sessionId) {
        delete element[`__${attr}::${sessionId}`];
    }
    function getElementAsNode(element, sessionId) {
        return getElementCache(element, 'node', sessionId) || undefined;
    }

    var session = /*#__PURE__*/Object.freeze({
        getClientRect: getClientRect,
        getRangeClientRect: getRangeClientRect,
        setElementCache: setElementCache,
        getElementCache: getElementCache,
        deleteElementCache: deleteElementCache,
        getElementAsNode: getElementAsNode
    });

    const CACHE_PATTERN = {};
    function compareRange(operation, unit, range) {
        switch (operation) {
            case '<=':
                return unit <= range;
            case '<':
                return unit < range;
            case '>=':
                return unit >= range;
            case '>':
                return unit > range;
            default:
                return unit === range;
        }
    }
    const convertLength = (value, dimension, fontSize) => isPercent(value) ? Math.round(dimension * (convertFloat(value) / 100)) : parseUnit(value, fontSize);
    const convertPercent = (value, dimension, fontSize) => isPercent(value) ? parseFloat(value) / 100 : parseUnit(value, fontSize) / dimension;
    const BOX_POSITION = [CSS$1.TOP, CSS$1.RIGHT, CSS$1.BOTTOM, CSS$1.LEFT];
    const BOX_MARGIN = ['marginTop', 'marginRight', 'marginBottom', 'marginLeft'];
    const BOX_BORDER = [
        ['borderTopStyle', 'borderTopWidth', 'borderTopColor'],
        ['borderRightStyle', 'borderRightWidth', 'borderRightColor'],
        ['borderBottomStyle', 'borderBottomWidth', 'borderBottomColor'],
        ['borderLeftStyle', 'borderLeftWidth', 'borderLeftColor'],
        ['outlineStyle', 'outlineWidth', 'outlineColor']
    ];
    const BOX_PADDING = ['paddingTop', 'paddingRight', 'paddingBottom', 'paddingLeft'];
    function getStyle(element, pseudoElt = '', cache = true) {
        if (element) {
            if (cache) {
                const style = getElementCache(element, 'style' + pseudoElt, '0');
                if (style) {
                    return style;
                }
            }
            if (hasComputedStyle(element)) {
                const style = getComputedStyle(element, pseudoElt);
                setElementCache(element, 'style' + pseudoElt, '0', style);
                return style;
            }
            return { display: 'inline' };
        }
        return { display: CSS$1.NONE };
    }
    function getFontSize(element) {
        return parseFloat(getStyle(element).getPropertyValue('font-size')) || undefined;
    }
    function hasComputedStyle(element) {
        if (element.nodeName.charAt(0) !== '#') {
            return element instanceof HTMLElement || element instanceof SVGElement;
        }
        return false;
    }
    function parseSelectorText(value) {
        const result = [];
        if (value.indexOf(',') !== -1) {
            let separatorValue = value;
            let match;
            let found = false;
            while ((match = CSS.SELECTOR_ATTR.exec(separatorValue)) !== null) {
                const index = match.index;
                const length = match[0].length;
                separatorValue = (index > 0 ? separatorValue.substring(0, index) : '') + '_'.repeat(length) + separatorValue.substring(index + length);
                found = true;
            }
            if (found) {
                let index;
                let position = 0;
                while (true) {
                    index = separatorValue.indexOf(',', position);
                    if (index !== -1) {
                        result.push(value.substring(position, index).trim());
                        position = index + 1;
                    }
                    else {
                        if (position > 0) {
                            result.push(value.substring(position).trim());
                        }
                        break;
                    }
                }
            }
        }
        if (result.length === 0) {
            result.push(value.trim());
        }
        return result;
    }
    function getSpecificity(value) {
        CSS.SELECTOR_G.lastIndex = 0;
        let result = 0;
        let match;
        while ((match = CSS.SELECTOR_G.exec(value)) !== null) {
            let segment = match[1];
            if (segment.length === 1) {
                switch (segment.charAt(0)) {
                    case '+':
                    case '~':
                    case '>':
                    case '*':
                        continue;
                }
            }
            else if (segment.endsWith('|*')) {
                continue;
            }
            else if (segment.charAt(0) === '*') {
                segment = segment.substring(1);
            }
            let subMatch;
            while ((subMatch = CSS.SELECTOR_ATTR.exec(segment)) !== null) {
                if (subMatch[1]) {
                    result += 1;
                }
                if (subMatch[3] || subMatch[4] || subMatch[5]) {
                    result += 10;
                }
                segment = spliceString(segment, subMatch.index, subMatch[0].length);
            }
            while ((subMatch = CSS.SELECTOR_PSEUDO_CLASS.exec(segment)) !== null) {
                if (subMatch[0].startsWith(':not(')) {
                    if (subMatch[1]) {
                        const lastIndex = CSS.SELECTOR_G.lastIndex;
                        result += getSpecificity(subMatch[1]);
                        CSS.SELECTOR_G.lastIndex = lastIndex;
                    }
                }
                else {
                    switch (match[2]) {
                        case ':scope':
                        case ':root':
                            break;
                        default:
                            result += 10;
                            break;
                    }
                }
                segment = spliceString(segment, subMatch.index, subMatch[0].length);
            }
            while ((subMatch = CSS.SELECTOR_PSEUDO_ELEMENT.exec(segment)) !== null) {
                result += 1;
                segment = spliceString(segment, subMatch.index, subMatch[0].length);
            }
            while ((subMatch = CSS.SELECTOR_LABEL.exec(segment)) !== null) {
                switch (subMatch[0].charAt(0)) {
                    case '#':
                        result += 100;
                        break;
                    case '.':
                        result += 10;
                        break;
                    default:
                        result += 1;
                        break;
                }
                segment = spliceString(segment, subMatch.index, subMatch[0].length);
            }
        }
        return result;
    }
    function checkStyleValue(element, attr, value, style) {
        if (value === 'inherit') {
            value = getInheritedStyle(element, attr);
        }
        else if (isCustomProperty(value)) {
            if (style) {
                return style[attr];
            }
            else {
                const result = calculateVar(element, value, attr);
                return result !== undefined ? result.toString() : '';
            }
        }
        return value || '';
    }
    function getDataSet(element, prefix) {
        const result = {};
        prefix = convertCamelCase(prefix, '.');
        for (const attr in element.dataset) {
            if (attr.startsWith(prefix)) {
                result[capitalize(attr.substring(prefix.length), false)] = element.dataset[attr];
            }
        }
        return result;
    }
    function getKeyframeRules() {
        const result = {};
        violation: {
            const styleSheets = document.styleSheets;
            const lengthA = styleSheets.length;
            for (let i = 0; i < lengthA; i++) {
                const styleSheet = styleSheets[i];
                const cssRules = styleSheet.cssRules;
                if (cssRules) {
                    const lengthB = cssRules.length;
                    for (let j = 0; j < lengthB; j++) {
                        try {
                            const item = cssRules[j];
                            if (item.type === CSSRule.KEYFRAMES_RULE) {
                                const value = parseKeyframeRule(item.cssRules);
                                if (Object.keys(value).length) {
                                    if (result[item.name]) {
                                        Object.assign(result[item.name], value);
                                    }
                                    else {
                                        result[item.name] = value;
                                    }
                                }
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
    function parseKeyframeRule(rules) {
        if (CACHE_PATTERN.KEYFRAME === undefined) {
            CACHE_PATTERN.KEYFRAME = /((?:\d+%\s*,?\s*)+|from|to)\s*{\s*(.+?)\s*}/;
        }
        const result = {};
        const length = rules.length;
        for (let i = 0; i < length; i++) {
            const item = rules[i];
            const match = CACHE_PATTERN.KEYFRAME.exec(item.cssText);
            if (match) {
                for (let percent of (item['keyText'] || match[1].trim()).split(XML.SEPARATOR)) {
                    percent = percent.trim();
                    switch (percent) {
                        case 'from':
                            percent = CSS$1.PERCENT_0;
                            break;
                        case 'to':
                            percent = CSS$1.PERCENT_100;
                            break;
                    }
                    result[percent] = {};
                    for (const property of match[2].split(';')) {
                        const [name, value] = property.split(':');
                        if (value) {
                            result[percent][name.trim()] = value.trim();
                        }
                    }
                }
            }
        }
        return result;
    }
    function validMediaRule(value, fontSize) {
        switch (value) {
            case 'only all':
            case 'only screen':
                return true;
            default: {
                if (CACHE_PATTERN.MEDIA_RULE === undefined) {
                    CACHE_PATTERN.MEDIA_RULE = /(?:(not|only)?\s*(?:all|screen) and )?((?:\([^)]+\)(?: and )?)+),?\s*/g;
                    CACHE_PATTERN.MEDIA_CONDITION = /\(([a-z\-]+)\s*(:|<?=?|=?>?)?\s*([\w.%]+)?\)(?: and )?/g;
                }
                else {
                    CACHE_PATTERN.MEDIA_RULE.lastIndex = 0;
                }
                let match;
                while ((match = CACHE_PATTERN.MEDIA_RULE.exec(value)) !== null) {
                    CACHE_PATTERN.MEDIA_CONDITION.lastIndex = 0;
                    const negate = match[1] === 'not';
                    let subMatch;
                    let valid = false;
                    while ((subMatch = CACHE_PATTERN.MEDIA_CONDITION.exec(match[2])) !== null) {
                        const attr = subMatch[1];
                        let operation;
                        if (subMatch[1].startsWith('min')) {
                            operation = '>=';
                        }
                        else if (subMatch[1].startsWith('max')) {
                            operation = '<=';
                        }
                        else {
                            operation = match[2];
                        }
                        const rule = subMatch[3];
                        switch (attr) {
                            case 'aspect-ratio':
                            case 'min-aspect-ratio':
                            case 'max-aspect-ratio':
                                const [width, height] = replaceMap(rule.split('/'), ratio => parseInt(ratio));
                                valid = compareRange(operation, window.innerWidth / window.innerHeight, width / height);
                                break;
                            case CSS$1.WIDTH:
                            case 'min-width':
                            case 'max-width':
                            case CSS$1.HEIGHT:
                            case 'min-height':
                            case 'max-height':
                                valid = compareRange(operation, attr.indexOf(CSS$1.WIDTH) !== -1 ? window.innerWidth : window.innerHeight, parseUnit(rule, fontSize));
                                break;
                            case 'orientation':
                                valid = rule === 'portrait' && window.innerWidth <= window.innerHeight || rule === 'landscape' && window.innerWidth > window.innerHeight;
                                break;
                            case 'resolution':
                            case 'min-resolution':
                            case 'max-resolution':
                                let resolution = parseFloat(rule);
                                if (rule.endsWith('dpcm')) {
                                    resolution *= 2.54;
                                }
                                else if (rule.endsWith('dppx') || rule.endsWith('x')) {
                                    resolution *= 96;
                                }
                                valid = compareRange(operation, getDeviceDPI(), resolution);
                                break;
                            case 'grid':
                                valid = rule === '0';
                                break;
                            case 'color':
                                valid = rule === undefined || convertInt(rule) > 0;
                                break;
                            case 'min-color':
                                valid = convertInt(rule) <= screen.colorDepth / 3;
                                break;
                            case 'max-color':
                                valid = convertInt(rule) >= screen.colorDepth / 3;
                                break;
                            case 'color-index':
                            case 'min-color-index':
                            case 'monochrome':
                            case 'min-monochrome':
                                valid = rule === '0';
                                break;
                            case 'max-color-index':
                            case 'max-monochrome':
                                valid = convertInt(rule) >= 0;
                                break;
                            default:
                                valid = false;
                                break;
                        }
                        if (!valid) {
                            break;
                        }
                    }
                    if (!negate && valid || negate && !valid) {
                        return true;
                    }
                }
            }
        }
        return false;
    }
    function isParentStyle(element, attr, ...styles) {
        return element.nodeName.charAt(0) !== '#' && styles.includes(getStyle(element)[attr]) || element.parentElement && styles.includes(getStyle(element.parentElement)[attr]);
    }
    function getInheritedStyle(element, attr, exclude, ...tagNames) {
        let value = '';
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
        return value;
    }
    function parseVar(element, value) {
        const style = getStyle(element);
        let match;
        while ((match = CSS.VAR.exec(value)) !== null) {
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
                const rect = (element instanceof SVGElement ? element : (element.parentElement || element)).getBoundingClientRect();
                attr = attr.toLowerCase();
                if (/^margin|padding|border/.test(attr)) {
                    dimension = Math.max(rect.width, rect.height);
                }
                else {
                    dimension = /top|bottom|height|vertical/.test(attr) || attr.length <= 2 && attr.indexOf('y') !== -1 ? rect.height : rect.width;
                }
            }
            return calculate(result, dimension, getFontSize(element));
        }
        return undefined;
    }
    function getBackgroundPosition(value, dimension, fontSize) {
        const orientation = value === CSS$1.CENTER ? [CSS$1.CENTER, CSS$1.CENTER] : value.split(' ');
        const result = {
            static: true,
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            topAsPercent: 0,
            leftAsPercent: 0,
            rightAsPercent: 0,
            bottomAsPercent: 0,
            horizontal: CSS$1.LEFT,
            vertical: CSS$1.TOP,
            orientation
        };
        if (orientation.length === 2) {
            for (let i = 0; i < 2; i++) {
                const position = orientation[i];
                let direction;
                let offsetParent;
                if (i === 0) {
                    direction = CSS$1.LEFT;
                    offsetParent = dimension.width;
                    result.horizontal = position;
                }
                else {
                    direction = CSS$1.TOP;
                    offsetParent = dimension.height;
                    result.vertical = position;
                }
                const directionAsPercent = `${direction}AsPercent`;
                switch (position) {
                    case CSS$1.START:
                        result.horizontal = CSS$1.LEFT;
                        break;
                    case CSS$1.END:
                        result.horizontal = CSS$1.RIGHT;
                    case CSS$1.RIGHT:
                    case CSS$1.BOTTOM:
                        result[direction] = offsetParent;
                        result[directionAsPercent] = 1;
                        break;
                    case CSS$1.CENTER:
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
            for (let i = 0; i < 4; i++) {
                const position = orientation[i];
                switch (i) {
                    case 0:
                        result.horizontal = position;
                        break;
                    case 1: {
                        const location = convertLength(position, dimension.width, fontSize);
                        const locationAsPercent = convertPercent(position, dimension.width, fontSize);
                        switch (result.horizontal) {
                            case CSS$1.END:
                                result.horizontal = CSS$1.RIGHT;
                            case CSS$1.RIGHT:
                                result.right = location;
                                result.left = dimension.width - location;
                                result.rightAsPercent = locationAsPercent;
                                result.leftAsPercent = 1 - locationAsPercent;
                                break;
                            case CSS$1.START:
                                result.horizontal = CSS$1.LEFT;
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
                        if (result.vertical === CSS$1.BOTTOM) {
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
        result.static = result.top === 0 && result.right === 0 && result.left === 0 && result.bottom === 0;
        return result;
    }
    function getSrcSet(element, mimeType) {
        const parentElement = element.parentElement;
        const result = [];
        let srcset = element.srcset;
        let sizes = element.sizes;
        if (parentElement && parentElement.tagName === 'PICTURE') {
            const children = parentElement.children;
            const length = children.length;
            for (let i = 0; i < length; i++) {
                const source = children[i];
                if (source.tagName === 'SOURCE' && isString(source.srcset) && (isString(source.media) && validMediaRule(source.media) || isString(source.type) && mimeType && mimeType.includes(source.type.split('/').pop().toLowerCase()))) {
                    srcset = source.srcset;
                    sizes = source.sizes;
                    break;
                }
            }
        }
        if (srcset !== '') {
            const filepath = element.src.substring(0, element.src.lastIndexOf('/') + 1);
            const pattern = /^(.*?)\s*(?:(\d*\.?\d*)([xw]))?$/;
            for (const src of srcset.split(XML.SEPARATOR)) {
                const match = pattern.exec(src.trim());
                if (match) {
                    let width = 0;
                    let pixelRatio = 0;
                    switch (match[3]) {
                        case 'w':
                            width = parseFloat(match[2]);
                            break;
                        case 'x':
                            pixelRatio = parseFloat(match[2]);
                            break;
                        default:
                            pixelRatio = 1;
                            break;
                    }
                    result.push({
                        src: filepath + fromLastIndexOf(match[1], '/'),
                        pixelRatio,
                        width
                    });
                }
            }
            result.sort((a, b) => {
                if (a.pixelRatio > 0 && b.pixelRatio > 0) {
                    if (a.pixelRatio !== b.pixelRatio) {
                        return a.pixelRatio < b.pixelRatio ? -1 : 1;
                    }
                }
                else if (a.width > 0 && b.width > 0) {
                    if (a.width !== b.width) {
                        return a.width < b.width ? -1 : 1;
                    }
                }
                return 0;
            });
        }
        if (result.length === 0) {
            result.push({ src: element.src, pixelRatio: 1, width: 0 });
        }
        else if (result.length > 1 && isString(sizes)) {
            const pattern = new RegExp(`\\s*(\\((?:max|min)-width: ${STRING.LENGTH}\\))?\\s*(.+)`);
            let width = 0;
            for (const value of sizes.split(XML.SEPARATOR)) {
                const match = pattern.exec(value.trim());
                if (match) {
                    if (match[1] && !validMediaRule(match[1])) {
                        continue;
                    }
                    if (match[4]) {
                        const calcMatch = CSS.CALC.exec(match[4]);
                        if (calcMatch) {
                            width = calculate(calcMatch[1]) || 0;
                        }
                        else {
                            width = parseUnit(match[4]);
                        }
                    }
                    if (width > 0) {
                        break;
                    }
                }
            }
            if (width > 0) {
                const resolution = width * window.devicePixelRatio;
                let index = -1;
                const length = result.length;
                for (let i = 0; i < length; i++) {
                    const imageWidth = result[i].width;
                    if (imageWidth > 0 && imageWidth <= resolution && (index === -1 || result[index].width < imageWidth)) {
                        index = i;
                    }
                }
                if (index > 0) {
                    const selected = result.splice(index, 1)[0];
                    selected.pixelRatio = 1;
                    selected.actualWidth = width;
                    result.unshift(selected);
                }
                else if (index === 0) {
                    result[0].pixelRatio = 1;
                    result[0].actualWidth = width;
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
        const match = CSS.URL.exec(value);
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
    function convertAngle(value, unit = 'deg') {
        let angle = convertFloat(value);
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
    function convertPX(value, fontSize) {
        if (value) {
            value = value.trim();
            if (value.endsWith('px') || value.endsWith('%') || value === CSS$1.AUTO) {
                return value;
            }
            return `${parseUnit(value, fontSize)}px`;
        }
        return CSS$1.PX_0;
    }
    function calculate(value, dimension = 0, fontSize) {
        value = value.trim();
        if (value.charAt(0) !== '(' || value.charAt(value.length - 1) !== ')') {
            value = `(${value})`;
        }
        const opening = [];
        const closing = [];
        let opened = 0;
        const length = value.length;
        for (let i = 0; i < length; i++) {
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
            const match = UNIT.LENGTH.exec(value);
            if (match) {
                let result = parseFloat(match[1]);
                switch (match[2]) {
                    case 'px':
                        return result;
                    case undefined:
                    case 'em':
                    case 'ch':
                        result *= fontSize || getFontSize(document.body) || 16;
                        break;
                    case 'rem':
                        result *= getFontSize(document.body) || 16;
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
            const match = CSS.ANGLE.exec(value);
            if (match) {
                return convertAngle(match[1], match[2]);
            }
        }
        return 0;
    }
    function formatPX(value) {
        return `${Math.round(value) || 0}px`;
    }
    function formatPercent(value, round = true) {
        if (typeof value === 'string') {
            value = parseFloat(value);
            if (isNaN(value)) {
                return CSS$1.PERCENT_0;
            }
        }
        value *= 100;
        return `${round ? Math.round(value) : value}%`;
    }
    function isLength(value, percent = false) {
        return UNIT.LENGTH.test(value) || percent && isPercent(value);
    }
    function isCalc(value) {
        return CSS.CALC.test(value);
    }
    function isCustomProperty(value) {
        return CSS.CUSTOM_PROPERTY.test(value);
    }
    function isAngle(value) {
        return CSS.ANGLE.test(value);
    }
    function isPercent(value) {
        return UNIT.PERCENT.test(value);
    }

    var css = /*#__PURE__*/Object.freeze({
        BOX_POSITION: BOX_POSITION,
        BOX_MARGIN: BOX_MARGIN,
        BOX_BORDER: BOX_BORDER,
        BOX_PADDING: BOX_PADDING,
        getStyle: getStyle,
        getFontSize: getFontSize,
        hasComputedStyle: hasComputedStyle,
        parseSelectorText: parseSelectorText,
        getSpecificity: getSpecificity,
        checkStyleValue: checkStyleValue,
        getDataSet: getDataSet,
        getKeyframeRules: getKeyframeRules,
        parseKeyframeRule: parseKeyframeRule,
        validMediaRule: validMediaRule,
        isParentStyle: isParentStyle,
        getInheritedStyle: getInheritedStyle,
        parseVar: parseVar,
        calculateVar: calculateVar,
        getBackgroundPosition: getBackgroundPosition,
        getSrcSet: getSrcSet,
        convertListStyle: convertListStyle,
        resolveURL: resolveURL,
        insertStyleSheetRule: insertStyleSheetRule,
        convertAngle: convertAngle,
        convertPX: convertPX,
        calculate: calculate,
        parseUnit: parseUnit,
        parseAngle: parseAngle,
        formatPX: formatPX,
        formatPercent: formatPercent,
        isLength: isLength,
        isCalc: isCalc,
        isCustomProperty: isCustomProperty,
        isAngle: isAngle,
        isPercent: isPercent
    });

    const REGEXP_DECIMALNOTATION = /^(-?\d+\.\d+)e(-?\d+)$/;
    const REGEXP_TRUNCATE = /^(-?\d+)\.(\d*?)(0{5,}|9{5,})\d*$/;
    const REGEXP_TRUNCATECACHE = {};
    function convertDecimalNotation(value) {
        const match = REGEXP_DECIMALNOTATION.exec(value.toString());
        if (match) {
            return parseInt(match[2]) > 0 ? Number.MAX_SAFE_INTEGER.toString() : '0';
        }
        return value.toString();
    }
    function minArray(list) {
        return Math.min.apply(null, list);
    }
    function maxArray(list) {
        return Math.max.apply(null, list);
    }
    function isEqual$1(valueA, valueB, precision = 5) {
        const length = Math.floor(valueA).toString().length;
        return valueA.toPrecision(length + precision) === valueB.toPrecision(length + precision);
    }
    function moreEqual(valueA, valueB, precision = 5) {
        return valueA > valueB || isEqual$1(valueA, valueB, precision);
    }
    function lessEqual(valueA, valueB, precision = 5) {
        return valueA < valueB || isEqual$1(valueA, valueB, precision);
    }
    function truncate(value, precision = 3) {
        if (typeof value === 'string') {
            value = parseFloat(value);
        }
        if (value === Math.floor(value)) {
            return value.toString();
        }
        else if ((value >= 0 && value <= 1 / Math.pow(10, precision)) || (value < 0 && value >= -1 / Math.pow(10, precision))) {
            return '0';
        }
        else {
            const absolute = Math.abs(value);
            let i = 1;
            if (absolute >= 1) {
                precision += 1;
                while (absolute / Math.pow(10, i++) >= 1) {
                    precision += 1;
                }
            }
            else {
                while (precision > 1 && absolute * Math.pow(10, i++) < 1) {
                    precision -= 1;
                }
            }
            return truncateTrailingZero(value.toPrecision(precision));
        }
    }
    function truncateFraction(value) {
        if (value !== Math.floor(value)) {
            const match = REGEXP_TRUNCATE.exec(convertDecimalNotation(value));
            if (match) {
                if (match[2] === '') {
                    return Math.round(value);
                }
                return parseFloat(value.toPrecision((match[1] !== '0' ? match[1].length : 0) + match[2].length));
            }
        }
        return value;
    }
    function truncateTrailingZero(value) {
        const match = CHAR.TRAILINGZERO.exec(value);
        return match ? value.substring(0, value.length - match[match[1] ? 2 : 0].length) : value;
    }
    function truncateString(value, precision = 3) {
        if (REGEXP_TRUNCATECACHE[precision] === undefined) {
            REGEXP_TRUNCATECACHE[precision] = new RegExp(`(-?\\d+\\.\\d{${precision}})(\\d)\\d*`, 'g');
        }
        else {
            REGEXP_TRUNCATECACHE[precision].lastIndex = 0;
        }
        let output = value;
        let match;
        while ((match = REGEXP_TRUNCATECACHE[precision].exec(value)) !== null) {
            if (parseInt(match[2]) >= 5) {
                match[1] = truncateFraction((parseFloat(match[1]) + 1 / Math.pow(10, precision))).toString();
            }
            output = output.replace(match[0], truncateTrailingZero(match[1]));
        }
        return output;
    }
    function convertRadian(value) {
        return value * Math.PI / 180;
    }
    function triangulate(a, b, clen) {
        const c = 180 - a - b;
        return [
            (clen / Math.sin(convertRadian(c))) * Math.sin(convertRadian(a)),
            (clen / Math.sin(convertRadian(c))) * Math.sin(convertRadian(b))
        ];
    }
    function absoluteAngle(start, end) {
        const x = end.x - start.x;
        const y = end.y - start.y;
        return Math.atan2(y, x) * 180 / Math.PI;
    }
    function relativeAngle(start, end, orientation = 90) {
        let value = absoluteAngle(start, end) + orientation;
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
        const length = values.length;
        if (length > 1) {
            const increment = minArray(values);
            if (offset && offset.length === length) {
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
                for (let i = 1; i < length; i++) {
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
        truncateTrailingZero: truncateTrailingZero,
        truncateString: truncateString,
        convertRadian: convertRadian,
        triangulate: triangulate,
        absoluteAngle: absoluteAngle,
        relativeAngle: relativeAngle,
        offsetAngleX: offsetAngleX,
        offsetAngleY: offsetAngleY,
        clampRange: clampRange,
        nextMultiple: nextMultiple
    });

    const REGEXP_INDENT = /^(\t+)(.*)$/;
    const REGEXP_FORMAT = {
        ITEM: /\s*(<(\/)?([?\w]+)[^>]*>)\n?([^<]*)/g,
        OPENTAG: /\s*>$/,
        CLOSETAG: /\/>\n*$/,
        NBSP: /&nbsp;/g,
        AMP: /&/g
    };
    const STRING_XMLENCODING = '<?xml version="1.0" encoding="utf-8"?>\n';
    function isPlainText$1(value) {
        const length = value.length;
        for (let i = 0; i < length; i++) {
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
    function pushIndent(value, depth, char = '\t', indent) {
        if (depth > 0) {
            if (indent === undefined) {
                indent = char.repeat(depth);
            }
            return joinMap(value.split('\n'), line => line !== '' ? indent + line : '', '\n', true);
        }
        return value;
    }
    function pushIndentArray(values, depth, char = '\t', separator = '') {
        if (depth > 0) {
            const indent = char.repeat(depth);
            const length = values.length;
            for (let i = 0; i < length; i++) {
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
            }, '\n', true);
        }
        return value;
    }
    function replaceTab(value, spaces = 4, preserve = false) {
        if (spaces > 0) {
            if (preserve) {
                return joinMap(value.split('\n'), line => {
                    const match = REGEXP_INDENT.exec(line);
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
        const length = children.length;
        for (let i = 0; i < length; i++) {
            const item = children[i];
            const include = tag['#'] && item[tag['#']];
            const closed = !nested && !include;
            let valid = false;
            output += indent + '<' + tagName;
            const attrs = tag['@'];
            const descend = tag['>'];
            if (attrs) {
                for (const attr of attrs) {
                    if (item[attr]) {
                        output += ` ${(tag['^'] ? tag['^'] + ':' : '') + attr}="${item[attr]}"`;
                    }
                }
            }
            if (descend) {
                let innerText = '';
                const childDepth = depth + (nested ? i : 0) + 1;
                for (const name in descend) {
                    if (Array.isArray(item[name])) {
                        innerText += applyTemplate(name, descend, item[name], childDepth);
                    }
                    else if (typeof item[name] === 'object') {
                        innerText += applyTemplate(name, descend, [item[name]], childDepth);
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
            for (let i = 0; i < length; i++) {
                indent = indent.substring(1);
                output += indent + `</${tagName}>\n`;
            }
        }
        return output;
    }
    function formatTemplate(value, closeEmpty = true, startIndent = -1, char = '\t') {
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
        const length = lines.length;
        for (let i = 0; i < length; i++) {
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
    function replaceCharacterData(value) {
        value = value
            .replace(REGEXP_FORMAT.NBSP, '&#160;')
            .replace(ESCAPE.NONENTITY, '&amp;');
        const length = value.length;
        const char = new Array(length);
        let valid = false;
        for (let i = 0; i < length; i++) {
            const ch = value.charAt(i);
            switch (ch) {
                case "'":
                    char[i] = "\\'";
                    valid = true;
                    break;
                case '"':
                    char[i] = '&quot;';
                    valid = true;
                    break;
                case '<':
                    char[i] = '&lt;';
                    valid = true;
                    break;
                case '>':
                    char[i] = '&gt;';
                    valid = true;
                    break;
                case '\u0003':
                    char[i] = ' ';
                    valid = true;
                    break;
                case '\u00A0':
                    char[i] = '&#160;';
                    valid = true;
                    break;
                default:
                    char[i] = ch;
                    break;
            }
        }
        return valid ? char.join('') : value;
    }

    var xml = /*#__PURE__*/Object.freeze({
        STRING_XMLENCODING: STRING_XMLENCODING,
        isPlainText: isPlainText$1,
        pushIndent: pushIndent,
        pushIndentArray: pushIndentArray,
        replaceIndent: replaceIndent,
        replaceTab: replaceTab,
        applyTemplate: applyTemplate,
        formatTemplate: formatTemplate,
        replaceCharacterData: replaceCharacterData
    });

    const extensionsAsync = new Set();
    const optionsAsync = new Map();
    let main;
    let framework;
    exports.settings = {};
    exports.system = {};
    const checkMain = () => !!main && !main.initializing && main.length > 0;
    function setFramework(value, cached = false) {
        const reloading = framework !== undefined;
        if (framework !== value) {
            const appBase = cached ? value.cached() : value.create();
            if (framework === undefined) {
                Object.assign(appBase.userSettings, exports.settings);
            }
            exports.settings = appBase.userSettings;
            main = appBase.application;
            main.userSettings = exports.settings;
            const builtInExtensions = main.builtInExtensions;
            const extensions = main.extensions;
            function includeExtension(extension) {
                if (!extensions.includes(extension)) {
                    extension.application = main;
                    extensions.push(extension);
                }
            }
            extensions.length = 0;
            for (const namespace of exports.settings.builtInExtensions) {
                const extension = builtInExtensions[namespace];
                if (extension) {
                    includeExtension(extension);
                }
                else {
                    for (const name in builtInExtensions) {
                        if (name.startsWith(`${namespace}.`)) {
                            includeExtension(builtInExtensions[name]);
                        }
                    }
                }
            }
            framework = value;
            exports.system = value.system;
        }
        if (reloading) {
            reset();
        }
    }
    function parseDocument(...elements) {
        if (main) {
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
            if (!main.closed) {
                return main.parseDocument(...elements);
            }
            else if (!exports.settings.showErrorMessages || confirm('ERROR: Document is closed. Reset and rerun?')) {
                main.reset();
                return main.parseDocument(...elements);
            }
        }
        else if (exports.settings.showErrorMessages) {
            alert('ERROR: Framework not installed.');
        }
        const PromiseResult = class {
            then(resolve) { }
        };
        return new PromiseResult();
    }
    function include(value, options) {
        if (main) {
            if (typeof value === 'string') {
                value = value.trim();
                value = main.builtInExtensions[value] || retrieve(value);
            }
            if (value instanceof squared.base.Extension && main.extensionManager.include(value)) {
                if (options) {
                    configure(value, options);
                }
                return true;
            }
        }
        return false;
    }
    function includeAsync(value, options) {
        if (include(value, options)) {
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
        if (isPlainObject(options)) {
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
    function retrieve(value) {
        return main && main.extensionManager.retrieve(value);
    }
    function reset() {
        if (main) {
            main.reset();
        }
    }
    function ready() {
        return !!main && !main.initializing && !main.closed;
    }
    function close() {
        if (checkMain()) {
            main.finalize();
        }
    }
    function copyToDisk(value, callback) {
        if (checkMain() && isString(value)) {
            if (!main.closed) {
                main.finalize();
            }
            main.copyToDisk(value, callback);
        }
    }
    function appendToArchive(value) {
        if (checkMain() && isString(value)) {
            if (!main.closed) {
                main.finalize();
            }
            main.appendToArchive(value);
        }
    }
    function saveToArchive(value) {
        if (checkMain()) {
            if (!main.closed) {
                main.finalize();
            }
            main.saveToArchive(value);
        }
    }
    function toString() {
        return main ? main.toString() : '';
    }
    function apply(value, options) {
        return include(value, options);
    }
    function saveAllToDisk() {
        saveToArchive();
    }
    const lib = {
        base: {
            Container
        },
        color,
        constant,
        client,
        css,
        dom,
        math,
        regex,
        session,
        util,
        xml
    };

    exports.appendToArchive = appendToArchive;
    exports.apply = apply;
    exports.close = close;
    exports.configure = configure;
    exports.copyToDisk = copyToDisk;
    exports.exclude = exclude;
    exports.include = include;
    exports.includeAsync = includeAsync;
    exports.lib = lib;
    exports.parseDocument = parseDocument;
    exports.ready = ready;
    exports.reset = reset;
    exports.retrieve = retrieve;
    exports.saveAllToDisk = saveAllToDisk;
    exports.saveToArchive = saveToArchive;
    exports.setFramework = setFramework;
    exports.toString = toString;

    Object.defineProperty(exports, '__esModule', { value: true });

}));
