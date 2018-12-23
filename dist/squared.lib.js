/* squared.lib 0.1.0
   https://github.com/anpham6/squared */

(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
    typeof define === 'function' && define.amd ? define(['exports'], factory) :
    (global = global || self, factory((global.squared = global.squared || {}, global.squared.lib = {})));
}(this, function (exports) { 'use strict';

    const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const NUMERALS = [
        '', 'C', 'CC', 'CCC', 'CD', 'D', 'DC', 'DCC', 'DCCC', 'CM',
        '', 'X', 'XX', 'XXX', 'XL', 'L', 'LX', 'LXX', 'LXXX', 'XC',
        '', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX'
    ];
    function sort(list, asc, ...attrs) {
        return list.sort((a, b) => {
            for (const attr of attrs) {
                const result = compareObject(a, b, attr, true);
                if (result && result[0] !== result[1]) {
                    if (asc === 1) {
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
    const REGEX_PATTERN = {
        CSS_URL: /url\("?#?(.*?)"?\)/,
        URI: /^[A-Za-z]+:\/\//,
        UNIT: /^(?:\s*(-?[\d.]+)(px|em|ch|pc|pt|vw|vh|vmin|vmax|mm|cm|in))+$/
    };
    function formatString(value, ...params) {
        for (let i = 0; i < params.length; i++) {
            value = value.replace(`{${i}}`, params[i]);
        }
        return value;
    }
    function capitalize(value, upper = true) {
        return value ? value.charAt(0)[upper ? 'toUpperCase' : 'toLowerCase']() + value.substring(1)[upper ? 'toLowerCase' : 'toString']() : '';
    }
    function convertUnderscore(value) {
        value = value.charAt(0).toLowerCase() + value.substring(1);
        const result = value.match(/([a-z][A-Z])/g);
        if (result) {
            result.forEach(match => value = value.replace(match, `${match[0]}_${match[1].toLowerCase()}`));
        }
        return value;
    }
    function convertCamelCase(value, char = '-') {
        value = value.replace(new RegExp(`^${char}+`), '');
        const result = value.match(new RegExp(`(${char}[a-z])`, 'g'));
        if (result) {
            result.forEach(match => value = value.replace(match, match[1].toUpperCase()));
        }
        return value;
    }
    function convertWord(value) {
        return value ? value.replace(/[^\w]/g, '_').trim() : '';
    }
    function convertInt(value) {
        return (value && parseInt(value)) || 0;
    }
    function convertFloat(value) {
        return (value && parseFloat(value)) || 0;
    }
    function convertPX(value, dpi, fontSize) {
        if (value) {
            if (isNumber(value)) {
                return `${Math.round(value)}px`;
            }
            else {
                value = value.trim();
                if (value.endsWith('px') || value.endsWith('%') || value === 'auto') {
                    return value;
                }
            }
            const match = value.match(REGEX_PATTERN.UNIT);
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
        value = parseFloat(value);
        return `${!isNaN(value) ? Math.round(value) : 0}px`;
    }
    function formatPercent(value) {
        value = parseFloat(value);
        if (!isNaN(value)) {
            return value < 1 ? convertPercent(value) : `${Math.round(value)}%`;
        }
        return '0%';
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
        return REGEX_PATTERN.UNIT.test(value);
    }
    function isPercent(value) {
        return /^\d+(\.\d+)?%$/.test(value);
    }
    function includes(source, value, delimiter = ',') {
        return source ? source.split(delimiter).map(segment => segment.trim()).includes(value) : false;
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
        if (!REGEX_PATTERN.URI.test(value)) {
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
    function minArray(list) {
        if (list.length) {
            return Math.min.apply(null, list);
        }
        return Number.MAX_VALUE;
    }
    function maxArray(list) {
        if (list.length) {
            return Math.max.apply(null, list);
        }
        return Number.MAX_VALUE * -1;
    }
    function hasSameValue(obj1, obj2, ...attrs) {
        for (const attr of attrs) {
            const value = compareObject(obj1, obj2, attr, false);
            if (!value || value[0] !== value[1]) {
                return false;
            }
        }
        return true;
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
            let filter = (a) => a === value;
            if (/^\*.+\*$/.test(value)) {
                filter = (a) => a.indexOf(value.replace(/\*/g, '')) !== -1;
            }
            else if (/^\*/.test(value)) {
                filter = (a) => a.endsWith(value.replace(/\*/, ''));
            }
            else if (/\*$/.test(value)) {
                filter = (a) => a.startsWith(value.replace(/\*/, ''));
            }
            for (const i in obj) {
                if (filter(i)) {
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
            if (!destination.hasOwnProperty(attr)) {
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
    function partition(list, predicate) {
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
    function sortAsc(list, ...attrs) {
        return sort(list, 1, ...attrs);
    }
    function sortDesc(list, ...attrs) {
        return sort(list, 2, ...attrs);
    }

    var util = /*#__PURE__*/Object.freeze({
        REGEX_PATTERN: REGEX_PATTERN,
        formatString: formatString,
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
        hasBit: hasBit,
        isNumber: isNumber,
        isString: isString,
        isArray: isArray,
        isUnit: isUnit,
        isPercent: isPercent,
        includes: includes,
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
        minArray: minArray,
        maxArray: maxArray,
        hasSameValue: hasSameValue,
        searchObject: searchObject,
        hasValue: hasValue,
        withinRange: withinRange,
        withinFraction: withinFraction,
        assignWhenNull: assignWhenNull,
        defaultWhenNull: defaultWhenNull,
        partition: partition,
        flatArray: flatArray,
        flatMap: flatMap,
        sortAsc: sortAsc,
        sortDesc: sortDesc
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
            return this._children.includes(item);
        }
        retain(list) {
            this._children = list;
            return this;
        }
        duplicate() {
            return this._children.slice();
        }
        clear() {
            this._children.length = 0;
            return this;
        }
        each(predicate) {
            this._children.forEach(predicate);
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
            return partition(this._children, predicate);
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
        get children() {
            return this._children;
        }
        get length() {
            return this._children.length;
        }
    }

    const X11_CSS3 = {
        'Pink': { 'hex': '#FFC0CB' },
        'LightPink': { 'hex': '#FFB6C1' },
        'HotPink': { 'hex': '#FF69B4' },
        'DeepPink': { 'hex': '#FF1493' },
        'PaleVioletRed': { 'hex': '#DB7093' },
        'MediumVioletRed': { 'hex': '#C71585' },
        'LightSalmon': { 'hex': '#FFA07A' },
        'Salmon': { 'hex': '#FA8072' },
        'DarkSalmon': { 'hex': '#E9967A' },
        'LightCoral': { 'hex': '#F08080' },
        'IndianRed': { 'hex': '#CD5C5C' },
        'Crimson': { 'hex': '#DC143C' },
        'Firebrick': { 'hex': '#B22222' },
        'DarkRed': { 'hex': '#8B0000' },
        'Red': { 'hex': '#FF0000' },
        'OrangeRed': { 'hex': '#FF4500' },
        'Tomato': { 'hex': '#FF6347' },
        'Coral': { 'hex': '#FF7F50' },
        'Orange': { 'hex': '#FFA500' },
        'DarkOrange': { 'hex': '#FF8C00' },
        'Yellow': { 'hex': '#FFFF00' },
        'LightYellow': { 'hex': '#FFFFE0' },
        'LemonChiffon': { 'hex': '#FFFACD' },
        'LightGoldenrodYellow': { 'hex': '#FAFAD2' },
        'PapayaWhip': { 'hex': '#FFEFD5' },
        'Moccasin': { 'hex': '#FFE4B5' },
        'PeachPuff': { 'hex': '#FFDAB9' },
        'PaleGoldenrod': { 'hex': '#EEE8AA' },
        'Khaki': { 'hex': '#F0E68C' },
        'DarkKhaki': { 'hex': '#BDB76B' },
        'Gold': { 'hex': '#FFD700' },
        'Cornsilk': { 'hex': '#FFF8DC' },
        'BlanchedAlmond': { 'hex': '#FFEBCD' },
        'Bisque': { 'hex': '#FFE4C4' },
        'NavajoWhite': { 'hex': '#FFDEAD' },
        'Wheat': { 'hex': '#F5DEB3' },
        'Burlywood': { 'hex': '#DEB887' },
        'Tan': { 'hex': '#D2B48C' },
        'RosyBrown': { 'hex': '#BC8F8F' },
        'SandyBrown': { 'hex': '#F4A460' },
        'Goldenrod': { 'hex': '#DAA520' },
        'DarkGoldenrod': { 'hex': '#B8860B' },
        'Peru': { 'hex': '#CD853F' },
        'Chocolate': { 'hex': '#D2691E' },
        'SaddleBrown': { 'hex': '#8B4513' },
        'Sienna': { 'hex': '#A0522D' },
        'Brown': { 'hex': '#A52A2A' },
        'Maroon': { 'hex': '#800000' },
        'DarkOliveGreen': { 'hex': '#556B2F' },
        'Olive': { 'hex': '#808000' },
        'OliveDrab': { 'hex': '#6B8E23' },
        'YellowGreen': { 'hex': '#9ACD32' },
        'LimeGreen': { 'hex': '#32CD32' },
        'Lime': { 'hex': '#00FF00' },
        'LawnGreen': { 'hex': '#7CFC00' },
        'Chartreuse': { 'hex': '#7FFF00' },
        'GreenYellow': { 'hex': '#ADFF2F' },
        'SpringGreen': { 'hex': '#00FF7F' },
        'MediumSpringGreen': { 'hex': '#00FA9A' },
        'LightGreen': { 'hex': '#90EE90' },
        'PaleGreen': { 'hex': '#98FB98' },
        'DarkSeaGreen': { 'hex': '#8FBC8F' },
        'MediumAquamarine': { 'hex': '#66CDAA' },
        'MediumSeaGreen': { 'hex': '#3CB371' },
        'SeaGreen': { 'hex': '#2E8B57' },
        'ForestGreen': { 'hex': '#228B22' },
        'Green': { 'hex': '#008000' },
        'DarkGreen': { 'hex': '#006400' },
        'Aqua': { 'hex': '#00FFFF' },
        'Cyan': { 'hex': '#00FFFF' },
        'LightCyan': { 'hex': '#E0FFFF' },
        'PaleTurquoise': { 'hex': '#AFEEEE' },
        'Aquamarine': { 'hex': '#7FFFD4' },
        'Turquoise': { 'hex': '#40E0D0' },
        'DarkTurquoise': { 'hex': '#00CED1' },
        'MediumTurquoise': { 'hex': '#48D1CC' },
        'LightSeaGreen': { 'hex': '#20B2AA' },
        'CadetBlue': { 'hex': '#5F9EA0' },
        'DarkCyan': { 'hex': '#008B8B' },
        'Teal': { 'hex': '#008080' },
        'LightSteelBlue': { 'hex': '#B0C4DE' },
        'PowderBlue': { 'hex': '#B0E0E6' },
        'LightBlue': { 'hex': '#ADD8E6' },
        'SkyBlue': { 'hex': '#87CEEB' },
        'LightSkyBlue': { 'hex': '#87CEFA' },
        'DeepSkyBlue': { 'hex': '#00BFFF' },
        'DodgerBlue': { 'hex': '#1E90FF' },
        'Cornflower': { 'hex': '#6495ED' },
        'SteelBlue': { 'hex': '#4682B4' },
        'RoyalBlue': { 'hex': '#4169E1' },
        'Blue': { 'hex': '#0000FF' },
        'MediumBlue': { 'hex': '#0000CD' },
        'DarkBlue': { 'hex': '#00008B' },
        'Navy': { 'hex': '#000080' },
        'MidnightBlue': { 'hex': '#191970' },
        'Lavender': { 'hex': '#E6E6FA' },
        'Thistle': { 'hex': '#D8BFD8' },
        'Plum': { 'hex': '#DDA0DD' },
        'Violet': { 'hex': '#EE82EE' },
        'Orchid': { 'hex': '#DA70D6' },
        'Fuchsia': { 'hex': '#FF00FF' },
        'Magenta': { 'hex': '#FF00FF' },
        'MediumOrchid': { 'hex': '#BA55D3' },
        'MediumPurple': { 'hex': '#9370DB' },
        'BlueViolet': { 'hex': '#8A2BE2' },
        'DarkViolet': { 'hex': '#9400D3' },
        'DarkOrchid': { 'hex': '#9932CC' },
        'DarkMagenta': { 'hex': '#8B008B' },
        'Purple': { 'hex': '#800080' },
        'RebeccaPurple': { 'hex': '#663399' },
        'Indigo': { 'hex': '#4B0082' },
        'DarkSlateBlue': { 'hex': '#483D8B' },
        'SlateBlue': { 'hex': '#6A5ACD' },
        'MediumSlateBlue': { 'hex': '#7B68EE' },
        'White': { 'hex': '#FFFFFF' },
        'Snow': { 'hex': '#FFFAFA' },
        'Honeydew': { 'hex': '#F0FFF0' },
        'MintCream': { 'hex': '#F5FFFA' },
        'Azure': { 'hex': '#F0FFFF' },
        'AliceBlue': { 'hex': '#F0F8FF' },
        'GhostWhite': { 'hex': '#F8F8FF' },
        'WhiteSmoke': { 'hex': '#F5F5F5' },
        'Seashell': { 'hex': '#FFF5EE' },
        'Beige': { 'hex': '#F5F5DC' },
        'OldLace': { 'hex': '#FDF5E6' },
        'FloralWhite': { 'hex': '#FFFAF0' },
        'Ivory': { 'hex': '#FFFFF0' },
        'AntiqueWhite': { 'hex': '#FAEBD7' },
        'Linen': { 'hex': '#FAF0E6' },
        'LavenderBlush': { 'hex': '#FFF0F5' },
        'MistyRose': { 'hex': '#FFE4E1' },
        'Gainsboro': { 'hex': '#DCDCDC' },
        'LightGray': { 'hex': '#D3D3D3' },
        'Silver': { 'hex': '#C0C0C0' },
        'DarkGray': { 'hex': '#A9A9A9' },
        'Gray': { 'hex': '#808080' },
        'DimGray': { 'hex': '#696969' },
        'LightSlateGray': { 'hex': '#778899' },
        'SlateGray': { 'hex': '#708090' },
        'DarkSlateGray': { 'hex': '#2F4F4F' },
        'LightGrey': { 'hex': '#D3D3D3' },
        'DarkGrey': { 'hex': '#A9A9A9' },
        'Grey': { 'hex': '#808080' },
        'DimGrey': { 'hex': '#696969' },
        'LightSlateGrey': { 'hex': '#778899' },
        'SlateGrey': { 'hex': '#708090' },
        'DarkSlateGrey': { 'hex': '#2F4F4F' },
        'Black': { 'hex': '#000000' }
    };
    const HSL_SORTED = [];
    for (const name in X11_CSS3) {
        const x11 = X11_CSS3[name];
        x11.name = name;
        const rgba = convertRGBA(x11.hex);
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
            let [c, d] = [a.hsl.h, b.hsl.h];
            if (c === d) {
                [c, d] = [a.hsl.s, b.hsl.s];
                if (c === d) {
                    [c, d] = [a.hsl.l, b.hsl.l];
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
        return parseFloat(value) < 1 ? convertHex('255', parseFloat(value)) : 'FF';
    }
    function getColorByName(value) {
        for (const color in X11_CSS3) {
            if (color.toLowerCase() === value.trim().toLowerCase()) {
                return X11_CSS3[color];
            }
        }
        return null;
    }
    function getColorByShade(value) {
        const result = HSL_SORTED.slice();
        let index = result.findIndex(item => item.hex === value);
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
                        hsl,
                        rgba: { r: -1, g: -1, b: -1, a: 1 },
                        hex: ''
                    });
                    result.sort(sortHSL);
                    index = result.findIndex(item => item.name === '');
                    return result[Math.min(index + 1, result.length - 1)];
                }
            }
            return null;
        }
    }
    function convertHex(value, opacity = 1) {
        const hex = '0123456789ABCDEF';
        let rgb = parseInt(value) * opacity;
        if (isNaN(rgb)) {
            return '00';
        }
        rgb = Math.max(0, Math.min(rgb, 255));
        return hex.charAt((rgb - (rgb % 16)) / 16) + hex.charAt(rgb % 16);
    }
    function convertRGBA(value) {
        value = value.replace(/#/g, '').trim();
        if (/[A-Za-z\d]{3,}/.test(value)) {
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
        return null;
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
            const match = value.match(/rgba?\((\d+), (\d+), (\d+),?\s*([\d.]+)?\)/);
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
        return null;
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
        return null;
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
    function getDataSet(element, prefix) {
        const result = {};
        if (hasComputedStyle(element) || element instanceof SVGElement) {
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
    function newRectDimensions() {
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
        if (parent instanceof HTMLElement) {
            parent.appendChild(element);
        }
        return element;
    }
    function removeElementsByClassName(className) {
        Array.from(document.getElementsByClassName(className)).forEach(element => element.parentElement && element.parentElement.removeChild(element));
    }
    function convertClientUnit(value, dimension, dpi, fontSize, percent = false) {
        if (percent) {
            return isPercent(value) ? convertInt(value) / 100 : (parseFloat(convertPX(value, dpi, fontSize)) / dimension);
        }
        else {
            return isPercent(value) ? Math.round(dimension * (convertInt(value) / 100)) : parseInt(convertPX(value, dpi, fontSize));
        }
    }
    function getRangeClientRect(element) {
        const range = document.createRange();
        range.selectNodeContents(element);
        const domRect = Array.from(range.getClientRects()).filter(item => !(Math.round(item.width) === 0 && withinFraction(item.left, item.right)));
        let bounds = newRectDimensions();
        let multiLine = 0;
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
                    multiLine = domRect.length - 1;
                }
            }
        }
        return Object.assign(bounds, { multiLine });
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
                    if (node) {
                        if (node.style) {
                            return node.style;
                        }
                        else if (node.plainText) {
                            return node.unsafe('styleMap');
                        }
                    }
                }
            }
            if (element.nodeName.charAt(0) !== '#') {
                const style = getComputedStyle(element);
                setElementCache(element, 'style', style);
                return style;
            }
        }
        return { display: 'none' };
    }
    function cssResolveUrl(value) {
        const match = value.match(REGEX_PATTERN.CSS_URL);
        if (match) {
            return resolvePath(match[1]);
        }
        return '';
    }
    function cssInherit(element, attr, exclude, tagNames) {
        let result = '';
        let current = element.parentElement;
        while (current && (tagNames === undefined || !tagNames.includes(current.tagName))) {
            result = getStyle(current)[attr];
            if (result === 'inherit' || exclude && exclude.some(value => result.indexOf(value) !== -1)) {
                result = '';
            }
            if (current === document.body || result) {
                break;
            }
            current = current.parentElement;
        }
        return result || '';
    }
    function cssParent(element, attr, ...styles) {
        if (element.nodeName.charAt(0) !== '#') {
            if (styles.includes(getStyle(element)[attr])) {
                return true;
            }
        }
        if (element.parentElement) {
            return styles.includes(getStyle(element.parentElement)[attr]);
        }
        return false;
    }
    function cssFromParent(element, attr) {
        if (element.parentElement && hasComputedStyle(element)) {
            const node = getElementAsNode(element);
            const style = getStyle(element);
            if (node && style) {
                return style[attr] === getStyle(element.parentElement)[attr] && !node.cssInitial(attr);
            }
        }
        return false;
    }
    function cssAttribute(element, attr, computed = false) {
        let value = element.getAttribute(attr) || (!computed && element.parentElement instanceof SVGGElement ? element.parentElement.getAttribute(attr) : '');
        if (!value) {
            const node = getElementAsNode(element);
            if (node) {
                value = node.cssInitial(attr);
            }
        }
        return !value && computed ? getStyle(element)[convertCamelCase(attr)] : value || '';
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
        if (element instanceof HTMLElement) {
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
        if (element instanceof HTMLElement) {
            for (let i = element.childNodes.length - 1; i >= 0; i--) {
                const node = getElementAsNode(element.childNodes[i]);
                if (node && (!node.excluded || (lineBreak && node.lineBreak))) {
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
                else if (child instanceof HTMLElement && withinViewportOrigin(child) && child.childNodes.length && findFreeForm(Array.from(child.childNodes))) {
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
            if (element instanceof HTMLElement && element.children.length && Array.from(element.children).some(item => item.tagName === 'BR')) {
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
        element = element.previousSibling;
        while (element) {
            const node = getElementAsNode(element);
            if (node && (!node.excluded || node.lineBreak)) {
                return node.element;
            }
            element = element.previousSibling;
        }
        return null;
    }
    function getNextElementSibling(element) {
        element = element.nextSibling;
        while (element) {
            const node = getElementAsNode(element);
            if (node && (!node.excluded || node.lineBreak)) {
                return node.element;
            }
            element = element.nextSibling;
        }
        return null;
    }
    function hasComputedStyle(element) {
        return element instanceof HTMLElement || element instanceof SVGSVGElement;
    }
    function withinViewportOrigin(element) {
        const bounds = element.getBoundingClientRect();
        if (bounds.width !== 0 && bounds.height !== 0) {
            return !(bounds.left < 0 && bounds.top < 0 && Math.abs(bounds.left) >= bounds.width && Math.abs(bounds.top) >= bounds.height);
        }
        return false;
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
        getDataSet: getDataSet,
        newBoxRect: newBoxRect,
        newRectDimensions: newRectDimensions,
        newBoxModel: newBoxModel,
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
        cssAttribute: cssAttribute,
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
        withinViewportOrigin: withinViewportOrigin,
        setElementCache: setElementCache,
        getElementCache: getElementCache,
        deleteElementCache: deleteElementCache,
        getElementAsNode: getElementAsNode
    });

    function formatPlaceholder(id, symbol = ':') {
        return `{${symbol + id.toString()}}`;
    }
    function replacePlaceholder(value, id, content, before = false) {
        const placeholder = typeof id === 'number' ? formatPlaceholder(id) : id;
        return value.replace(placeholder, (before ? placeholder : '') + content + (before ? '' : placeholder));
    }
    function replaceIndent(value, depth, pattern) {
        if (depth >= 0) {
            let indent = -1;
            return value.split('\n').map(line => {
                const match = pattern.exec(line);
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
        return (value.replace(/&#(\d+);/g, (match, capture) => String.fromCharCode(parseInt(capture)))
            .replace(/\u00A0/g, '&#160;')
            .replace(/\u2002/g, '&#8194;')
            .replace(/\u2003/g, '&#8195;')
            .replace(/\u2009/g, '&#8201;')
            .replace(/\u200C/g, '&#8204;')
            .replace(/\u200D/g, '&#8205;')
            .replace(/\u200E/g, '&#8206;')
            .replace(/\u200F/g, '&#8207;'));
    }
    function replaceCharacter(value) {
        return (value.replace(/&nbsp;/g, '&#160;')
            .replace(/&(?!#?[A-Za-z0-9]{2,};)/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/'/g, '&apos;')
            .replace(/"/g, '&quot;'));
    }
    function parseTemplate(value) {
        const result = { '__root': value };
        let pattern;
        let match = false;
        let characters = value.length;
        let section = '';
        do {
            if (match) {
                const segment = match[0].replace(new RegExp(`^${match[1]}\\n`), '').replace(new RegExp(`${match[1]}$`), '');
                for (const index in result) {
                    result[index] = result[index].replace(new RegExp(match[0], 'g'), `{%${match[2]}}`);
                }
                result[match[2]] = segment;
                characters -= match[0].length;
                section = match[2];
            }
            if (match === null || characters === 0) {
                if (section) {
                    value = result[section];
                    if (!value) {
                        break;
                    }
                    characters = value.length;
                    section = '';
                    match = null;
                }
                else {
                    break;
                }
            }
            if (!match) {
                pattern = /(!(\w+))\n[\w\W]*\n*\1/g;
            }
            if (pattern) {
                match = pattern.exec(value);
            }
            else {
                break;
            }
        } while (true);
        return result;
    }
    function createTemplate(value, data, index) {
        let output = index === undefined ? value['__root'].trim() : value[index];
        for (const attr in data) {
            let result = '';
            if (isArray(data[attr])) {
                for (let i = 0; i < data[attr].length; i++) {
                    result += createTemplate(value, data[attr][i], attr.toString());
                }
                result = trimEnd(result, '\\n');
            }
            else {
                result = data[attr];
            }
            let hash = '';
            if (isString(result)) {
                if (isArray(data[attr])) {
                    hash = '%';
                }
                else {
                    hash = '[&~]';
                }
                output = output.replace(new RegExp(`{${hash + attr}}`, 'g'), result);
            }
            if (result === false ||
                Array.isArray(result) && result.length === 0 ||
                hash && hash !== '%') {
                output = output.replace(new RegExp(`{%${attr}}\\n*`, 'g'), '');
            }
            if (hash === '' && new RegExp(`{&${attr}}`).test(output)) {
                output = '';
            }
        }
        if (index === undefined) {
            output = output.replace(/\n{%\w+}\n/g, '\n');
        }
        return output.replace(/\s+([\w:]+="[^"]*)?{~\w+}"?/g, '');
    }
    function getTemplateSection(data, ...levels) {
        let current = data;
        for (const level of levels) {
            const [index, array = '0'] = level.split('-');
            if (current[index] && current[index][parseInt(array)]) {
                current = current[index][parseInt(array)];
            }
            else {
                return {};
            }
        }
        return current;
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
        getTemplateSection: getTemplateSection
    });

    const base = {
        Container
    };

    exports.base = base;
    exports.color = color;
    exports.dom = dom;
    exports.util = util;
    exports.xml = xml;

    Object.defineProperty(exports, '__esModule', { value: true });

}));
