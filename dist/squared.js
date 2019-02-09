/* squared 0.6.1
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
    const REGEXP_PATTERN = {
        URL: /url\("?(.*?)"?\)/,
        URI: /^[A-Za-z]+:\/\//,
        UNIT: /^(?:\s*(-?[\d.]+)(px|em|ch|pc|pt|vw|vh|vmin|vmax|mm|cm|in))+$/,
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
        const matchArray = value.match(/([a-z][A-Z])/g);
        if (matchArray) {
            matchArray.forEach(match => value = value.replace(match, `${match[0]}_${match[1].toLowerCase()}`));
        }
        return value;
    }
    function convertCamelCase(value, char = '-') {
        const matchArray = value.replace(new RegExp(`^${char}+`), '').match(new RegExp(`(${char}[a-z])`, 'g'));
        if (matchArray) {
            matchArray.forEach(match => value = value.replace(match, match[1].toUpperCase()));
        }
        return value;
    }
    function convertWord(value, replaceDash = false) {
        if (value) {
            value = value.replace(/[^\w]/g, '_').trim();
            if (replaceDash) {
                value = value.replace(/-/g, '_');
            }
            return value;
        }
        return '';
    }
    function convertInt(value) {
        return value && parseInt(value) || 0;
    }
    function convertFloat(value) {
        return value && parseFloat(value) || 0;
    }
    function convertPX(value, dpi, fontSize) {
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
    function convertPercent(value, precision = 0) {
        return value < 1 ? `${precision === 0 ? Math.round(value * 100) : parseFloat((value * 100).toFixed(precision))}%` : `100%`;
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
        return typeof value === 'number' || /^-?\d+(\.\d+)?$/.test(value.trim());
    }
    function isString(value) {
        return typeof value === 'string' && value !== '';
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
    function includes(source, value, delimiter = ',') {
        return source ? source.split(delimiter).map(segment => segment.trim()).includes(value) : false;
    }
    function cloneObject(data, destination = {}) {
        for (const attr in data) {
            if (data && typeof data[attr] === 'object') {
                destination[attr] = cloneObject(data[attr]);
            }
            else {
                destination[attr] = data[attr];
            }
        }
        return destination;
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
                    const parts = [];
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
    function trimNull(value) {
        return value ? value.trim() : '';
    }
    function trimString(value, char) {
        return value ? trimStart(trimEnd(value, char), char) : '';
    }
    function trimStart(value, char) {
        return value ? value.replace(new RegExp(`^${char}+`, 'g'), '') : '';
    }
    function trimEnd(value, char) {
        return value ? value.replace(new RegExp(`${char}+$`, 'g'), '') : '';
    }
    function repeat(many, value = '\t') {
        return value.repeat(many);
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
    function partitionArray(list, predicate) {
        const valid = [];
        const invalid = [];
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
    function retainArray(list, predicate) {
        const retain = list.filter(predicate);
        list.length = 0;
        list.push(...retain);
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
            current = [].concat.apply([], current.filter(item => item));
        }
        return current;
    }
    function flatMap(list, predicate) {
        return list.map((item, index) => predicate(item, index)).filter((item) => hasValue(item));
    }

    var util = /*#__PURE__*/Object.freeze({
        REGEXP_PATTERN: REGEXP_PATTERN,
        capitalize: capitalize,
        convertUnderscore: convertUnderscore,
        convertCamelCase: convertCamelCase,
        convertWord: convertWord,
        convertInt: convertInt,
        convertFloat: convertFloat,
        convertPX: convertPX,
        convertPercent: convertPercent,
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
        includes: includes,
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
        repeat: repeat,
        indexOf: indexOf,
        lastIndexOf: lastIndexOf,
        searchObject: searchObject,
        hasValue: hasValue,
        withinRange: withinRange,
        withinFraction: withinFraction,
        assignWhenNull: assignWhenNull,
        defaultWhenNull: defaultWhenNull,
        minArray: minArray,
        maxArray: maxArray,
        partitionArray: partitionArray,
        retainArray: retainArray,
        spliceArray: spliceArray,
        sortArray: sortArray,
        flatArray: flatArray,
        flatMap: flatMap
    });

    class Container {
        constructor(children) {
            this._children = [];
            if (Array.isArray(children)) {
                this.retain(children);
            }
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
                if (item === this._children[i]) {
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
                predicate(this._children[i], i);
            }
            return this;
        }
        find(predicate, value) {
            if (typeof predicate === 'string') {
                return this._children.find(item => item[predicate] === value);
            }
            else {
                return this._children.find(predicate);
            }
        }
        filter(predicate) {
            return this._children.filter(predicate);
        }
        map(predicate) {
            return this._children.map(predicate);
        }
        flatMap(predicate) {
            return this._children.map(predicate).filter(item => item);
        }
        partition(predicate) {
            return partitionArray(this._children, predicate);
        }
        splice(predicate, callback) {
            return spliceArray(this._children, predicate, callback);
        }
        sort(predicate) {
            this._children.sort(predicate);
            return this;
        }
        every(predicate) {
            return this.length > 0 && this._children.every(predicate);
        }
        some(predicate) {
            return this._children.some(predicate);
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
        r = r / 255;
        g = g / 255;
        b = b / 255;
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
        return `rgb${rgba.a < 255 ? 'a' : ''}(${rgba.r}, ${rgba.g}, ${rgba.b}${rgba.a < 255 ? `, ${(rgba.a / 255).toFixed(2)}` : ''})`;
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
        const result = HSL_SORTED.slice(0);
        let index = result.findIndex(item => item.value === value);
        if (index !== -1) {
            return result[index];
        }
        else {
            const rgb = convertRGBA(value);
            if (rgb) {
                const hsl = convertHSL(rgb);
                if (hsl) {
                    result.push({
                        name: '',
                        value: '',
                        hsl,
                        rgba: { r: -1, g: -1, b: -1, a: 1 },
                    });
                    result.sort(sortHSL);
                    index = result.findIndex(item => item.name === '');
                    return result[Math.min(index + 1, result.length - 1)];
                }
            }
            return undefined;
        }
    }
    function convertHex(...values) {
        let result = '';
        for (const value of values) {
            let rgb = typeof value === 'string' ? parseInt(value) : value;
            if (isNaN(rgb)) {
                return '00';
            }
            rgb = Math.max(0, Math.min(rgb, 255));
            result += HEX_CHAR.charAt((rgb - (rgb % 16)) / 16) + HEX_CHAR.charAt(rgb % 16);
        }
        return result;
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
    function parseRGBA(value, opacity = '1') {
        if (value && value !== 'initial' && value !== 'transparent') {
            if (opacity.trim() === '') {
                opacity = '1';
            }
            if (value.charAt(0) === '#') {
                const rgba = convertRGBA(value);
                if (rgba) {
                    value = formatRGBA(rgba);
                }
            }
            else if (!value.startsWith('rgb')) {
                const color = getColorByName(value);
                if (color && color.rgba) {
                    color.rgba.a = parseFloat(convertAlpha$1(opacity));
                    value = formatRGBA(color.rgba);
                }
            }
            const match = value.match(REGEXP_RGBA);
            if (match && match.length >= 4 && (match[4] === undefined || parseFloat(match[4]) > 0)) {
                if (match[4] === undefined) {
                    match[4] = parseFloat(opacity).toFixed(2);
                }
                const valueHex = convertHex(match[1]) + convertHex(match[2]) + convertHex(match[3]);
                const valueA = convertAlpha$1(match[4]);
                const valueRGBA = `#${valueHex + valueA}`;
                const alpha = parseFloat(match[4]);
                return {
                    valueRGB: `#${valueHex}`,
                    valueRGBA,
                    valueARGB: `#${valueA + valueHex}`,
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
        if (navigator.userAgent.indexOf('Edge') !== -1) {
            client = 8 /* EDGE */;
        }
        else if (navigator.userAgent.indexOf('Firefox') !== -1) {
            client = 16 /* FIREFOX */;
        }
        else if (navigator.userAgent.indexOf('Chrome') === -1 && navigator.userAgent.indexOf('Safari') !== -1) {
            client = 4 /* SAFARI */;
        }
        else {
            client = 2 /* CHROME */;
        }
        return hasBit(value, client);
    }
    function getKeyframeRules() {
        const result = new Map();
        for (let i = 0; i < document.styleSheets.length; i++) {
            const styleSheet = document.styleSheets[i];
            if (styleSheet.cssRules) {
                for (let j = 0; j < styleSheet.cssRules.length; j++) {
                    const item = styleSheet.cssRules[j];
                    try {
                        if (item instanceof CSSKeyframesRule) {
                            const map = {};
                            Array.from(item.cssRules).forEach(keyframe => {
                                const match = /((?:\d+%\s*,?\s*)+|from|to)\s*{\s*(.*?)\s*}/.exec(keyframe.cssText);
                                if (match) {
                                    const keyText = (keyframe['keyText'] || match[1].trim()).split(',').map(percent => percent.trim());
                                    const properties = flatMap(match[2].split(';'), percent => percent.trim());
                                    for (let percent of keyText) {
                                        switch (percent) {
                                            case 'from':
                                                percent = '0%';
                                                break;
                                            case 'to':
                                                percent = '100%';
                                                break;
                                        }
                                        map[percent] = {};
                                        for (const property of properties) {
                                            const [name, value] = property.split(':').map(values => values.trim());
                                            if (name !== '' && value !== '') {
                                                map[percent][name] = value;
                                            }
                                        }
                                    }
                                }
                            });
                            result.set(item.name, map);
                        }
                    }
                    catch (_a) {
                    }
                }
            }
        }
        return result;
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
        Array.from(document.getElementsByClassName(className)).forEach(element => element.parentElement && element.parentElement.removeChild(element));
    }
    function convertClientUnit(value, dimension, dpi, fontSize, percent = false) {
        if (percent) {
            return isPercent(value) ? convertFloat(value) / 100 : (parseFloat(convertPX(value, dpi, fontSize)) / dimension);
        }
        else {
            return isPercent(value) ? Math.round(dimension * (convertFloat(value) / 100)) : parseFloat(convertPX(value, dpi, fontSize));
        }
    }
    function getRangeClientRect(element) {
        const range = document.createRange();
        range.selectNodeContents(element);
        const domRect = Array.from(range.getClientRects()).filter(item => !(Math.round(item.width) === 0 && withinFraction(item.left, item.right)));
        let bounds = newRectDimension();
        let multiline = 0;
        if (domRect.length) {
            bounds = assignBounds(domRect[0]);
            const top = new Set([bounds.top]);
            const bottom = new Set([bounds.bottom]);
            for (let i = 1; i < domRect.length; i++) {
                const rect = domRect[i];
                top.add(rect.top);
                bottom.add(rect.bottom);
                bounds.width += rect.width;
                bounds.right = Math.max(rect.right, bounds.right);
                bounds.height = Math.max(rect.height, bounds.height);
            }
            if (top.size > 1 && bottom.size > 1) {
                bounds.top = minArray(Array.from(top));
                bounds.bottom = maxArray(Array.from(bottom));
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
        }
        return { display: 'none' };
    }
    function cssResolveUrl(value) {
        const match = value.match(REGEXP_PATTERN.URL);
        if (match) {
            return resolvePath(match[1]);
        }
        return '';
    }
    function cssInherit(element, attr, exclude, tagNames) {
        let result = '';
        if (element) {
            let current = element.parentElement;
            while (current && (tagNames === undefined || !tagNames.includes(current.tagName))) {
                result = getStyle(current)[attr] || '';
                if (result === 'inherit' || exclude && exclude.some(value => result.indexOf(value) !== -1)) {
                    result = '';
                }
                if (current === document.body || result) {
                    break;
                }
                current = current.parentElement;
            }
        }
        return result;
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
        const name = convertCamelCase(attr);
        const node = getElementAsNode(element);
        let value = node && node.cssInitial(name) || cssInline(element, name);
        if (!value) {
            const item = element.attributes.getNamedItem(attr);
            if (item) {
                value = item.value.trim();
            }
        }
        return value || computed && getStyle(element)[name] || '';
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
    function getBackgroundPosition(value, dimension, dpi, fontSize, leftPerspective = false, percent = false) {
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
            orientation.forEach((position, index) => {
                switch (index) {
                    case 0:
                        result.horizontal = position;
                        break;
                    case 2:
                        result.vertical = position;
                        break;
                    case 1:
                    case 3:
                        const clientXY = convertClientUnit(position, index === 1 ? dimension.width : dimension.height, dpi, fontSize, percent);
                        if (index === 1) {
                            if (leftPerspective) {
                                if (result.horizontal === 'right') {
                                    if (isPercent(position)) {
                                        result.originalX = formatPercent(100 - parseInt(position));
                                    }
                                    else {
                                        result.originalX = formatPX(dimension.width - parseInt(convertPX(position, dpi, fontSize)));
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
                                        result.originalY = formatPX(dimension.height - parseInt(convertPX(position, dpi, fontSize)));
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
            });
        }
        else if (orientation.length === 2) {
            orientation.forEach((position, index) => {
                const offsetParent = index === 0 ? dimension.width : dimension.height;
                const direction = index === 0 ? 'left' : 'top';
                const original = index === 0 ? 'originalX' : 'originalY';
                const clientXY = convertClientUnit(position, offsetParent, dpi, fontSize, percent);
                if (isPercent(position)) {
                    result[direction] = clientXY;
                    result[original] = position;
                }
                else {
                    if (/^[a-z]+$/.test(position)) {
                        result[index === 0 ? 'horizontal' : 'vertical'] = position;
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
            });
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
            return elements.some((child) => {
                if (child.nodeName === '#text') {
                    if (isPlainText(child, whiteSpace) || cssParent(child, 'whiteSpace', 'pre', 'pre-wrap') && child.textContent && child.textContent !== '') {
                        return true;
                    }
                }
                else if (findFreeForm(Array.from(child.childNodes))) {
                    return true;
                }
                return false;
            });
        }
        if (element.nodeName === '#text') {
            return findFreeForm([element]);
        }
        else {
            return findFreeForm(Array.from(element.childNodes));
        }
    }
    function isPlainText(element, whiteSpace = false) {
        if (element && element.nodeName === '#text' && element.textContent) {
            if (whiteSpace) {
                const value = element.textContent;
                let valid = false;
                for (let i = 0; i < value.length; i++) {
                    switch (value.charCodeAt(i)) {
                        case 9:
                        case 10:
                        case 13:
                        case 32:
                            continue;
                        default:
                            valid = true;
                            break;
                    }
                }
                return valid && value !== '';
            }
            else {
                return element.textContent.trim() !== '';
            }
        }
        return false;
    }
    function hasLineBreak(element, lineBreak = false, trimString$$1 = false) {
        if (element) {
            let value = element.textContent || '';
            if (trimString$$1) {
                value = value.trim();
            }
            if (element.children && Array.from(element.children).some((item) => item.tagName === 'BR')) {
                return true;
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
        const node = getElementAsNode(element);
        if (node) {
            return node.tagName === 'BR' || excluded && node.excluded && node.blockStatic;
        }
        return false;
    }
    function getElementsBetween(elementStart, elementEnd, whiteSpace = false, asNode = false) {
        if (!elementStart || elementStart.parentElement === elementEnd.parentElement) {
            const parent = elementEnd.parentElement;
            if (parent) {
                const elements = Array.from(parent.childNodes);
                const indexStart = elementStart ? elements.findIndex(element => element === elementStart) : 0;
                const indexEnd = elements.findIndex(element => element === elementEnd);
                if (indexStart !== -1 && indexEnd !== -1 && indexStart !== indexEnd) {
                    let result = elements.slice(Math.min(indexStart, indexEnd) + 1, Math.max(indexStart, indexEnd));
                    if (whiteSpace) {
                        result = result.filter(element => element.nodeName !== '#comment');
                    }
                    else {
                        result = result.filter(element => {
                            if (element.nodeName.charAt(0) === '#') {
                                return isPlainText(element);
                            }
                            return true;
                        });
                    }
                    if (asNode) {
                        result = result.filter(element => getElementAsNode(element));
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
        return bounds.width !== 0 && bounds.height !== 0 && (!checkViewport || withinViewportOrigin(bounds));
    }
    function withinViewportOrigin(bounds) {
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
    function getElementAsNodeAttribute(element, attr) {
        const node = getElementAsNode(element);
        return node && node[attr] !== undefined ? node[attr] : undefined;
    }

    var dom = /*#__PURE__*/Object.freeze({
        ELEMENT_BLOCK: ELEMENT_BLOCK,
        ELEMENT_INLINE: ELEMENT_INLINE,
        isUserAgent: isUserAgent,
        getKeyframeRules: getKeyframeRules,
        getDataSet: getDataSet,
        newBoxRect: newBoxRect,
        newRectDimension: newRectDimension,
        newBoxModel: newBoxModel,
        getDOMRect: getDOMRect,
        createElement: createElement,
        removeElementsByClassName: removeElementsByClassName,
        convertClientUnit: convertClientUnit,
        getRangeClientRect: getRangeClientRect,
        assignBounds: assignBounds,
        getStyle: getStyle,
        cssResolveUrl: cssResolveUrl,
        cssInherit: cssInherit,
        cssParent: cssParent,
        cssFromParent: cssFromParent,
        cssInline: cssInline,
        cssAttribute: cssAttribute,
        cssInheritAttribute: cssInheritAttribute,
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
        withinViewportOrigin: withinViewportOrigin,
        setElementCache: setElementCache,
        getElementCache: getElementCache,
        deleteElementCache: deleteElementCache,
        getElementAsNode: getElementAsNode,
        getElementAsNodeAttribute: getElementAsNodeAttribute
    });

    function replaceTemplateSection(data, value) {
        for (const index in data) {
            value = value.replace(new RegExp(`\\t*<<${index}>>[\\w\\W]*<<${index}>>`), `{%${index}}`);
        }
        return value;
    }
    function formatPlaceholder(id, symbol = ':') {
        return `{${symbol + id.toString()}}`;
    }
    function replacePlaceholder(value, id, content, before = false) {
        const placeholder = typeof id === 'number' ? formatPlaceholder(id) : id;
        return value.replace(placeholder, (before ? placeholder : '') + content + (before ? '' : placeholder));
    }
    function replaceIndent(value, depth, leadingPattern) {
        if (depth >= 0) {
            let indent = -1;
            return value.split('\n').map(line => {
                const match = leadingPattern.exec(line);
                if (match) {
                    if (indent === -1) {
                        indent = match[2].length;
                    }
                    return match[1] + repeat(depth + (match[2].length - indent)) + match[3];
                }
                return line;
            })
                .join('\n');
        }
        return value;
    }
    function replaceTab(value, spaces = 4, preserve = false) {
        if (spaces > 0) {
            if (preserve) {
                value = value.split('\n').map(line => {
                    const match = line.match(/^(\t+)(.*)$/);
                    if (match) {
                        return ' '.repeat(spaces * match[1].length) + match[2];
                    }
                    return line;
                })
                    .join('\n');
            }
            else {
                value = value.replace(/\t/g, ' '.repeat(spaces));
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
                const segment = match[0].replace(new RegExp(`^${match[1]}\\n`), '').replace(new RegExp(`${match[1]}$`), '');
                data[match[2]] = replaceTemplateSection(parseSection(segment), segment);
            }
            Object.assign(result, data);
            return data;
        }
        result['__ROOT__'] = replaceTemplateSection(parseSection(value), value);
        return result;
    }
    function createTemplate(value, data, format = false, index) {
        let output = index === undefined ? value['__ROOT__'] : value[index];
        for (const attr in data) {
            const unknown = data[attr];
            let result = '';
            let hash = '';
            if (unknown === undefined || unknown === null) {
                continue;
            }
            else if (Array.isArray(unknown)) {
                hash = '%';
                if (Array.isArray(unknown[0])) {
                    function partial(section) {
                        return `(\\t*##${attr}-${section}##\\s*\\n)([\\w\\W]*?\\s*\\n)(\\t*##${attr}-${section}##\\s*\\n)`;
                    }
                    const match = new RegExp(partial('start') + `([\\w\\W]*?)` + partial('end')).exec(output);
                    if (match) {
                        let tagStart = '';
                        let tagEnd = '';
                        const depth = unknown[0].length;
                        const guard = Object.assign({}, value);
                        for (let i = 0; i < depth; i++) {
                            const key = `${index}_${attr}_${i}`;
                            guard[key] = match[2];
                            tagStart += createTemplate(guard, unknown[0][i], format, key);
                            tagEnd = match[6] + tagEnd;
                        }
                        output = output
                            .replace(match[2], tagStart).replace(match[6], tagEnd)
                            .replace(match[1], '').replace(match[3], '')
                            .replace(new RegExp(`\\t*${match[5]}`), '').replace(new RegExp(`\\t*${match[7]}`), '');
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
                    if (result === '') {
                        result = false;
                    }
                    else {
                        result = trimEnd(result, '\n');
                    }
                }
            }
            else {
                hash = '[&~]';
                result = typeof unknown === 'boolean' ? '' : unknown.toString();
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
        if (index === undefined) {
            output = output
                .replace(/\n*\t*{%\w+}\n+/g, '\n')
                .replace(/\n\n/g, '\n').trim();
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
        let result = '';
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
                line.tag.trim().split('\n').forEach((partial, index) => {
                    const depth = previous + (index > 0 ? 1 : 0);
                    result += (depth > 0 ? repeat(depth, char) : '') + partial.trim() + '\n';
                });
            }
            else {
                result += line.tag + '\n';
            }
            result += line.value;
        }
        return result.trim();
    }

    var xml = /*#__PURE__*/Object.freeze({
        formatPlaceholder: formatPlaceholder,
        replacePlaceholder: replacePlaceholder,
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
