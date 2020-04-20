/* squared 1.6.3
   https://github.com/anpham6/squared */

(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
    typeof define === 'function' && define.amd ? define(['exports'], factory) :
    (global = global || self, factory(global.squared = {}));
}(this, (function (exports) { 'use strict';

    const DECIMAL = '-?(?:\\d+(?:\\.\\d+)?|\\d*\\.\\d+)';
    const UNIT_LENGTH = 'px|em|pt|rem|ch|pc|vw|vh|vmin|vmax|mm|cm|in';
    const STRING = {
        DECIMAL,
        PERCENT: '-?\\d+(?:\\.\\d+)?%',
        LENGTH: `(${DECIMAL})(${UNIT_LENGTH})?`,
        LENGTH_PERCENTAGE: `(${DECIMAL}(?:${UNIT_LENGTH}|%)?)`,
        UNIT_LENGTH,
        DATAURI: '(?:data:([^,]+),)?(.*?)',
        CSS_SELECTOR_LABEL: '[\\.#]?[\\w\\-]+',
        CSS_SELECTOR_PSEUDO_ELEMENT: '::[\\w\\-]+',
        CSS_SELECTOR_PSEUDO_CLASS: ':[\\w\\-]+(?:\\(\\s*([^()]+)\\s*\\)|\\(\\s*([\\w\\-]+\\(.+?\\))\\s*\\))?',
        CSS_SELECTOR_ATTR: '\\[((?:\\*\\|)?(?:\\w+\\\\:)?[\\w\\-]+)(?:([~^$*|])?=(?:"([^"]+)"|\'([^\']+)\'|([^\\s\\]]+))\\s*(i)?)?\\]',
        CSS_ANGLE: `(${DECIMAL})(deg|rad|turn|grad)`,
        CSS_TIME: `(${DECIMAL})(s|ms)`,
        CSS_CALC: 'calc\\((.+)\\)'
    };
    const FILE = {
        NAME: /[/\\]?(([^/\\]+?)\.([^/\\]+?))$/,
        SVG: /\.svg$/i
    };
    const UNIT = {
        DECIMAL: new RegExp(`^${STRING.DECIMAL}$`),
        LENGTH: new RegExp(`^${STRING.LENGTH}$`),
        PERCENT: new RegExp(`^${STRING.PERCENT}$`),
        LENGTH_PERCENTAGE: new RegExp(`^${STRING.LENGTH_PERCENTAGE}$`)
    };
    const CSS = {
        PX: /\dpx$/,
        ANGLE: new RegExp(`^${STRING.CSS_ANGLE}$`),
        TIME: new RegExp(`^${STRING.CSS_TIME}$`),
        CALC: new RegExp(`^${STRING.CSS_CALC}$`),
        VAR: /var\((--[A-Za-z\d-]+)\s*(?!,\s*var\()(?:,\s*([a-z-]+\([^)]+\)|[^)]+))?\)/,
        URL: /^url\((?:"(.+)"|(.+))\)$/,
        CUSTOM_PROPERTY: /^\s*var\(.+\)\s*$/,
        HEX: /[A-Za-z\d]{3,8}/,
        RGBA: /rgba?\((\d+),\s+(\d+),\s+(\d+)(?:,\s+([\d.]+))?\)/,
        HSLA: /hsla?\((\d+),\s+(\d+)%,\s+(\d+)%(?:,\s+([\d.]+))?\)/,
        SELECTOR_G: new RegExp(`\\s*((?:${STRING.CSS_SELECTOR_ATTR}|${STRING.CSS_SELECTOR_PSEUDO_CLASS}|${STRING.CSS_SELECTOR_PSEUDO_ELEMENT}|${STRING.CSS_SELECTOR_LABEL})+|[>~+*])\\s*`, 'g'),
        SELECTOR_LABEL: new RegExp(STRING.CSS_SELECTOR_LABEL),
        SELECTOR_PSEUDO_ELEMENT: new RegExp(STRING.CSS_SELECTOR_PSEUDO_ELEMENT),
        SELECTOR_PSEUDO_CLASS: new RegExp(STRING.CSS_SELECTOR_PSEUDO_CLASS),
        SELECTOR_ATTR: new RegExp(STRING.CSS_SELECTOR_ATTR)
    };
    const XML = {
        ATTRIBUTE: /([^\s]+)="([^"]+)"/,
        ENTITY: /&#?[A-Za-z\d]+;/,
        SEPARATOR: /\s*,\s*/,
        DELIMITER: /\s*;\s*/,
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
        UNITZERO: /^\s*0[a-z]*\s*$/,
        WORDDASH: /[a-zA-Z\d]/
    };
    const COMPONENT = {
        PROTOCOL: /^([A-Za-z]{3,}:\/\/)([A-Za-z\d\-.]+)(:\d+)?(\/.*)?$/
    };
    const ESCAPE = {
        ENTITY: /&#(\d+);/g,
        NONENTITY: /&(?!#?[A-Za-z\d]{2,};)/g
    };

    var regex = /*#__PURE__*/Object.freeze({
        __proto__: null,
        STRING: STRING,
        FILE: FILE,
        UNIT: UNIT,
        CSS: CSS,
        XML: XML,
        CHAR: CHAR,
        COMPONENT: COMPONENT,
        ESCAPE: ESCAPE
    });

    const UUID_ALPHA = '0123456789abcdef';
    const UUID_SEGMENT = [8, 4, 4, 4, 12];
    const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const NUMERALS = [
        '', 'C', 'CC', 'CCC', 'CD', 'D', 'DC', 'DCC', 'DCCC', 'CM',
        '', 'X', 'XX', 'XXX', 'XL', 'L', 'LX', 'LXX', 'LXXX', 'XC',
        '', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX'
    ];
    const CACHE_CAMELCASE = {};
    const CACHE_UNDERSCORE = {};
    function hasMimeType(formats, value) {
        return formats === '*' || formats.includes(parseMimeType(value));
    }
    function parseMimeType(value) {
        switch (fromLastIndexOf(value.trim(), '.').toLowerCase()) {
            case 'aac':
                return 'audio/aac';
            case 'abw':
                return 'application/x-abiword';
            case 'apng':
                return 'image/apng';
            case 'arc':
                return 'application/x-freearc';
            case 'avi':
                return 'video/x-msvideo';
            case 'azw':
                return 'application/vnd.amazon.ebook';
            case 'bin':
                return 'application/octet-stream';
            case 'bmp':
                return 'image/bmp';
            case 'bz':
                return 'application/x-bzip';
            case 'bz2':
                return 'application/x-bzip2';
            case 'csh':
                return 'application/x-csh';
            case 'css':
                return 'text/css';
            case 'csv':
                return 'text/csv';
            case 'doc':
                return 'application/msword';
            case 'docx':
                return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
            case 'eot':
            case 'embedded-opentype':
                return 'application/vnd.ms-fontobject';
            case 'epub':
                return 'application/epub+zip';
            case 'flac':
                return 'audio/flac';
            case 'gif':
                return 'image/gif';
            case 'gsm':
                return 'audio/gsm';
            case 'heic':
                return 'image/heic';
            case 'heif':
                return 'image/heif';
            case 'htm':
            case 'html':
                return 'text/html';
            case 'cur':
            case 'ico':
                return 'image/x-icon';
            case 'ics':
                return 'text/calendar';
            case 'jar':
                return 'application/java-archive';
            case 'jpeg':
            case 'jpg':
            case 'jfif':
            case 'pjpeg':
            case 'pjp':
                return 'image/jpeg';
            case 'js':
            case 'mjs':
                return 'text/javascript';
            case 'json':
                return 'application/json';
            case 'jsonp':
                return 'application/javascript';
            case 'jsonld':
                return 'application/ld+json';
            case 'mid':
            case 'midi':
                return 'audio/midi';
            case 'mkv':
                return 'video/x-matroska';
            case 'mp3':
            case 'mpeg':
                return 'audio/mpeg';
            case 'mp4':
                return 'video/mp4';
            case 'mpkg':
                return 'application/vnd.apple.installer+xml';
            case 'odp':
                return 'application/vnd.oasis.opendocument.presentation';
            case 'ods':
                return 'application/vnd.oasis.opendocument.spreadsheet';
            case 'odt':
                return 'application/vnd.oasis.opendocument.text';
            case 'oga':
            case 'spx':
            case 'ogg':
                return 'audio/ogg';
            case 'ogv':
            case 'ogm':
                return 'video/ogg';
            case 'ogx':
                return 'application/ogg';
            case 'otf':
            case 'opentype':
                return 'font/otf';
            case 'png':
                return 'image/png';
            case 'pdf':
                return 'application/pdf';
            case 'ppt':
                return 'application/vnd.ms-powerpoint';
            case 'pptx':
                return 'application/vnd.openxmlformats-officedocument.presentationml.presentation';
            case 'rar':
                return 'application/x-rar-compressed';
            case 'rtf':
                return 'application/rtf';
            case 'sh':
                return 'application/x-sh';
            case 'svg':
                return 'image/svg+xml';
            case 'swf':
                return 'application/x-shockwave-flash';
            case 'tar':
                return 'application/x-tar';
            case 'tif':
            case 'tiff':
                return 'image/tiff';
            case 'ts':
                return 'video/mp2t';
            case 'ttf':
            case 'truetype':
                return 'font/ttf';
            case 'txt':
                return 'text/plain';
            case 'vsd':
                return 'application/vnd.visio';
            case 'wav':
                return 'audio/wav';
            case 'weba':
            case 'webm':
                return 'audio/webm';
            case 'webp':
                return 'image/webp';
            case 'woff':
                return 'font/woff';
            case 'woff2':
                return 'font/woff2';
            case 'xhtml':
                return 'application/xhtml+xml';
            case 'xls':
                return 'application/vnd.ms-excel';
            case 'xlsx':
                return 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
            case 'xml':
                return 'application/xml';
            case 'xul':
                return 'application/vnd.mozilla.xul+xml';
            case 'zip':
                return 'application/zip';
            case '3gp':
                return 'video/3gpp';
            case '3g2':
                return 'video/3gpp2';
            case '7z':
                return 'application/x-7z-compressed';
            default:
                return '';
        }
    }
    function fromMimeType(value) {
        switch (value) {
            case 'audio/aac':
                return 'aac';
            case 'application/x-abiword':
                return 'abw';
            case 'image/apng':
                return 'apng';
            case 'application/x-freearc':
                return 'arc';
            case 'video/x-msvideo':
                return 'avi';
            case 'application/vnd.amazon.ebook':
                return 'azw';
            case 'application/octet-stream':
                return 'bin';
            case 'image/bmp':
                return 'bmp';
            case 'application/x-bzip':
                return 'bz';
            case 'application/x-bzip2':
                return 'bz2';
            case 'application/x-csh':
                return 'csh';
            case 'text/css':
                return 'css';
            case 'text/csv':
                return 'csv';
            case 'application/msword':
                return 'doc';
            case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
                return 'docx';
            case 'application/vnd.ms-fontobject':
                return 'eot';
            case 'application/epub+zip':
                return 'epub';
            case 'audio/flac':
                return 'flac';
            case 'image/gif':
                return 'gif';
            case 'audio/gsm':
                return 'gsm';
            case 'image/heic':
                return 'heic';
            case 'image/heif':
                return 'heif';
            case 'text/html':
                return 'html';
            case 'image/x-icon':
                return 'ico';
            case 'text/calendar':
                return 'ics';
            case 'application/java-archive':
                return 'jar';
            case 'image/jpeg':
                return 'jpg';
            case 'text/javascript':
                return 'js';
            case 'application/json':
                return 'json';
            case 'application/ld+json':
                return 'jsonld';
            case 'audio/midi':
                return 'mid';
            case 'video/x-matroska':
                return 'mkv';
            case 'audio/mpeg':
                return 'mp3';
            case 'video/mp4':
                return 'mp4';
            case 'application/vnd.apple.installer+xml':
                return 'mpkg';
            case 'application/vnd.oasis.opendocument.presentation':
                return 'odp';
            case 'application/vnd.oasis.opendocument.spreadsheet':
                return 'ods';
            case 'application/vnd.oasis.opendocument.text':
                return 'odt';
            case 'audio/ogg':
                return 'ogg';
            case 'video/ogg':
                return 'ogv';
            case 'application/ogg':
                return 'ogx';
            case 'font/otf':
                return 'otf';
            case 'image/png':
                return 'png';
            case 'application/pdf':
                return 'pdf';
            case 'application/vnd.ms-powerpoint':
                return 'ppt';
            case 'application/vnd.openxmlformats-officedocument.presentationml.presentation':
                return 'pptx';
            case 'application/x-rar-compressed':
                return 'rar';
            case 'application/rtf':
                return 'rtf';
            case 'application/x-sh':
                return 'sh';
            case 'image/svg+xml':
                return 'svg';
            case 'application/x-shockwave-flash':
                return 'swf';
            case 'application/x-tar':
                return 'tar';
            case 'image/tiff':
                return 'tif';
            case 'video/mp2t':
                return 'ts';
            case 'font/ttf':
                return 'ttf';
            case 'text/plain':
                return 'txt';
            case 'application/vnd.visio':
                return 'vsd';
            case 'audio/wav':
                return 'wav';
            case 'audio/webm':
                return 'video/webm';
            case 'image/webp':
                return 'webp';
            case 'font/woff':
                return 'woff';
            case 'font/woff2':
                return 'woff2';
            case 'application/xhtml+xml':
                return 'xhtml';
            case 'application/vnd.ms-excel':
                return 'xls';
            case 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet':
                return 'xlsx';
            case 'text/xml':
                return 'xml';
            case 'application/vnd.mozilla.xul+xml':
                return 'xul';
            case 'application/zip':
                return 'zip';
            case 'video/3gpp':
                return '3gp';
            case 'video/3gpp2':
                return '3g2';
            case 'application/x-7z-compressed':
                return '7z';
            default:
                return '';
        }
    }
    function capitalize(value, upper) {
        return upper === false ? value.charAt(0).toLowerCase() + value.substring(1) : value.charAt(0).toUpperCase() + value.substring(1).toLowerCase();
    }
    function capitalizeString(value) {
        const result = value.split('');
        XML.BREAKWORD_G.lastIndex = 0;
        let match;
        while ((match = XML.BREAKWORD_G.exec(value)) !== null) {
            const index = match.index;
            if (index !== undefined) {
                result[index] = match[1].charAt(0).toUpperCase();
            }
        }
        return result.join('');
    }
    function lowerCaseString(value) {
        let result = value;
        XML.BREAKWORD_G.lastIndex = 0;
        let match;
        while ((match = XML.BREAKWORD_G.exec(value)) !== null) {
            const index = match.index;
            if (index !== undefined) {
                const word = match[1];
                if (!XML.ENTITY.test(word)) {
                    const start = index + word.length;
                    result = (index > 0 ? result.substring(0, match.index) : '') + value.substring(index, start).toLowerCase() + result.substring(start);
                }
            }
        }
        return result;
    }
    function spliceString(value, index, length) {
        return index === 0 ? value.substring(length) : value.substring(0, index) + value.substring(index + length);
    }
    function convertUnderscore(value) {
        const cacheData = CACHE_UNDERSCORE[value];
        if (cacheData) {
            return cacheData;
        }
        let result = value[0].toLowerCase();
        let lower = true;
        const length = value.length;
        let i = 1;
        while (i < length) {
            const ch = value.charAt(i++);
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
    function convertCamelCase(value, char = '-') {
        let i = value.indexOf(char);
        if (i === -1) {
            return value;
        }
        const cacheData = CACHE_CAMELCASE[value];
        if (cacheData) {
            return cacheData;
        }
        let result = value.substring(0, i);
        let previous = '';
        const length = value.length;
        while (i < length) {
            const ch = value.charAt(i++);
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
    function convertWord(value, dash) {
        let result = '';
        const pattern = dash ? CHAR.WORDDASH : CHAR.WORD;
        const length = value.length;
        let i = 0;
        while (i < length) {
            const ch = value.charAt(i++);
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
    function convertRoman(value) {
        const digits = value.toString().split('');
        let result = '';
        let i = 3;
        while (i--) {
            result = (NUMERALS[parseInt(digits.pop()) + (i * 10)] || '') + result;
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
    function randomUUID(separator = '-') {
        let result = '';
        for (let i = 0; i < 5; ++i) {
            if (i > 0) {
                result += separator;
            }
            const length = UUID_SEGMENT[i];
            for (let j = 0; j < length; ++j) {
                result += UUID_ALPHA.charAt(Math.floor(Math.random() * 16));
            }
        }
        return result;
    }
    function formatString(value, ...params) {
        const length = params.length;
        let i = 0;
        while (i < length) {
            value = value.replace(`{${i}}`, params[i++]);
        }
        return value;
    }
    function delimitString(options, ...appending) {
        const value = options.value || '';
        if (value === '' && appending.length === 1) {
            return appending[0];
        }
        const delimiter = options.delimiter || '|';
        const not = options.not || [];
        const remove = options.remove || false;
        const values = value !== '' ? value.split(delimiter) : [];
        const length = appending.length;
        let i = -1;
        while (++i < length) {
            const append = appending[i];
            if (append !== '') {
                if (values.includes(not[i])) {
                    continue;
                }
                const index = values.findIndex(a => a === append);
                if (index === -1) {
                    values.push(append);
                }
                else if (remove) {
                    values.splice(index, 1);
                }
            }
        }
        if (options.sort) {
            values.sort();
        }
        return values.join(delimiter);
    }
    function splitEnclosing(value, prefix, separator = '', opening = '(', closing = ')') {
        if (separator.length > 1) {
            return [];
        }
        if (!isString(prefix)) {
            prefix = opening;
        }
        const prefixed = prefix !== opening;
        const combined = prefixed ? prefix + opening : opening;
        const result = [];
        const appendValues = (segment) => {
            segment.split(separator).forEach(seg => {
                seg = seg.trim();
                if (seg !== '') {
                    result.push(seg);
                }
            });
        };
        let position = 0;
        let index = -1;
        const length = value.length;
        while ((index = value.indexOf(combined, position)) !== -1) {
            let preceding = '';
            if (index !== position) {
                let segment = value.substring(position, index);
                if (separator) {
                    segment = segment.trim();
                    if (segment !== '') {
                        appendValues(segment);
                        if (!prefixed) {
                            const joined = result[result.length - 1];
                            if (value.substring(index - joined.length, index + 1) === joined + prefix) {
                                preceding = joined;
                                result.length--;
                            }
                        }
                    }
                }
                else {
                    result.push(segment);
                }
            }
            let found = false;
            for (let i = index + (prefixed ? prefix.length : 0) + 1, open = 1, close = 0; i < length; ++i) {
                switch (value.charAt(i)) {
                    case opening:
                        ++open;
                        break;
                    case closing:
                        ++close;
                        break;
                }
                if (open === close) {
                    if (separator) {
                        for (; i < length; ++i) {
                            if (value.charAt(i) === separator) {
                                break;
                            }
                        }
                        position = i + 1;
                        result.push(preceding + value.substring(index, i).trim());
                    }
                    else {
                        position = i + 1;
                        result.push(value.substring(index, position));
                    }
                    if (position === length) {
                        return result;
                    }
                    found = true;
                    break;
                }
            }
            if (!found) {
                return [];
            }
        }
        if (position < length) {
            const excess = value.substring(position);
            if (separator) {
                const segment = excess.trim();
                if (segment !== '') {
                    appendValues(segment);
                }
            }
            else {
                result.push(excess);
            }
        }
        return result;
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
    function isObject(value) {
        return typeof value === 'object' && value !== null;
    }
    function isPlainObject(value) {
        return isObject(value) && value.constructor === Object;
    }
    function isEqual(source, other) {
        if (source === other) {
            return true;
        }
        else if (Array.isArray(source) && Array.isArray(other)) {
            const length = source.length;
            if (length === other.length) {
                let i = 0;
                while (i < length) {
                    if (source[i] !== other[i++]) {
                        return false;
                    }
                }
                return true;
            }
        }
        else if (isPlainObject(source) && isPlainObject(other)) {
            if (Object.keys(source).length === Object.keys(other).length) {
                for (const attr in source) {
                    const a = source[attr];
                    const b = other[attr];
                    if (a !== b) {
                        if (isPlainObject(a) && isPlainObject(b) && isEqual(a, b)) {
                            continue;
                        }
                        return false;
                    }
                }
                return true;
            }
        }
        return false;
    }
    function includes(source, value, delimiter = XML.SEPARATOR) {
        if (source) {
            for (const name of source.split(delimiter)) {
                if (name === value) {
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
        data.forEach(value => {
            if (Array.isArray(value)) {
                result.push(cloneArray(value, [], object));
            }
            else if (object && isPlainObject(value)) {
                result.push(cloneObject(value, {}, true));
            }
            else {
                result.push(value);
            }
        });
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
    function resolvePath(value, href) {
        value = value.trim();
        if (!COMPONENT.PROTOCOL.test(value)) {
            const origin = location.origin;
            let pathname = ((href === null || href === void 0 ? void 0 : href.replace(origin, '')) || location.pathname).split('/');
            pathname.pop();
            if (value.charAt(0) === '/') {
                value = origin + value;
            }
            else if (value.startsWith('../')) {
                const segments = [];
                let levels = 0;
                value.split('/').forEach(dir => {
                    if (dir === '..') {
                        levels++;
                    }
                    else {
                        segments.push(dir);
                    }
                });
                pathname = pathname.slice(0, Math.max(pathname.length - levels, 0)).concat(segments);
                value = origin + pathname.join('/');
            }
            else {
                value = origin + pathname.join('/') + '/' + value;
            }
        }
        return value;
    }
    function trimBoth(value, char = '"') {
        const match = new RegExp(`^(${char})(.*?)\\1$`).exec(value);
        return match ? match[2] : value;
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
    function appendSeparator(preceding, value, separator = '/') {
        preceding = preceding.trim();
        value = value.trim();
        return preceding + (preceding !== '' && value !== '' && !preceding.endsWith(separator) && !value.startsWith(separator) ? separator : '') + value;
    }
    function fromLastIndexOf(value, ...char) {
        for (const ch of char) {
            const index = value.lastIndexOf(ch);
            if (index !== -1) {
                return value.substring(index + 1);
            }
        }
        return value;
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
            const search = /^\*.+\*$/.test(value) ? (a) => a.includes(value.replace(/^\*/, '').replace(/\*$/, '')) :
                value.startsWith('*') ? (a) => a.endsWith(value.replace(/^\*/, '')) :
                    value.endsWith('*') ? (a) => a.startsWith(value.replace(/\*$/, '')) : (a) => a === value;
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
            if (!Object.prototype.hasOwnProperty.call(dest, attr)) {
                dest[attr] = source[attr];
            }
        }
        return dest;
    }
    function assignEmptyValue(dest, ...attrs) {
        const length = attrs.length;
        if (length > 1) {
            let current = dest;
            let i = 0;
            do {
                const name = attrs[i];
                const value = current[name];
                if (i === length - 2) {
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
            } while (++i);
        }
    }
    function findSet(list, predicate) {
        let i = 0;
        for (const item of list) {
            if (predicate(item, i++, list)) {
                return item;
            }
        }
        return undefined;
    }
    function sortNumber(values, ascending = true) {
        return ascending ? values.sort((a, b) => a < b ? -1 : 1) : values.sort((a, b) => a > b ? -1 : 1);
    }
    function safeNestedArray(list, index) {
        let result = list[index];
        if (result === undefined || result === null) {
            result = [];
            list[index] = result;
        }
        return result;
    }
    function safeNestedMap(map, index) {
        let result = map[index];
        if (result === undefined || result === null) {
            result = {};
            map[index] = result;
        }
        return result;
    }
    function sortArray(list, ascending, ...attrs) {
        return list.sort((a, b) => {
            for (const attr of attrs) {
                let valueA = a;
                let valueB = b;
                for (const name of attr.split('.')) {
                    const vA = valueA[name], vB = valueB[name];
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
    function flatArray(list) {
        let length = list.length;
        let i = -1;
        while (++i < length) {
            const item = list[i];
            if (item === undefined || item === null) {
                list.splice(i--, 1);
                length--;
            }
        }
        return list;
    }
    function flatMultiArray(list) {
        let result = [];
        const length = list.length;
        let i = 0;
        while (i < length) {
            const item = list[i++];
            if (Array.isArray(item)) {
                if (item.length) {
                    result = result.concat(flatMultiArray(item));
                }
            }
            else if (item !== undefined && item !== null) {
                result.push(item);
            }
        }
        return result;
    }
    function spliceArray(list, predicate, callback, deleteCount) {
        let length = list.length;
        let i = -1;
        let deleted = 0;
        while (++i < length) {
            const item = list[i];
            if (predicate(item, i, list)) {
                if (callback) {
                    callback(item, i, list);
                }
                list.splice(i--, 1);
                if (++deleted === deleteCount) {
                    break;
                }
                length--;
            }
        }
        return list;
    }
    function partitionArray(list, predicate) {
        const length = list.length;
        const valid = new Array(length);
        const invalid = new Array(length);
        let i = 0, j = 0, k = 0;
        while (i < length) {
            const item = list[i];
            if (predicate(item, i++, list)) {
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
    function sameArray(list, predicate) {
        const length = list.length;
        if (length) {
            let baseValue;
            let i = 0;
            while (i < length) {
                const value = predicate(list[i], i, list);
                if (i++ === 0) {
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
    function joinArray(list, predicate, char = '\n', trailing = true) {
        let result = '';
        const length = list.length;
        let i = 0;
        while (i < length) {
            const value = predicate(list[i], i++, list);
            if (value !== '') {
                result += value + char;
            }
        }
        return trailing ? result : result.substring(0, result.length - char.length);
    }
    function iterateArray(list, predicate, start = 0, end = Number.POSITIVE_INFINITY) {
        start = Math.max(start, 0);
        const length = Math.min(list.length, end);
        let i = start;
        while (i < length) {
            const item = list[i];
            const result = predicate(item, i++, list);
            if (result === true) {
                return Number.POSITIVE_INFINITY;
            }
        }
        return length;
    }
    function iterateReverseArray(list, predicate, start = 0, end = Number.POSITIVE_INFINITY) {
        start = Math.max(start, 0);
        const length = Math.min(list.length, end);
        let i = length - 1;
        while (i >= start) {
            const item = list[i];
            const result = predicate(item, i--, list);
            if (result === true) {
                return Number.POSITIVE_INFINITY;
            }
        }
        return length;
    }
    function conditionArray(list, predicate, callback) {
        const length = list.length;
        let i = -1;
        while (++i < length) {
            const item = list[i];
            if (predicate(item, i, list)) {
                const value = callback(item, i, list);
                if (value === false) {
                    break;
                }
            }
        }
    }
    function flatMap(list, predicate) {
        const length = list.length;
        const result = new Array(length);
        let i = 0, j = 0;
        while (i < length) {
            const item = predicate(list[i], i++, list);
            if (hasValue(item)) {
                result[j++] = item;
            }
        }
        result.length = j;
        return result;
    }
    function replaceMap(list, predicate) {
        const length = list.length;
        let i = 0;
        while (i < length) {
            list[i] = predicate(list[i], i++, list);
        }
        return list;
    }
    function objectMap(list, predicate) {
        const length = list.length;
        const result = new Array(length);
        let i = 0;
        while (i < length) {
            result[i] = predicate(list[i], i++, list);
        }
        return result;
    }

    var util = /*#__PURE__*/Object.freeze({
        __proto__: null,
        hasMimeType: hasMimeType,
        parseMimeType: parseMimeType,
        fromMimeType: fromMimeType,
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
        randomUUID: randomUUID,
        formatString: formatString,
        delimitString: delimitString,
        splitEnclosing: splitEnclosing,
        hasBit: hasBit,
        isNumber: isNumber,
        isString: isString,
        isArray: isArray,
        isObject: isObject,
        isPlainObject: isPlainObject,
        isEqual: isEqual,
        includes: includes,
        cloneInstance: cloneInstance,
        cloneArray: cloneArray,
        cloneObject: cloneObject,
        resolvePath: resolvePath,
        trimBoth: trimBoth,
        trimString: trimString,
        trimStart: trimStart,
        trimEnd: trimEnd,
        appendSeparator: appendSeparator,
        fromLastIndexOf: fromLastIndexOf,
        searchObject: searchObject,
        hasValue: hasValue,
        withinRange: withinRange,
        aboveRange: aboveRange,
        belowRange: belowRange,
        assignEmptyProperty: assignEmptyProperty,
        assignEmptyValue: assignEmptyValue,
        findSet: findSet,
        sortNumber: sortNumber,
        safeNestedArray: safeNestedArray,
        safeNestedMap: safeNestedMap,
        sortArray: sortArray,
        flatArray: flatArray,
        flatMultiArray: flatMultiArray,
        spliceArray: spliceArray,
        partitionArray: partitionArray,
        sameArray: sameArray,
        joinArray: joinArray,
        iterateArray: iterateArray,
        iterateReverseArray: iterateReverseArray,
        conditionArray: conditionArray,
        flatMap: flatMap,
        replaceMap: replaceMap,
        objectMap: objectMap
    });

    class Container {
        constructor(children) {
            this._children = children || [];
        }
        [Symbol.iterator]() {
            const data = { done: false };
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
            const children = this._children;
            if (index !== undefined) {
                if (value) {
                    if (index >= 0 && index < children.length) {
                        children[index] = value;
                        return value;
                    }
                    return undefined;
                }
                return children[index];
            }
            return children[children.length - 1];
        }
        append(item) {
            this._children.push(item);
            return this;
        }
        remove(...items) {
            const result = [];
            const children = this._children;
            items.forEach(item => {
                const length = children.length;
                let i = -1;
                while (++i < length) {
                    if (children[i] === item) {
                        children.splice(i, 1);
                        result.push(item);
                        break;
                    }
                }
            });
            return result;
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
            let i = 0;
            while (i < length) {
                predicate(children[i], i++, children);
            }
            return this;
        }
        iterate(predicate, start, end) {
            return iterateArray(this._children, predicate, start, end);
        }
        join(...other) {
            let children = this._children;
            other.forEach(item => children = children.concat(item.children));
            this._children = children;
            return this;
        }
        every(predicate) {
            const children = this._children;
            const length = children.length;
            if (length) {
                let i = 0;
                while (i < length) {
                    if (!predicate(children[i], i++, children)) {
                        return false;
                    }
                }
                return true;
            }
            return false;
        }
        same(predicate) {
            return sameArray(this._children, predicate);
        }
        partition(predicate) {
            return partitionArray(this._children, predicate);
        }
        extract(predicate, options) {
            let also;
            let error;
            if (options) {
                ({ also, error } = options);
            }
            const result = [];
            const children = this._children;
            let length = children.length;
            let i = -1;
            while (++i < length) {
                const item = children[i];
                if (error && error(item, i, children)) {
                    break;
                }
                if (predicate(item, i, children)) {
                    also === null || also === void 0 ? void 0 : also.call(item, item);
                    result.push(item);
                    children.splice(i--, 1);
                    length--;
                }
            }
            return result;
        }
        map(predicate) {
            return objectMap(this._children, predicate);
        }
        flatMap(predicate) {
            return flatMap(this._children, predicate);
        }
        findIndex(predicate, options) {
            let also;
            let error;
            if (options) {
                ({ also, error } = options);
            }
            const children = this._children;
            const length = children.length;
            let i = -1;
            while (++i < length) {
                const item = children[i];
                if (error && error(item, i, children)) {
                    return -1;
                }
                if (predicate(item, i, children)) {
                    also === null || also === void 0 ? void 0 : also.call(item, item);
                    return i;
                }
            }
            return -1;
        }
        find(predicate, options) {
            let error;
            let also;
            let cascade;
            if (options) {
                ({ also, error, cascade } = options);
            }
            let invalid = false;
            const recurse = (container) => {
                const children = container.children;
                const length = children.length;
                let i = -1;
                while (++i < length) {
                    const item = children[i];
                    if (error && error(item, i, children)) {
                        invalid = true;
                        break;
                    }
                    if (predicate(item, i, children)) {
                        also === null || also === void 0 ? void 0 : also.call(item, item);
                        return item;
                    }
                    if (cascade && item instanceof Container && !item.isEmpty) {
                        const result = recurse(item);
                        if (result) {
                            also === null || also === void 0 ? void 0 : also.call(item, item);
                            return result;
                        }
                        else if (invalid) {
                            break;
                        }
                    }
                }
                return undefined;
            };
            return recurse(this);
        }
        some(predicate, options) {
            return this.find(predicate, options) !== undefined;
        }
        cascade(predicate, options) {
            let error;
            let also;
            if (options) {
                ({ also, error } = options);
            }
            let invalid = false;
            const recurse = (container) => {
                let result = [];
                const children = container.children;
                const length = children.length;
                let i = -1;
                while (++i < length) {
                    const item = children[i];
                    if (error && error(item, i, children)) {
                        invalid = true;
                        break;
                    }
                    if (!predicate || predicate(item)) {
                        also === null || also === void 0 ? void 0 : also.call(item, item);
                        result.push(item);
                    }
                    if (item instanceof Container && !item.isEmpty) {
                        result = result.concat(recurse(item));
                        if (invalid) {
                            break;
                        }
                    }
                }
                return result;
            };
            return recurse(this);
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
        get children() {
            return this._children;
        }
        get isEmpty() {
            return this._children.length === 0;
        }
        get length() {
            return this._children.length;
        }
    }

    class PromiseHandler {
        constructor(thisArg) {
            this.thisArg = thisArg;
            this.status = 0;
        }
        then(resolve) {
            this._then = resolve;
            if (this.status === 2 /* THEN_WAITING */) {
                this.status = 1 /* PENDING */;
                this.success();
            }
            return this;
        }
        catch(reject) {
            this._catch = reject;
            if (this.status === 4 /* CATCH_WAITING */) {
                this.status = 1 /* PENDING */;
                this.throw(this._error);
            }
            return this;
        }
        finally(complete) {
            this._finally = complete;
            switch (this.status) {
                case 6 /* FINALLY_WAITING */:
                    this.status = 3 /* THEN_COMPLETE */;
                case 3 /* THEN_COMPLETE */:
                case 5 /* CATCH_COMPLETE */:
                    this.finalize();
                    this.status = 7 /* FINALLY_COMPLETE */;
                    break;
            }
            return this;
        }
        success() {
            if (this.complete || this.waiting) {
                return;
            }
            if (this._then === undefined && this.status !== 1 /* PENDING */) {
                this.status = 2 /* THEN_WAITING */;
            }
            else {
                if (this.hasThen) {
                    this._then.call(this.thisArg);
                }
                this.status = 3 /* THEN_COMPLETE */;
                this.finalize();
            }
        }
        throw(error) {
            if (this.complete || this.waiting) {
                return;
            }
            if (this._catch === undefined && this.status !== 1 /* PENDING */) {
                this._error = error;
                this.status = 4 /* CATCH_WAITING */;
            }
            else {
                if (this.hasCatch) {
                    this._catch.call(this.thisArg, error);
                }
                this.status = 5 /* CATCH_COMPLETE */;
                this.finalize();
            }
        }
        finalize() {
            switch (this.status) {
                case 7 /* FINALLY_COMPLETE */:
                    return;
                case 3 /* THEN_COMPLETE */:
                case 5 /* CATCH_COMPLETE */:
                    if (this.hasFinally) {
                        this._finally.call(this.thisArg);
                        this.status = 7 /* FINALLY_COMPLETE */;
                        break;
                    }
                default:
                    this.status = 6 /* FINALLY_WAITING */;
                    break;
            }
        }
        get hasThen() {
            return typeof this._then === 'function';
        }
        get hasCatch() {
            return typeof this._catch === 'function';
        }
        get hasFinally() {
            return typeof this._finally === 'function';
        }
        get waiting() {
            switch (this.status) {
                case 2 /* THEN_WAITING */:
                case 4 /* CATCH_WAITING */:
                case 6 /* FINALLY_WAITING */:
                    return true;
            }
            return false;
        }
        get complete() {
            switch (this.status) {
                case 3 /* THEN_COMPLETE */:
                case 5 /* CATCH_COMPLETE */:
                case 7 /* FINALLY_COMPLETE */:
                    return true;
            }
            return false;
        }
    }

    function isWinEdge() {
        return isUserAgent(16 /* EDGE */) && isPlatform(2 /* WINDOWS */);
    }
    function isPlatform(value) {
        const platform = navigator.platform.toLowerCase();
        if (typeof value === 'string') {
            return platform.includes(value.toLowerCase());
        }
        return hasBit(value, 2 /* WINDOWS */) && platform.includes('win') || hasBit(value, 4 /* MAC */) && /(mac|iphone|ipad|ipod)/.test(platform);
    }
    function isUserAgent(value) {
        const userAgent = navigator.userAgent;
        let client;
        if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) {
            client = 4 /* SAFARI */;
        }
        else if (userAgent.includes('Firefox')) {
            client = 8 /* FIREFOX */;
        }
        else if (userAgent.includes('Edge')) {
            client = 16 /* EDGE */;
        }
        else {
            client = 2 /* CHROME */;
        }
        if (typeof value === 'string') {
            const name = value.toUpperCase();
            value = 0;
            if (name.includes('CHROME')) {
                value |= 2 /* CHROME */;
            }
            if (name.includes('SAFARI')) {
                value |= 4 /* SAFARI */;
            }
            if (name.includes('FIREFOX')) {
                value |= 8 /* FIREFOX */;
            }
            if (name.includes('EDGE')) {
                value |= 16 /* EDGE */;
            }
        }
        return hasBit(value, client);
    }
    function getDeviceDPI() {
        return window.devicePixelRatio * 96;
    }

    var client = /*#__PURE__*/Object.freeze({
        __proto__: null,
        isWinEdge: isWinEdge,
        isPlatform: isPlatform,
        isUserAgent: isUserAgent,
        getDeviceDPI: getDeviceDPI
    });

    const REGEX_DECIMALNOTATION = /^(-?\d+\.\d+)e(-?\d+)$/;
    const REGEX_TRUNCATE = /^(-?\d+)\.(\d*?)(0{5,}|9{5,})\d*$/;
    const REGEX_TRUNCATECACHE = {};
    function convertDecimalNotation(value) {
        const match = REGEX_DECIMALNOTATION.exec(value.toString());
        return match ? (parseInt(match[2]) > 0 ? Number.MAX_SAFE_INTEGER.toString() : '0') : value.toString();
    }
    function minArray(list) {
        return Math.min.apply(null, list);
    }
    function maxArray(list) {
        return Math.max.apply(null, list);
    }
    function equal(a, b, precision = 5) {
        precision += Math.floor(a).toString().length;
        return a.toPrecision(precision) === b.toPrecision(precision);
    }
    function moreEqual(a, b, precision = 5) {
        return a > b || equal(a, b, precision);
    }
    function lessEqual(a, b, precision = 5) {
        return a < b || equal(a, b, precision);
    }
    function truncate(value, precision = 3) {
        if (typeof value === 'string') {
            value = parseFloat(value);
        }
        const base = Math.floor(value);
        if (value === base) {
            return value.toString();
        }
        else if ((value >= 0 && value <= 1 / Math.pow(10, precision)) || (value < 0 && value >= -1 / Math.pow(10, precision))) {
            return '0';
        }
        else {
            if (base !== 0) {
                precision += base.toString().length;
            }
            return truncateTrailingZero(value.toPrecision(precision));
        }
    }
    function truncateFraction(value) {
        if (value !== Math.floor(value)) {
            const match = REGEX_TRUNCATE.exec(convertDecimalNotation(value));
            if (match) {
                const trailing = match[2];
                if (trailing === '') {
                    return Math.round(value);
                }
                const leading = match[1];
                return parseFloat(value.toPrecision((leading !== '0' ? leading.length : 0) + trailing.length));
            }
        }
        return value;
    }
    function truncateTrailingZero(value) {
        const match = CHAR.TRAILINGZERO.exec(value);
        return match ? value.substring(0, value.length - match[match[1] ? 2 : 0].length) : value;
    }
    function truncateString(value, precision = 3) {
        let pattern = REGEX_TRUNCATECACHE[precision];
        if (!pattern) {
            pattern = new RegExp(`(-?\\d+\\.\\d{${precision}})(\\d)\\d*`, 'g');
            REGEX_TRUNCATECACHE[precision] = pattern;
        }
        else {
            pattern.lastIndex = 0;
        }
        let output = value;
        let match;
        while ((match = pattern.exec(value)) !== null) {
            let trailing = match[1];
            if (parseInt(match[2]) >= 5) {
                trailing = truncateFraction((parseFloat(trailing) + 1 / Math.pow(10, precision))).toString();
            }
            output = output.replace(match[0], truncateTrailingZero(trailing));
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
    function clamp(value, min = 0, max = 1) {
        if (value < min) {
            value = min;
        }
        else if (value > max) {
            value = max;
        }
        return value;
    }
    function multipleOf(values, min = 0, offset) {
        const length = values.length;
        if (length > 1) {
            const increment = minArray(values);
            if ((offset === null || offset === void 0 ? void 0 : offset.length) === length) {
                let i = 0;
                while (i < length) {
                    min = Math.max(min, offset[i] + values[i++]);
                }
            }
            else {
                offset = undefined;
                min = Math.max(min, increment);
            }
            let value = 0;
            while (value < min) {
                value += increment;
            }
            const start = (offset === null || offset === void 0 ? void 0 : offset[0]) || 0;
            let valid = false;
            while (!valid) {
                const total = start + value;
                let i = 1;
                while (i < length) {
                    const multiple = (offset ? offset[i] : 0) + values[i++];
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
    function sin(value, accuracy = 11) {
        value = convertRadian(value);
        let result = value;
        for (let i = 3, j = 0; i <= accuracy; i += 2) {
            result += Math.pow(value, i) / factorial(i) * (j++ % 2 === 0 ? -1 : 1);
        }
        return result;
    }
    function cos(value, accuracy = 10) {
        value = convertRadian(value);
        let result = 1;
        for (let i = 2, j = 0; i <= accuracy; i += 2) {
            result += Math.pow(value, i) / factorial(i) * (j++ % 2 === 0 ? -1 : 1);
        }
        return result;
    }
    function tan(value, accuracy = 11) {
        return sin(value, accuracy) / cos(value, accuracy);
    }
    function factorial(value) {
        let result = 2;
        let i = 3;
        while (i <= value) {
            result *= i++;
        }
        return result;
    }
    function hypotenuse(a, b) {
        return Math.sqrt(Math.pow(a, 2) + Math.pow(b, 2));
    }

    var math = /*#__PURE__*/Object.freeze({
        __proto__: null,
        minArray: minArray,
        maxArray: maxArray,
        equal: equal,
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
        clamp: clamp,
        multipleOf: multipleOf,
        sin: sin,
        cos: cos,
        tan: tan,
        factorial: factorial,
        hypotenuse: hypotenuse
    });

    const STRING_HEX = '0123456789ABCDEF';
    const COLOR_CSS3 = [
        {
            value: '#000000',
            key: 'black',
            rgb: { r: 0, g: 0, b: 0 },
            hsl: { h: 0, s: 0, l: 0 }
        },
        {
            value: '#696969',
            key: 'dimgray',
            rgb: { r: 105, g: 105, b: 105 },
            hsl: { h: 0, s: 0, l: 41 }
        },
        {
            value: '#696969',
            key: 'dimgrey',
            rgb: { r: 105, g: 105, b: 105 },
            hsl: { h: 0, s: 0, l: 41 }
        },
        {
            value: '#808080',
            key: 'gray',
            rgb: { r: 128, g: 128, b: 128 },
            hsl: { h: 0, s: 0, l: 50 }
        },
        {
            value: '#808080',
            key: 'grey',
            rgb: { r: 128, g: 128, b: 128 },
            hsl: { h: 0, s: 0, l: 50 }
        },
        {
            value: '#A9A9A9',
            key: 'darkgray',
            rgb: { r: 169, g: 169, b: 169 },
            hsl: { h: 0, s: 0, l: 66 }
        },
        {
            value: '#A9A9A9',
            key: 'darkgrey',
            rgb: { r: 169, g: 169, b: 169 },
            hsl: { h: 0, s: 0, l: 66 }
        },
        {
            value: '#C0C0C0',
            key: 'silver',
            rgb: { r: 192, g: 192, b: 192 },
            hsl: { h: 0, s: 0, l: 75 }
        },
        {
            value: '#D3D3D3',
            key: 'lightgray',
            rgb: { r: 211, g: 211, b: 211 },
            hsl: { h: 0, s: 0, l: 83 }
        },
        {
            value: '#D3D3D3',
            key: 'lightgrey',
            rgb: { r: 211, g: 211, b: 211 },
            hsl: { h: 0, s: 0, l: 83 }
        },
        {
            value: '#DCDCDC',
            key: 'gainsboro',
            rgb: { r: 220, g: 220, b: 220 },
            hsl: { h: 0, s: 0, l: 86 }
        },
        {
            value: '#F5F5F5',
            key: 'whitesmoke',
            rgb: { r: 245, g: 245, b: 245 },
            hsl: { h: 0, s: 0, l: 96 }
        },
        {
            value: '#FFFFFF',
            key: 'white',
            rgb: { r: 255, g: 255, b: 255 },
            hsl: { h: 0, s: 0, l: 100 }
        },
        {
            value: '#BC8F8F',
            key: 'rosybrown',
            rgb: { r: 188, g: 143, b: 143 },
            hsl: { h: 0, s: 25, l: 65 }
        },
        {
            value: '#CD5C5C',
            key: 'indianred',
            rgb: { r: 205, g: 92, b: 92 },
            hsl: { h: 0, s: 53, l: 58 }
        },
        {
            value: '#A52A2A',
            key: 'brown',
            rgb: { r: 165, g: 42, b: 42 },
            hsl: { h: 0, s: 59, l: 41 }
        },
        {
            value: '#B22222',
            key: 'firebrick',
            rgb: { r: 178, g: 34, b: 34 },
            hsl: { h: 0, s: 68, l: 42 }
        },
        {
            value: '#F08080',
            key: 'lightcoral',
            rgb: { r: 240, g: 128, b: 128 },
            hsl: { h: 0, s: 79, l: 72 }
        },
        {
            value: '#800000',
            key: 'maroon',
            rgb: { r: 128, g: 0, b: 0 },
            hsl: { h: 0, s: 100, l: 25 }
        },
        {
            value: '#8B0000',
            key: 'darkred',
            rgb: { r: 139, g: 0, b: 0 },
            hsl: { h: 0, s: 100, l: 27 }
        },
        {
            value: '#FF0000',
            key: 'red',
            rgb: { r: 255, g: 0, b: 0 },
            hsl: { h: 0, s: 100, l: 50 }
        },
        {
            value: '#FFFAFA',
            key: 'snow',
            rgb: { r: 255, g: 250, b: 250 },
            hsl: { h: 0, s: 100, l: 99 }
        },
        {
            value: '#FFE4E1',
            key: 'mistyrose',
            rgb: { r: 255, g: 228, b: 225 },
            hsl: { h: 6, s: 100, l: 94 }
        },
        {
            value: '#FA8072',
            key: 'salmon',
            rgb: { r: 250, g: 128, b: 114 },
            hsl: { h: 6, s: 93, l: 71 }
        },
        {
            value: '#FF6347',
            key: 'tomato',
            rgb: { r: 255, g: 99, b: 71 },
            hsl: { h: 9, s: 100, l: 64 }
        },
        {
            value: '#E9967A',
            key: 'darksalmon',
            rgb: { r: 233, g: 150, b: 122 },
            hsl: { h: 15, s: 72, l: 70 }
        },
        {
            value: '#FF7F50',
            key: 'coral',
            rgb: { r: 255, g: 127, b: 80 },
            hsl: { h: 16, s: 100, l: 66 }
        },
        {
            value: '#FF4500',
            key: 'orangered',
            rgb: { r: 255, g: 69, b: 0 },
            hsl: { h: 16, s: 100, l: 50 }
        },
        {
            value: '#FFA07A',
            key: 'lightsalmon',
            rgb: { r: 255, g: 160, b: 122 },
            hsl: { h: 17, s: 100, l: 74 }
        },
        {
            value: '#A0522D',
            key: 'sienna',
            rgb: { r: 160, g: 82, b: 45 },
            hsl: { h: 19, s: 56, l: 40 }
        },
        {
            value: '#FFF5EE',
            key: 'seashell',
            rgb: { r: 255, g: 245, b: 238 },
            hsl: { h: 25, s: 100, l: 97 }
        },
        {
            value: '#D2691E',
            key: 'chocolate',
            rgb: { r: 210, g: 105, b: 30 },
            hsl: { h: 25, s: 75, l: 47 }
        },
        {
            value: '#8B4513',
            key: 'saddlebrown',
            rgb: { r: 139, g: 69, b: 19 },
            hsl: { h: 25, s: 76, l: 31 }
        },
        {
            value: '#F4A460',
            key: 'sandybrown',
            rgb: { r: 244, g: 164, b: 96 },
            hsl: { h: 28, s: 87, l: 67 }
        },
        {
            value: '#FFDAB9',
            key: 'peachpuff',
            rgb: { r: 255, g: 218, b: 185 },
            hsl: { h: 28, s: 100, l: 86 }
        },
        {
            value: '#CD853F',
            key: 'peru',
            rgb: { r: 205, g: 133, b: 63 },
            hsl: { h: 30, s: 59, l: 53 }
        },
        {
            value: '#FAF0E6',
            key: 'linen',
            rgb: { r: 250, g: 240, b: 230 },
            hsl: { h: 30, s: 67, l: 94 }
        },
        {
            value: '#FFE4C4',
            key: 'bisque',
            rgb: { r: 255, g: 228, b: 196 },
            hsl: { h: 33, s: 100, l: 88 }
        },
        {
            value: '#FF8C00',
            key: 'darkorange',
            rgb: { r: 255, g: 140, b: 0 },
            hsl: { h: 33, s: 100, l: 50 }
        },
        {
            value: '#DEB887',
            key: 'burlywood',
            rgb: { r: 222, g: 184, b: 135 },
            hsl: { h: 34, s: 57, l: 70 }
        },
        {
            value: '#FAEBD7',
            key: 'antiquewhite',
            rgb: { r: 250, g: 235, b: 215 },
            hsl: { h: 34, s: 78, l: 91 }
        },
        {
            value: '#D2B48C',
            key: 'tan',
            rgb: { r: 210, g: 180, b: 140 },
            hsl: { h: 34, s: 44, l: 69 }
        },
        {
            value: '#FFDEAD',
            key: 'navajowhite',
            rgb: { r: 255, g: 222, b: 173 },
            hsl: { h: 36, s: 100, l: 84 }
        },
        {
            value: '#FFEBCD',
            key: 'blanchedalmond',
            rgb: { r: 255, g: 235, b: 205 },
            hsl: { h: 36, s: 100, l: 90 }
        },
        {
            value: '#FFEFD5',
            key: 'papayawhip',
            rgb: { r: 255, g: 239, b: 213 },
            hsl: { h: 37, s: 100, l: 92 }
        },
        {
            value: '#FFE4B5',
            key: 'moccasin',
            rgb: { r: 255, g: 228, b: 181 },
            hsl: { h: 38, s: 100, l: 85 }
        },
        {
            value: '#FFA500',
            key: 'orange',
            rgb: { r: 255, g: 165, b: 0 },
            hsl: { h: 39, s: 100, l: 50 }
        },
        {
            value: '#F5DEB3',
            key: 'wheat',
            rgb: { r: 245, g: 222, b: 179 },
            hsl: { h: 39, s: 77, l: 83 }
        },
        {
            value: '#FDF5E6',
            key: 'oldlace',
            rgb: { r: 253, g: 245, b: 230 },
            hsl: { h: 39, s: 85, l: 95 }
        },
        {
            value: '#FFFAF0',
            key: 'floralwhite',
            rgb: { r: 255, g: 250, b: 240 },
            hsl: { h: 40, s: 100, l: 97 }
        },
        {
            value: '#B8860B',
            key: 'darkgoldenrod',
            rgb: { r: 184, g: 134, b: 11 },
            hsl: { h: 43, s: 89, l: 38 }
        },
        {
            value: '#DAA520',
            key: 'goldenrod',
            rgb: { r: 218, g: 165, b: 32 },
            hsl: { h: 43, s: 74, l: 49 }
        },
        {
            value: '#FFF8DC',
            key: 'cornsilk',
            rgb: { r: 255, g: 248, b: 220 },
            hsl: { h: 48, s: 100, l: 93 }
        },
        {
            value: '#FFD700',
            key: 'gold',
            rgb: { r: 255, g: 215, b: 0 },
            hsl: { h: 51, s: 100, l: 50 }
        },
        {
            value: '#FFFACD',
            key: 'lemonchiffon',
            rgb: { r: 255, g: 250, b: 205 },
            hsl: { h: 54, s: 100, l: 90 }
        },
        {
            value: '#F0E68C',
            key: 'khaki',
            rgb: { r: 240, g: 230, b: 140 },
            hsl: { h: 54, s: 77, l: 75 }
        },
        {
            value: '#EEE8AA',
            key: 'palegoldenrod',
            rgb: { r: 238, g: 232, b: 170 },
            hsl: { h: 55, s: 67, l: 80 }
        },
        {
            value: '#BDB76B',
            key: 'darkkhaki',
            rgb: { r: 189, g: 183, b: 107 },
            hsl: { h: 56, s: 38, l: 58 }
        },
        {
            value: '#F5F5DC',
            key: 'beige',
            rgb: { r: 245, g: 245, b: 220 },
            hsl: { h: 60, s: 56, l: 91 }
        },
        {
            value: '#FAFAD2',
            key: 'lightgoldenrodyellow',
            rgb: { r: 250, g: 250, b: 210 },
            hsl: { h: 60, s: 80, l: 90 }
        },
        {
            value: '#808000',
            key: 'olive',
            rgb: { r: 128, g: 128, b: 0 },
            hsl: { h: 60, s: 100, l: 25 }
        },
        {
            value: '#FFFF00',
            key: 'yellow',
            rgb: { r: 255, g: 255, b: 0 },
            hsl: { h: 60, s: 100, l: 50 }
        },
        {
            value: '#FFFFE0',
            key: 'lightyellow',
            rgb: { r: 255, g: 255, b: 224 },
            hsl: { h: 60, s: 100, l: 94 }
        },
        {
            value: '#FFFFF0',
            key: 'ivory',
            rgb: { r: 255, g: 255, b: 240 },
            hsl: { h: 60, s: 100, l: 97 }
        },
        {
            value: '#6B8E23',
            key: 'olivedrab',
            rgb: { r: 107, g: 142, b: 35 },
            hsl: { h: 80, s: 60, l: 35 }
        },
        {
            value: '#9ACD32',
            key: 'yellowgreen',
            rgb: { r: 154, g: 205, b: 50 },
            hsl: { h: 80, s: 61, l: 50 }
        },
        {
            value: '#556B2F',
            key: 'darkolivegreen',
            rgb: { r: 85, g: 107, b: 47 },
            hsl: { h: 82, s: 39, l: 30 }
        },
        {
            value: '#ADFF2F',
            key: 'greenyellow',
            rgb: { r: 173, g: 255, b: 47 },
            hsl: { h: 84, s: 100, l: 59 }
        },
        {
            value: '#7FFF00',
            key: 'chartreuse',
            rgb: { r: 127, g: 255, b: 0 },
            hsl: { h: 90, s: 100, l: 50 }
        },
        {
            value: '#7CFC00',
            key: 'lawngreen',
            rgb: { r: 124, g: 252, b: 0 },
            hsl: { h: 90, s: 100, l: 49 }
        },
        {
            value: '#8FBC8F',
            key: 'darkseagreen',
            rgb: { r: 143, g: 188, b: 143 },
            hsl: { h: 120, s: 25, l: 65 }
        },
        {
            value: '#228B22',
            key: 'forestgreen',
            rgb: { r: 34, g: 139, b: 34 },
            hsl: { h: 120, s: 61, l: 34 }
        },
        {
            value: '#32CD32',
            key: 'limegreen',
            rgb: { r: 50, g: 205, b: 50 },
            hsl: { h: 120, s: 61, l: 50 }
        },
        {
            value: '#90EE90',
            key: 'lightgreen',
            rgb: { r: 144, g: 238, b: 144 },
            hsl: { h: 120, s: 73, l: 75 }
        },
        {
            value: '#98FB98',
            key: 'palegreen',
            rgb: { r: 152, g: 251, b: 152 },
            hsl: { h: 120, s: 93, l: 79 }
        },
        {
            value: '#006400',
            key: 'darkgreen',
            rgb: { r: 0, g: 100, b: 0 },
            hsl: { h: 120, s: 100, l: 20 }
        },
        {
            value: '#008000',
            key: 'green',
            rgb: { r: 0, g: 128, b: 0 },
            hsl: { h: 120, s: 100, l: 25 }
        },
        {
            value: '#00FF00',
            key: 'lime',
            rgb: { r: 0, g: 255, b: 0 },
            hsl: { h: 120, s: 100, l: 50 }
        },
        {
            value: '#F0FFF0',
            key: 'honeydew',
            rgb: { r: 240, g: 255, b: 240 },
            hsl: { h: 120, s: 100, l: 97 }
        },
        {
            value: '#2E8B57',
            key: 'seagreen',
            rgb: { r: 46, g: 139, b: 87 },
            hsl: { h: 146, s: 50, l: 36 }
        },
        {
            value: '#3CB371',
            key: 'mediumseagreen',
            rgb: { r: 60, g: 179, b: 113 },
            hsl: { h: 147, s: 50, l: 47 }
        },
        {
            value: '#00FF7F',
            key: 'springgreen',
            rgb: { r: 0, g: 255, b: 127 },
            hsl: { h: 150, s: 100, l: 50 }
        },
        {
            value: '#F5FFFA',
            key: 'mintcream',
            rgb: { r: 245, g: 255, b: 250 },
            hsl: { h: 150, s: 100, l: 98 }
        },
        {
            value: '#00FA9A',
            key: 'mediumspringgreen',
            rgb: { r: 0, g: 250, b: 154 },
            hsl: { h: 157, s: 100, l: 49 }
        },
        {
            value: '#66CDAA',
            key: 'mediumaquamarine',
            rgb: { r: 102, g: 205, b: 170 },
            hsl: { h: 160, s: 51, l: 60 }
        },
        {
            value: '#7FFFD4',
            key: 'aquamarine',
            rgb: { r: 127, g: 255, b: 212 },
            hsl: { h: 160, s: 100, l: 75 }
        },
        {
            value: '#40E0D0',
            key: 'turquoise',
            rgb: { r: 64, g: 224, b: 208 },
            hsl: { h: 174, s: 72, l: 56 }
        },
        {
            value: '#20B2AA',
            key: 'lightseagreen',
            rgb: { r: 32, g: 178, b: 170 },
            hsl: { h: 177, s: 70, l: 41 }
        },
        {
            value: '#48D1CC',
            key: 'mediumturquoise',
            rgb: { r: 72, g: 209, b: 204 },
            hsl: { h: 178, s: 60, l: 55 }
        },
        {
            value: '#2F4F4F',
            key: 'darkslategray',
            rgb: { r: 47, g: 79, b: 79 },
            hsl: { h: 180, s: 25, l: 25 }
        },
        {
            value: '#2F4F4F',
            key: 'darkslategrey',
            rgb: { r: 47, g: 79, b: 79 },
            hsl: { h: 180, s: 25, l: 25 }
        },
        {
            value: '#AFEEEE',
            key: 'paleturquoise',
            rgb: { r: 175, g: 238, b: 238 },
            hsl: { h: 180, s: 65, l: 81 }
        },
        {
            value: '#008080',
            key: 'teal',
            rgb: { r: 0, g: 128, b: 128 },
            hsl: { h: 180, s: 100, l: 25 }
        },
        {
            value: '#008B8B',
            key: 'darkcyan',
            rgb: { r: 0, g: 139, b: 139 },
            hsl: { h: 180, s: 100, l: 27 }
        },
        {
            value: '#00FFFF',
            key: 'aqua',
            rgb: { r: 0, g: 255, b: 255 },
            hsl: { h: 180, s: 100, l: 50 }
        },
        {
            value: '#00FFFF',
            key: 'cyan',
            rgb: { r: 0, g: 255, b: 255 },
            hsl: { h: 180, s: 100, l: 50 }
        },
        {
            value: '#E0FFFF',
            key: 'lightcyan',
            rgb: { r: 224, g: 255, b: 255 },
            hsl: { h: 180, s: 100, l: 94 }
        },
        {
            value: '#F0FFFF',
            key: 'azure',
            rgb: { r: 240, g: 255, b: 255 },
            hsl: { h: 180, s: 100, l: 97 }
        },
        {
            value: '#00CED1',
            key: 'darkturquoise',
            rgb: { r: 0, g: 206, b: 209 },
            hsl: { h: 181, s: 100, l: 41 }
        },
        {
            value: '#5F9EA0',
            key: 'cadetblue',
            rgb: { r: 95, g: 158, b: 160 },
            hsl: { h: 182, s: 25, l: 50 }
        },
        {
            value: '#B0E0E6',
            key: 'powderblue',
            rgb: { r: 176, g: 224, b: 230 },
            hsl: { h: 187, s: 52, l: 80 }
        },
        {
            value: '#ADD8E6',
            key: 'lightblue',
            rgb: { r: 173, g: 216, b: 230 },
            hsl: { h: 195, s: 53, l: 79 }
        },
        {
            value: '#00BFFF',
            key: 'deepskyblue',
            rgb: { r: 0, g: 191, b: 255 },
            hsl: { h: 195, s: 100, l: 50 }
        },
        {
            value: '#87CEEB',
            key: 'skyblue',
            rgb: { r: 135, g: 206, b: 235 },
            hsl: { h: 197, s: 71, l: 73 }
        },
        {
            value: '#87CEFA',
            key: 'lightskyblue',
            rgb: { r: 135, g: 206, b: 250 },
            hsl: { h: 203, s: 92, l: 75 }
        },
        {
            value: '#4682B4',
            key: 'steelblue',
            rgb: { r: 70, g: 130, b: 180 },
            hsl: { h: 207, s: 44, l: 49 }
        },
        {
            value: '#F0F8FF',
            key: 'aliceblue',
            rgb: { r: 240, g: 248, b: 255 },
            hsl: { h: 208, s: 100, l: 97 }
        },
        {
            value: '#1E90FF',
            key: 'dodgerblue',
            rgb: { r: 30, g: 144, b: 255 },
            hsl: { h: 210, s: 100, l: 56 }
        },
        {
            value: '#708090',
            key: 'slategray',
            rgb: { r: 112, g: 128, b: 144 },
            hsl: { h: 210, s: 13, l: 50 }
        },
        {
            value: '#708090',
            key: 'slategrey',
            rgb: { r: 112, g: 128, b: 144 },
            hsl: { h: 210, s: 13, l: 50 }
        },
        {
            value: '#778899',
            key: 'lightslategray',
            rgb: { r: 119, g: 136, b: 153 },
            hsl: { h: 210, s: 14, l: 53 }
        },
        {
            value: '#778899',
            key: 'lightslategrey',
            rgb: { r: 119, g: 136, b: 153 },
            hsl: { h: 210, s: 14, l: 53 }
        },
        {
            value: '#B0C4DE',
            key: 'lightsteelblue',
            rgb: { r: 176, g: 196, b: 222 },
            hsl: { h: 214, s: 41, l: 78 }
        },
        {
            value: '#6495ED',
            key: 'cornflower',
            rgb: { r: 100, g: 149, b: 237 },
            hsl: { h: 219, s: 79, l: 66 }
        },
        {
            value: '#4169E1',
            key: 'royalblue',
            rgb: { r: 65, g: 105, b: 225 },
            hsl: { h: 225, s: 73, l: 57 }
        },
        {
            value: '#191970',
            key: 'midnightblue',
            rgb: { r: 25, g: 25, b: 112 },
            hsl: { h: 240, s: 64, l: 27 }
        },
        {
            value: '#E6E6FA',
            key: 'lavender',
            rgb: { r: 230, g: 230, b: 250 },
            hsl: { h: 240, s: 67, l: 94 }
        },
        {
            value: '#000080',
            key: 'navy',
            rgb: { r: 0, g: 0, b: 128 },
            hsl: { h: 240, s: 100, l: 25 }
        },
        {
            value: '#00008B',
            key: 'darkblue',
            rgb: { r: 0, g: 0, b: 139 },
            hsl: { h: 240, s: 100, l: 27 }
        },
        {
            value: '#0000CD',
            key: 'mediumblue',
            rgb: { r: 0, g: 0, b: 205 },
            hsl: { h: 240, s: 100, l: 40 }
        },
        {
            value: '#0000FF',
            key: 'blue',
            rgb: { r: 0, g: 0, b: 255 },
            hsl: { h: 240, s: 100, l: 50 }
        },
        {
            value: '#F8F8FF',
            key: 'ghostwhite',
            rgb: { r: 248, g: 248, b: 255 },
            hsl: { h: 240, s: 100, l: 99 }
        },
        {
            value: '#6A5ACD',
            key: 'slateblue',
            rgb: { r: 106, g: 90, b: 205 },
            hsl: { h: 248, s: 53, l: 58 }
        },
        {
            value: '#483D8B',
            key: 'darkslateblue',
            rgb: { r: 72, g: 61, b: 139 },
            hsl: { h: 248, s: 39, l: 39 }
        },
        {
            value: '#7B68EE',
            key: 'mediumslateblue',
            rgb: { r: 123, g: 104, b: 238 },
            hsl: { h: 249, s: 80, l: 67 }
        },
        {
            value: '#9370DB',
            key: 'mediumpurple',
            rgb: { r: 147, g: 112, b: 219 },
            hsl: { h: 260, s: 60, l: 65 }
        },
        {
            value: '#8A2BE2',
            key: 'blueviolet',
            rgb: { r: 138, g: 43, b: 226 },
            hsl: { h: 271, s: 76, l: 53 }
        },
        {
            value: '#4B0082',
            key: 'indigo',
            rgb: { r: 75, g: 0, b: 130 },
            hsl: { h: 275, s: 100, l: 25 }
        },
        {
            value: '#9932CC',
            key: 'darkorchid',
            rgb: { r: 153, g: 50, b: 204 },
            hsl: { h: 280, s: 61, l: 50 }
        },
        {
            value: '#9400D3',
            key: 'darkviolet',
            rgb: { r: 148, g: 0, b: 211 },
            hsl: { h: 282, s: 100, l: 41 }
        },
        {
            value: '#BA55D3',
            key: 'mediumorchid',
            rgb: { r: 186, g: 85, b: 211 },
            hsl: { h: 288, s: 59, l: 58 }
        },
        {
            value: '#D8BFD8',
            key: 'thistle',
            rgb: { r: 216, g: 191, b: 216 },
            hsl: { h: 300, s: 24, l: 80 }
        },
        {
            value: '#DDA0DD',
            key: 'plum',
            rgb: { r: 221, g: 160, b: 221 },
            hsl: { h: 300, s: 47, l: 75 }
        },
        {
            value: '#EE82EE',
            key: 'violet',
            rgb: { r: 238, g: 130, b: 238 },
            hsl: { h: 300, s: 76, l: 72 }
        },
        {
            value: '#800080',
            key: 'purple',
            rgb: { r: 128, g: 0, b: 128 },
            hsl: { h: 300, s: 100, l: 25 }
        },
        {
            value: '#8B008B',
            key: 'darkmagenta',
            rgb: { r: 139, g: 0, b: 139 },
            hsl: { h: 300, s: 100, l: 27 }
        },
        {
            value: '#FF00FF',
            key: 'fuchsia',
            rgb: { r: 255, g: 0, b: 255 },
            hsl: { h: 300, s: 100, l: 50 }
        },
        {
            value: '#FF00FF',
            key: 'magenta',
            rgb: { r: 255, g: 0, b: 255 },
            hsl: { h: 300, s: 100, l: 50 }
        },
        {
            value: '#DA70D6',
            key: 'orchid',
            rgb: { r: 218, g: 112, b: 214 },
            hsl: { h: 302, s: 59, l: 65 }
        },
        {
            value: '#C71585',
            key: 'mediumvioletred',
            rgb: { r: 199, g: 21, b: 133 },
            hsl: { h: 322, s: 81, l: 43 }
        },
        {
            value: '#FF1493',
            key: 'deeppink',
            rgb: { r: 255, g: 20, b: 147 },
            hsl: { h: 328, s: 100, l: 54 }
        },
        {
            value: '#FF69B4',
            key: 'hotpink',
            rgb: { r: 255, g: 105, b: 180 },
            hsl: { h: 330, s: 100, l: 71 }
        },
        {
            value: '#FFF0F5',
            key: 'lavenderblush',
            rgb: { r: 255, g: 240, b: 245 },
            hsl: { h: 340, s: 100, l: 97 }
        },
        {
            value: '#DB7093',
            key: 'palevioletred',
            rgb: { r: 219, g: 112, b: 147 },
            hsl: { h: 340, s: 60, l: 65 }
        },
        {
            value: '#DC143C',
            key: 'crimson',
            rgb: { r: 220, g: 20, b: 60 },
            hsl: { h: 348, s: 83, l: 47 }
        },
        {
            value: '#FFC0CB',
            key: 'pink',
            rgb: { r: 255, g: 192, b: 203 },
            hsl: { h: 350, s: 100, l: 88 }
        },
        {
            value: '#FFB6C1',
            key: 'lightpink',
            rgb: { r: 255, g: 182, b: 193 },
            hsl: { h: 351, s: 100, l: 86
            }
        }
    ];
    const CACHE_COLORDATA = {};
    const parseOpacity = (value) => clamp(value) * 255;
    function findColorName(value) {
        value = value.toLowerCase();
        const length = COLOR_CSS3.length;
        let i = 0;
        while (i < length) {
            const color = COLOR_CSS3[i++];
            if (color.key === value) {
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
            const length = COLOR_CSS3.length;
            let i = 0;
            while (i < length) {
                const color = COLOR_CSS3[i++];
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
            const q = result.length;
            if (q === 1) {
                return result[0];
            }
            else if (q > 1) {
                const total = hsl.l + hsl.s;
                let nearest = Number.POSITIVE_INFINITY;
                let index = -1;
                for (i = 0; i < q; ++i) {
                    const { l, s } = result[i].hsl;
                    const offset = Math.abs(total - (l + s));
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
    function parseColor(value, opacity = 1, transparency = false) {
        if (value && (value !== 'transparent' || transparency)) {
            let colorData = CACHE_COLORDATA[value];
            if (colorData) {
                return colorData;
            }
            let key = '';
            let rgba;
            if (value.startsWith('#')) {
                rgba = parseRGBA(value);
            }
            else {
                let match = CSS.RGBA.exec(value);
                if (match) {
                    rgba = {
                        r: parseInt(match[1]),
                        g: parseInt(match[2]),
                        b: parseInt(match[3]),
                        a: match[4] ? parseFloat(match[4]) * 255 : parseOpacity(opacity)
                    };
                }
                else {
                    match = CSS.HSLA.exec(value);
                    if (match) {
                        rgba = convertRGBA({
                            h: parseInt(match[1]),
                            s: parseInt(match[2]),
                            l: parseInt(match[3]),
                            a: clamp(match[4] ? parseFloat(match[4]) : opacity)
                        });
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
                            default: {
                                const color = findColorName(value);
                                if (color) {
                                    rgba = Object.assign(Object.assign({}, color.rgb), { a: parseOpacity(opacity) });
                                    key = value;
                                }
                                break;
                            }
                        }
                    }
                }
            }
            if (rgba) {
                const { r, g, b, a } = rgba;
                if (a > 0 || transparency) {
                    const hexAsString = getHexCode(r, g, b);
                    const alphaAsString = getHexCode(a);
                    const valueAsRGBA = `#${hexAsString + alphaAsString}`;
                    if (CACHE_COLORDATA[valueAsRGBA]) {
                        return CACHE_COLORDATA[valueAsRGBA];
                    }
                    opacity = a / 255;
                    value = `#${hexAsString}`;
                    colorData = {
                        key,
                        value,
                        valueAsRGBA,
                        valueAsARGB: `#${alphaAsString + hexAsString}`,
                        rgba,
                        hsl: convertHSLA(rgba),
                        opacity,
                        transparent: opacity === 0
                    };
                    if (opacity === 1) {
                        CACHE_COLORDATA[value] = colorData;
                    }
                    CACHE_COLORDATA[valueAsRGBA] = colorData;
                    return colorData;
                }
            }
        }
        return undefined;
    }
    function reduceRGBA(value, percent, cacheName) {
        if (cacheName) {
            cacheName += '_' + percent;
            const colorData = CACHE_COLORDATA[cacheName];
            if (colorData) {
                return colorData;
            }
        }
        let { r, g, b } = value;
        if (r === 0 && g === 0 && b === 0) {
            r = 255;
            g = 255;
            b = 255;
            if (percent > 0) {
                percent *= -1;
            }
        }
        const base = percent < 0 ? 0 : 255;
        percent = Math.abs(percent);
        const result = parseColor(formatRGBA({
            r: (r + Math.round((base - r) * percent)) % 255,
            g: (g + Math.round((base - g) * percent)) % 255,
            b: (b + Math.round((base - b) * percent)) % 255,
            a: value.a
        }));
        if (cacheName) {
            CACHE_COLORDATA[cacheName] = result;
        }
        return result;
    }
    function getHexCode(...values) {
        let output = '';
        values.forEach(value => {
            const rgb = Math.max(0, Math.min(value, 255));
            output += isNaN(rgb) ? '00' : STRING_HEX.charAt((rgb - (rgb % 16)) / 16) + STRING_HEX.charAt(rgb % 16);
        });
        return output;
    }
    function convertHex(value) {
        return '#' + getHexCode(value.r, value.g, value.b) + (value.a < 255 ? getHexCode(value.a) : '');
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
        const l = h;
        let s;
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
    function convertRGBA(value) {
        let { h, s, l, a } = value;
        h /= 360;
        s /= 100;
        l /= 100;
        let r;
        let g;
        let b;
        if (s === 0) {
            r = l;
            g = l;
            b = l;
        }
        else {
            const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
            const p = 2 * l - q;
            const hue2rgb = (t) => {
                if (t < 0) {
                    t += 1;
                }
                else if (t > 1) {
                    t -= 1;
                }
                if (t < 1 / 6) {
                    return p + (q - p) * 6 * t;
                }
                else if (t < 1 / 2) {
                    return q;
                }
                else if (t < 2 / 3) {
                    return p + (q - p) * (2 / 3 - t) * 6;
                }
                return p;
            };
            r = hue2rgb(h + 1 / 3);
            g = hue2rgb(h);
            b = hue2rgb(h - 1 / 3);
        }
        r = Math.round(Math.min(r, 1) * 255);
        g = Math.round(Math.min(g, 1) * 255);
        b = Math.round(Math.min(b, 1) * 255);
        a = Math.round(Math.min(a, 1) * 255);
        return { r, g, b, a };
    }
    function formatRGBA(value) {
        return `rgb${value.a < 255 ? 'a' : ''}(${value.r}, ${value.g}, ${value.b}` + (value.a < 255 ? ', ' + (value.a / 255).toPrecision(2) : '') + ')';
    }
    function formatHSLA(value) {
        return `hsl${value.a < 255 ? 'a' : ''}(${value.h}, ${value.s}%, ${value.l}%` + (value.a < 255 ? ', ' + (value.a / 255).toPrecision(2) : '') + ')';
    }

    var color = /*#__PURE__*/Object.freeze({
        __proto__: null,
        findColorName: findColorName,
        findColorShade: findColorShade,
        parseColor: parseColor,
        reduceRGBA: reduceRGBA,
        getHexCode: getHexCode,
        convertHex: convertHex,
        parseRGBA: parseRGBA,
        convertHSLA: convertHSLA,
        convertRGBA: convertRGBA,
        formatRGBA: formatRGBA,
        formatHSLA: formatHSLA
    });

    const STRING_SIZES = `(\\(\\s*(?:orientation:\\s*(?:portrait|landscape)|(?:max|min)-width:\\s*${STRING.LENGTH_PERCENTAGE})\\s*\\))`;
    const REGEX_KEYFRAME = /((?:\d+%\s*,?\s*)+|from|to)\s*{\s*(.+?)\s*}/;
    const REGEX_MEDIARULE = /(?:(not|only)?\s*(?:all|screen)\s+and\s+)?((?:\([^)]+\)(?:\s+and\s+)?)+),?\s*/g;
    const REGEX_MEDIACONDITION = /\(([a-z-]+)\s*(:|<?=?|=?>?)?\s*([\w.%]+)?\)(?:\s+and\s+)?/g;
    const REGEX_SRCSET = /^(.*?)\s+(?:([\d.]+)([xw]))?$/;
    const REGEX_OPERATOR = /\s+([+-]\s+|\s*[*/])\s*/;
    const REGEX_INTEGER = /^\s*-?\d+\s*$/;
    const REGEX_DIVIDER = /\s*\/\s*/;
    const REGEX_SELECTORALL = /^\*(\s+\*){0,2}$/;
    const REGEX_SELECTORTRIM = /^(\*\s+){1,2}/;
    const REGEX_CALC = new RegExp(STRING.CSS_CALC);
    const REGEX_LENGTH = new RegExp(`(${STRING.UNIT_LENGTH}|%)`);
    const REGEX_SOURCESIZES = new RegExp(`\\s*(?:(\\(\\s*)?${STRING_SIZES}|(\\(\\s*))?\\s*(and|or|not)?\\s*(?:${STRING_SIZES}(\\s*\\))?)?\\s*(.+)`);
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
    function calculatePosition(element, value, boundingBox) {
        const alignment = [];
        replaceMap(splitEnclosing(value.trim(), 'calc'), (seg) => seg.trim()).forEach(seg => {
            if (seg.includes(' ') && !isCalc(seg)) {
                alignment.push(...seg.split(CHAR.SPACE));
            }
            else {
                alignment.push(seg);
            }
        });
        const length = alignment.length;
        switch (length) {
            case 1:
            case 2:
                return calculateVarAsString(element, alignment.join(' '), { dimension: ['width', 'height'], boundingBox, parent: false });
            case 3:
            case 4: {
                let horizontal = 0;
                let vertical = 0;
                for (let i = 0; i < length; ++i) {
                    const position = alignment[i];
                    switch (position) {
                        case 'top':
                        case 'bottom':
                            if (++vertical === 2) {
                                return '';
                            }
                            break;
                        case 'center':
                            if (length === 4) {
                                return '';
                            }
                            break;
                        case 'left':
                        case 'right':
                            if (++horizontal === 2) {
                                return '';
                            }
                            break;
                        default: {
                            let dimension;
                            switch (alignment[i - 1]) {
                                case 'top':
                                case 'bottom':
                                    dimension = 'height';
                                    break;
                                case 'left':
                                case 'right':
                                    dimension = 'width';
                                    break;
                                default:
                                    return '';
                            }
                            if (isCalc(position)) {
                                const result = formatVar(calculateVar(element, position, { dimension, boundingBox }));
                                if (result !== '') {
                                    alignment[i] = result;
                                }
                                else {
                                    return '';
                                }
                            }
                            break;
                        }
                    }
                }
                return alignment.join(' ');
            }
        }
        return '';
    }
    function calculateColor(element, value) {
        const color = splitEnclosing(value);
        const length = color.length;
        if (length > 1) {
            for (let i = 1; i < length; ++i) {
                const seg = color[i].trim();
                if (hasCalc(seg)) {
                    const name = color[i - 1].trim();
                    if (isColor(name)) {
                        const component = trimEnclosing(seg).split(XML.SEPARATOR);
                        const q = component.length;
                        if (q >= 3) {
                            const hsl = name.startsWith('hsl');
                            for (let j = 0; j < q; ++j) {
                                const rgb = component[j];
                                if (isCalc(rgb)) {
                                    if (hsl && (j === 1 || j === 2)) {
                                        const result = calculateVar(element, rgb, { unitType: 4 /* PERCENT */, supportPercent: true });
                                        if (!isNaN(result)) {
                                            component[j] = clamp(result, 0, 100) + '%';
                                        }
                                        else {
                                            return '';
                                        }
                                    }
                                    else if (j === 3) {
                                        const percent = rgb.includes('%');
                                        let result = calculateVar(element, rgb, percent ? { unitType: 4 /* PERCENT */ } : { unitType: 64 /* DECIMAL */ });
                                        if (!isNaN(result)) {
                                            if (percent) {
                                                result /= 100;
                                            }
                                            component[j] = clamp(result).toString();
                                        }
                                        else {
                                            return '';
                                        }
                                    }
                                    else {
                                        const result = calculateVar(element, rgb, { unitType: 64 /* DECIMAL */, supportPercent: false });
                                        if (!isNaN(result)) {
                                            component[j] = clamp(result, 0, 255).toString();
                                        }
                                        else {
                                            return '';
                                        }
                                    }
                                }
                            }
                            color[i] = `(${component.join(', ')})`;
                            continue;
                        }
                    }
                    return '';
                }
            }
            return color.join('');
        }
        return value;
    }
    function calculateGeneric(element, value, unitType, min, boundingBox, dimension = 'width') {
        const segments = splitEnclosing(value, 'calc');
        const length = segments.length;
        for (let i = 0; i < length; ++i) {
            const seg = segments[i];
            if (isCalc(seg)) {
                const px = REGEX_LENGTH.test(seg);
                const result = calculateVar(element, seg, px ? { dimension, boundingBox, min: 0, parent: false } : { unitType, min, supportPercent: false });
                if (!isNaN(result)) {
                    segments[i] = result + (px ? 'px' : '');
                }
                else {
                    return '';
                }
            }
        }
        return segments.join('').trim();
    }
    function getWritingMode(value) {
        switch (value) {
            case 'vertical-lr':
                return 1;
            case 'vertical-rl':
                return 2;
        }
        return 0;
    }
    function hasBorderStyle(value) {
        switch (value) {
            case 'none':
            case 'initial':
            case 'hidden':
                return false;
        }
        return true;
    }
    function getContentBoxWidth(style) {
        return ((hasBorderStyle(style.getPropertyValue('border-left-style')) ? parseFloat(style.getPropertyValue('border-left-width')) : 0) +
            parseFloat(style.getPropertyValue('padding-left')) +
            parseFloat(style.getPropertyValue('padding-right')) +
            (hasBorderStyle(style.getPropertyValue('border-right-style')) ? parseFloat(style.getPropertyValue('border-right-width')) : 0));
    }
    function getContentBoxHeight(style) {
        return ((hasBorderStyle(style.getPropertyValue('border-top-style')) ? parseFloat(style.getPropertyValue('border-top-width')) : 0) +
            parseFloat(style.getPropertyValue('padding-top')) +
            parseFloat(style.getPropertyValue('padding-bottom')) +
            (hasBorderStyle(style.getPropertyValue('border-bottom-style')) ? parseFloat(style.getPropertyValue('border-bottom-width')) : 0));
    }
    function isAbsolutePosition(value) {
        switch (value) {
            case 'absolute':
            case 'fixed':
                return true;
        }
        return false;
    }
    function newBoxRectPosition(orientation = ['left', 'top']) {
        return {
            static: true,
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            topAsPercent: 0,
            leftAsPercent: 0,
            rightAsPercent: 0,
            bottomAsPercent: 0,
            horizontal: 'left',
            vertical: 'top',
            orientation
        };
    }
    const getInnerWidth = (dimension) => (dimension === null || dimension === void 0 ? void 0 : dimension.width) || window.innerWidth;
    const getInnerHeight = (dimension) => (dimension === null || dimension === void 0 ? void 0 : dimension.height) || window.innerHeight;
    const convertLength = (value, dimension, fontSize, screenDimension) => isPercent(value) ? Math.round(convertFloat(value) / 100 * dimension) : parseUnit(value, fontSize, screenDimension);
    const convertPercent = (value, dimension, fontSize, screenDimension) => isPercent(value) ? parseFloat(value) / 100 : parseUnit(value, fontSize, screenDimension) / dimension;
    const isColor = (value) => /(rgb|hsl)a?/.test(value);
    const formatVar = (value) => !isNaN(value) ? value + 'px' : '';
    const formatDecimal = (value) => !isNaN(value) ? value.toString() : '';
    const trimEnclosing = (value) => value.substring(1, value.length - 1);
    const trimSelector = (value) => REGEX_SELECTORALL.test(value) ? '*' : value.replace(REGEX_SELECTORTRIM, '');
    const BOX_POSITION = ['top', 'right', 'bottom', 'left'];
    const BOX_MARGIN = ['marginTop', 'marginRight', 'marginBottom', 'marginLeft'];
    const BOX_BORDER = [
        ['borderTopStyle', 'borderTopWidth', 'borderTopColor'],
        ['borderRightStyle', 'borderRightWidth', 'borderRightColor'],
        ['borderBottomStyle', 'borderBottomWidth', 'borderBottomColor'],
        ['borderLeftStyle', 'borderLeftWidth', 'borderLeftColor'],
        ['outlineStyle', 'outlineWidth', 'outlineColor']
    ];
    const BOX_PADDING = ['paddingTop', 'paddingRight', 'paddingBottom', 'paddingLeft'];
    const TEXT_STYLE = ['fontFamily', 'fontSize', 'fontWeight', 'fontStyle', 'color', 'whiteSpace', 'textDecoration', 'textTransform', 'letterSpacing', 'wordSpacing'];
    function getStyle(element, pseudoElt = '') {
        if (element) {
            const cached = element['__style' + pseudoElt];
            if (cached) {
                return cached;
            }
            if (hasComputedStyle(element)) {
                const style = getComputedStyle(element, pseudoElt);
                element['__style' + pseudoElt] = style;
                return style;
            }
            return { position: 'static', display: 'inline' };
        }
        return { position: 'static', display: 'none' };
    }
    function getFontSize(element) {
        if (element.nodeName.charAt(0) === '#') {
            element = element.parentElement || document.body;
        }
        return parseFloat(getStyle(element).getPropertyValue('font-size'));
    }
    function hasComputedStyle(element) {
        return element.nodeName.charAt(0) !== '#' && (element instanceof HTMLElement || element instanceof SVGElement);
    }
    function parseSelectorText(value, document) {
        value = document ? value.trim() : trimSelector(value.trim());
        if (value.includes(',')) {
            let normalized = value;
            let found = false;
            let match;
            while ((match = CSS.SELECTOR_ATTR.exec(normalized)) !== null) {
                const index = match.index;
                const length = match[0].length;
                normalized = (index > 0 ? normalized.substring(0, index) : '') + '_'.repeat(length) + normalized.substring(index + length);
                found = true;
            }
            if (found) {
                const result = [];
                let position = 0;
                while (true) {
                    const index = normalized.indexOf(',', position);
                    if (index !== -1) {
                        const segment = value.substring(position, index).trim();
                        result.push(position === 0 ? segment : trimSelector(segment));
                        position = index + 1;
                    }
                    else {
                        if (position > 0) {
                            result.push(trimSelector(value.substring(position).trim()));
                        }
                        break;
                    }
                }
                return result;
            }
            return replaceMap(value.split(XML.SEPARATOR), (selector) => trimSelector(selector));
        }
        return [value];
    }
    function getSpecificity(value) {
        let result = 0;
        CSS.SELECTOR_G.lastIndex = 0;
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
            else if (segment.startsWith('*|*')) {
                if (segment.length > 3) {
                    return 0;
                }
            }
            else if (segment.startsWith('*|')) {
                segment = segment.substring(2);
            }
            else if (segment.startsWith('::')) {
                return 0;
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
                    const attr = subMatch[1];
                    if (attr) {
                        const lastIndex = CSS.SELECTOR_G.lastIndex;
                        result += getSpecificity(attr);
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
                const command = subMatch[0];
                switch (command.charAt(0)) {
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
                segment = spliceString(segment, subMatch.index, command.length);
            }
        }
        return result;
    }
    function checkWritingMode(attr, value) {
        switch (attr) {
            case 'inlineSize':
                return getWritingMode(value) === 0 ? 'width' : 'height';
            case 'blockSize':
                return getWritingMode(value) === 0 ? 'height' : 'width';
            case 'maxInlineSize':
                return getWritingMode(value) === 0 ? 'maxWidth' : 'maxHeight';
            case 'maxBlockSize':
                return getWritingMode(value) === 0 ? 'maxHeight' : 'maxWidth';
            case 'minInlineSize':
                return getWritingMode(value) === 0 ? 'minWidth' : 'minHeight';
            case 'minBlockSize':
                return getWritingMode(value) === 0 ? 'minHeight' : 'minWidth';
            case 'borderInlineStart':
                return getWritingMode(value) === 0 ? 'borderLeft' : 'borderTop';
            case 'borderInlineEnd':
                return getWritingMode(value) === 0 ? 'borderRight' : 'borderBottom';
            case 'borderInlineStartWidth':
                return getWritingMode(value) === 0 ? 'borderLeftWidth' : 'borderTopWidth';
            case 'borderInlineEndWidth':
                return getWritingMode(value) === 0 ? 'borderRightWidth' : 'borderBottomWidth';
            case 'insetInlineStart':
                return getWritingMode(value) === 0 ? 'left' : 'top';
            case 'insetInlineEnd':
                return getWritingMode(value) === 0 ? 'right' : 'bottom';
            case 'marginInlineStart':
                return getWritingMode(value) === 0 ? 'marginLeft' : 'marginTop';
            case 'marginInlineEnd':
                return getWritingMode(value) === 0 ? 'marginRight' : 'marginBottom';
            case 'paddingInlineStart':
                return getWritingMode(value) === 0 ? 'paddingLeft' : 'paddingTop';
            case 'paddingInlineEnd':
                return getWritingMode(value) === 0 ? 'paddingRight' : 'paddingBottom';
            case 'scrollMarginInlineStart':
                return getWritingMode(value) === 0 ? 'scrollMarginLeft' : 'scrollMarginTop';
            case 'scrollMarginInlineEnd':
                return getWritingMode(value) === 0 ? 'scrollMarginRight' : 'scrollMarginBottom';
            case 'scrollPaddingInlineStart':
                return getWritingMode(value) === 0 ? 'scrollPaddingLeft' : 'scrollPaddingTop';
            case 'scrollPaddingInlineEnd':
                return getWritingMode(value) === 0 ? 'scrollPaddingRight' : 'scrollPaddingBottom';
            case 'borderBlockStart':
                switch (getWritingMode(value)) {
                    case 0:
                        return 'borderTop';
                    case 1:
                        return 'borderLeft';
                    case 2:
                        return 'borderRight';
                }
            case 'borderBlockEnd':
                switch (getWritingMode(value)) {
                    case 0:
                        return 'borderBottom';
                    case 1:
                        return 'borderRight';
                    case 2:
                        return 'borderLeft';
                }
            case 'borderBlockStartWidth':
                switch (getWritingMode(value)) {
                    case 0:
                        return 'borderTopWidth';
                    case 1:
                        return 'borderLeftWidth';
                    case 2:
                        return 'borderRightWidth';
                }
            case 'borderBlockEndWidth':
                switch (getWritingMode(value)) {
                    case 0:
                        return 'borderBottomWidth';
                    case 1:
                        return 'borderRightWidth';
                    case 2:
                        return 'borderLeftWidth';
                }
            case 'insetBlockStart':
                switch (getWritingMode(value)) {
                    case 0:
                        return 'top';
                    case 1:
                        return 'left';
                    case 2:
                        return 'right';
                }
            case 'insetBlockEnd':
                switch (getWritingMode(value)) {
                    case 0:
                        return 'bottom';
                    case 1:
                        return 'right';
                    case 2:
                        return 'left';
                }
            case 'marginBlockStart':
                switch (getWritingMode(value)) {
                    case 0:
                        return 'marginTop';
                    case 1:
                        return 'marginLeft';
                    case 2:
                        return 'marginRight';
                }
            case 'marginBlockEnd':
                switch (getWritingMode(value)) {
                    case 0:
                        return 'marginBottom';
                    case 1:
                        return 'marginRight';
                    case 2:
                        return 'marginLeft';
                }
            case 'paddingBlockStart':
                switch (getWritingMode(value)) {
                    case 0:
                        return 'paddingTop';
                    case 1:
                        return 'paddingLeft';
                    case 2:
                        return 'paddingRight';
                }
            case 'paddingBlockEnd':
                switch (getWritingMode(value)) {
                    case 0:
                        return 'paddingBottom';
                    case 1:
                        return 'paddingRight';
                    case 2:
                        return 'paddingLeft';
                }
            case 'scrollMarginBlockStart':
                switch (getWritingMode(value)) {
                    case 0:
                        return 'scrollMarginTop';
                    case 1:
                        return 'scrollMarginLeft';
                    case 2:
                        return 'scrollMarginRight';
                }
            case 'scrollMarginBlockEnd':
                switch (getWritingMode(value)) {
                    case 0:
                        return 'scrollMarginBottom';
                    case 1:
                        return 'scrollMarginRight';
                    case 2:
                        return 'scrollMarginLeft';
                }
            case 'scrollPaddingBlockStart':
                switch (getWritingMode(value)) {
                    case 0:
                        return 'scrollPaddingTop';
                    case 1:
                        return 'scrollPaddingLeft';
                    case 2:
                        return 'scrollPaddingRight';
                }
            case 'scrollPaddingBlockEnd':
                switch (getWritingMode(value)) {
                    case 0:
                        return 'scrollPaddingBottom';
                    case 1:
                        return 'scrollPaddingRight';
                    case 2:
                        return 'scrollPaddingLeft';
                }
        }
        return '';
    }
    function calculateStyle(element, attr, value, boundingBox) {
        switch (attr) {
            case 'left':
            case 'right':
            case 'textIndent':
                return formatVar(calculateVar(element, value, { dimension: 'width', boundingBox }));
            case 'columnWidth':
            case 'marginBottom':
            case 'marginLeft':
            case 'marginRight':
            case 'marginTop':
            case 'maxWidth':
            case 'minWidth':
            case 'paddingBottom':
            case 'paddingLeft':
            case 'paddingRight':
            case 'paddingTop':
            case 'scrollMarginBottom':
            case 'scrollMarginLeft':
            case 'scrollMarginRight':
            case 'scrollMarginTop':
            case 'scrollPaddingBottom':
            case 'scrollPaddingLeft':
            case 'scrollPaddingRight':
            case 'scrollPaddingTop':
            case 'width':
                return formatVar(calculateVar(element, value, { dimension: 'width', boundingBox, min: 0 }));
            case 'columnGap':
            case 'gridColumnGap':
            case 'shapeMargin':
                return formatVar(calculateVar(element, value, { dimension: 'width', boundingBox, min: 0, parent: false }));
            case 'bottom':
            case 'top':
            case 'verticalAlign':
                return formatVar(calculateVar(element, value, { dimension: 'height', boundingBox }));
            case 'height':
            case 'maxHeight':
            case 'minHeight':
                return formatVar(calculateVar(element, value, { dimension: 'height', boundingBox, min: 0 }));
            case 'gridRowGap':
            case 'rowGap':
                return formatVar(calculateVar(element, value, { dimension: 'height', boundingBox, min: 0, parent: false }));
            case 'flexBasis': {
                const parentElement = element.parentElement;
                return formatVar(calculateVar(element, value, { dimension: !!parentElement && getStyle(parentElement).flexDirection.includes('column') ? 'height' : 'width', boundingBox, min: 0 }));
            }
            case 'borderBottomWidth':
            case 'borderLeftWidth':
            case 'borderRightWidth':
            case 'borderTopWidth':
            case 'letterSpacing':
            case 'outlineOffset':
            case 'outlineWidth':
            case 'perspective':
            case 'wordSpacing':
                return formatVar(calculateVar(element, value, { min: 0, supportPercent: false }));
            case 'offsetDistance': {
                let boundingSize = 0;
                if (value.includes('%')) {
                    const offsetPath = getStyle(element).getPropertyValue('offset-path');
                    if (offsetPath !== 'none') {
                        const pathElement = document.createElementNS('http://www.w3.org/2000/svg', 'path');
                        pathElement.setAttribute('d', offsetPath);
                        boundingSize = pathElement.getTotalLength();
                    }
                }
                return formatVar(calculateVar(element, value, { boundingSize }));
            }
            case 'lineHeight':
                return formatVar(calculateVar(element, value, { boundingSize: getFontSize(element), min: 0 }));
            case 'fontSize':
                return formatVar(calculateVar(element, value, { boundingSize: getFontSize(element.parentElement || document.body), min: 0 }));
            case 'margin':
                return calculateVarAsString(element, value, { dimension: 'width', boundingBox });
            case 'borderBottomLeftRadius':
            case 'borderBottomRightRadius':
            case 'borderTopLeftRadius':
            case 'borderTopRightRadius':
            case 'borderRadius':
            case 'padding':
            case 'scrollMargin':
            case 'scrollMarginBlock':
            case 'scrollMarginInline':
            case 'scrollPadding':
            case 'scrollPaddingBlock':
            case 'scrollPaddingInline':
                return calculateVarAsString(element, value, { dimension: 'width', boundingBox, min: 0 });
            case 'objectPosition':
                return calculateVarAsString(element, value, { dimension: ['width', 'height'], boundingBox });
            case 'gridGap':
            case 'perspectiveOrigin':
                return calculateVarAsString(element, value, { dimension: ['width', 'height'], boundingBox, min: attr === 'gridGap' ? 0 : undefined, parent: false });
            case 'borderImageOutset':
            case 'borderImageWidth':
                return calculateVarAsString(element, value, { dimension: ['height', 'width', 'height', 'width'], boundingBox, min: 0, parent: false });
            case 'borderWidth':
            case 'borderSpacing':
            case 'columnRule':
                return calculateVarAsString(element, value, { min: 0, supportPercent: false });
            case 'gridAutoColumns':
            case 'gridTemplateColumns':
                return calculateGeneric(element, value, 32 /* INTEGER */, 1, boundingBox);
            case 'gridAutoRows':
            case 'gridTemplateRows':
                return calculateGeneric(element, value, 32 /* INTEGER */, 1, boundingBox, 'height');
            case 'zIndex':
                return formatDecimal(calculateVar(element, value, { unitType: 32 /* INTEGER */ }));
            case 'tabSize':
                return formatDecimal(calculateVar(element, value, { unitType: 32 /* INTEGER */, min: 0 }));
            case 'columnCount':
            case 'fontWeight':
            case 'widows':
                return formatDecimal(calculateVar(element, value, { unitType: 32 /* INTEGER */, min: 1 }));
            case 'gridRow':
            case 'gridRowEnd':
            case 'gridRowStart':
            case 'gridColumn':
            case 'gridColumnEnd':
            case 'gridColumnStart':
            case 'counterIncrement':
            case 'counterReset':
                return calculateVarAsString(element, value, { unitType: 32 /* INTEGER */ });
            case 'fontVariationSettings':
                return calculateVarAsString(element, value, { unitType: 32 /* INTEGER */, min: 0 });
            case 'gridArea':
                return calculateVarAsString(element, value, { unitType: 32 /* INTEGER */, min: 1 });
            case 'flexGrow':
            case 'flexShrink':
                return formatDecimal(calculateVar(element, value, { unitType: 64 /* DECIMAL */, min: 0 }));
            case 'animationIterationCount':
            case 'fontSizeAdjust':
                return formatDecimal(calculateVar(element, value, { unitType: 64 /* DECIMAL */, min: 0, supportPercent: false }));
            case 'opacity':
            case 'shapeImageThreshold': {
                const percent = value.includes('%');
                const result = calculateVar(element, value, { unitType: percent ? 4 /* PERCENT */ : 64 /* DECIMAL */ });
                return !isNaN(result) ? clamp(result * (percent ? 1 / 100 : 1)).toString() : '';
            }
            case 'fontStretch':
                return calculateVarAsString(element, value, { unitType: 4 /* PERCENT */, min: 0, supportPercent: true });
            case 'fontStyle':
            case 'offsetRotate':
                return calculateVarAsString(element, value, { unitType: 16 /* ANGLE */, supportPercent: false });
            case 'offsetAnchor':
            case 'transformOrigin':
                return calculatePosition(element, value, boundingBox);
            case 'transform': {
                value = value.trim();
                const transform = splitEnclosing(value);
                const length = transform.length;
                if (length > 1) {
                    for (let i = 1; i < length; ++i) {
                        let seg = transform[i];
                        if (hasCalc(seg)) {
                            seg = trimEnclosing(seg);
                            let calc;
                            switch (transform[i - 1].trim()) {
                                case 'matrix':
                                case 'matrix3d':
                                    calc = calculateVarAsString(element, seg, { unitType: 64 /* DECIMAL */, supportPercent: false });
                                    break;
                                case 'scaleX':
                                case 'scaleY':
                                case 'scaleZ': {
                                    const result = calculateVar(element, seg, { unitType: 64 /* DECIMAL */, min: 0, supportPercent: false });
                                    if (!isNaN(result)) {
                                        calc = result.toString();
                                    }
                                    break;
                                }
                                case 'scale':
                                case 'scale3d':
                                    calc = calculateVarAsString(element, seg, { unitType: 64 /* DECIMAL */, min: 0, supportPercent: false });
                                    break;
                                case 'translateX':
                                    calc = formatVar(calculateVar(element, seg, { dimension: 'width', boundingBox, parent: true }));
                                    break;
                                case 'translateY':
                                    calc = formatVar(calculateVar(element, seg, { dimension: 'height', boundingBox, parent: true }));
                                    break;
                                case 'translateZ':
                                case 'perspective':
                                    calc = formatVar(calculateVar(element, seg, { supportPercent: false }));
                                    break;
                                case 'translate':
                                case 'translate3d':
                                    calc = calculateVarAsString(element, seg, { dimension: ['width', 'height'], boundingBox, parent: true });
                                    break;
                                case 'skew':
                                case 'rotate':
                                    calc = calculateVarAsString(element, seg, { unitType: 16 /* ANGLE */, supportPercent: false });
                                    break;
                                case 'skewX':
                                case 'skewY':
                                case 'rotateX':
                                case 'rotateY':
                                case 'rotateZ': {
                                    const result = calculateVar(element, seg, { unitType: 16 /* ANGLE */, supportPercent: false });
                                    if (!isNaN(result)) {
                                        calc = result + 'deg';
                                    }
                                    break;
                                }
                                case 'rotate3d': {
                                    const component = seg.split(XML.SEPARATOR);
                                    const q = component.length;
                                    if (q === 3 || q === 4) {
                                        calc = '';
                                        for (let j = 0; j < q; ++j) {
                                            let rotate = component[j];
                                            if (isCalc(rotate)) {
                                                const result = calculateVar(element, rotate, { unitType: j === 3 ? 16 /* ANGLE */ : 64 /* DECIMAL */, supportPercent: false });
                                                if (!isNaN(result)) {
                                                    rotate = result + (j === 3 ? 'deg' : '');
                                                }
                                                else {
                                                    return '';
                                                }
                                            }
                                            calc += (calc !== '' ? ', ' : '') + rotate;
                                        }
                                    }
                                    break;
                                }
                            }
                            if (calc) {
                                transform[i] = `(${calc})`;
                            }
                            else {
                                return '';
                            }
                        }
                    }
                    return transform.join('');
                }
                return value;
            }
            case 'backgroundImage':
            case 'borderImageSource':
            case 'maskImage': {
                value = value.trim();
                const image = splitEnclosing(value);
                const length = image.length;
                if (length > 1) {
                    for (let i = 1; i < length; ++i) {
                        const color = image[i];
                        if (isColor(color) && hasCalc(color)) {
                            const component = splitEnclosing(trimEnclosing(color));
                            const q = component.length;
                            for (let j = 1; j < q; ++j) {
                                if (hasCalc(component[j])) {
                                    const previous = component[j - 1];
                                    if (isColor(previous)) {
                                        const prefix = previous.split(CHAR.SPACE).pop();
                                        const result = calculateColor(element, prefix + component[j]);
                                        if (result !== '') {
                                            component[j] = result.replace(prefix, '');
                                            continue;
                                        }
                                    }
                                    return '';
                                }
                            }
                            image[i] = `(${component.join('')})`;
                        }
                    }
                    return image.join('');
                }
                return value;
            }
            case 'borderColor':
            case 'scrollbarColor': {
                value = value.trim();
                const color = splitEnclosing(value);
                const length = color.length;
                if (length > 1) {
                    for (let i = 1; i < length; ++i) {
                        const previous = color[i - 1];
                        if (isColor(previous) && hasCalc(color[i])) {
                            const prefix = previous.split(CHAR.SPACE).pop();
                            const result = calculateColor(element, prefix + color[i]);
                            if (result !== '') {
                                color[i] = result;
                                color[i - 1] = previous.substring(0, previous.length - prefix.length);
                            }
                            else {
                                return '';
                            }
                        }
                    }
                    return color.join('');
                }
                return value;
            }
            case 'boxShadow':
            case 'textShadow':
                return calculateVarAsString(element, calculateStyle(element, 'borderColor', value), { supportPercent: false, errorString: /-?[\d.]+[a-z]*\s+-?[\d.]+[a-z]*(\s+-[\d.]+[a-z]*)/ });
            case 'backgroundSize':
            case 'maskPosition':
            case 'maskSize':
                return calculateVarAsString(element, value, { dimension: ['width', 'height'], boundingBox, min: attr !== 'maskPosition' ? 0 : undefined, parent: false, separator: ',' });
            case 'animation':
            case 'animationDelay':
            case 'animationDuration':
            case 'transition':
            case 'transitionDelay':
            case 'transitionDuration':
                return calculateVarAsString(element, value, { unitType: 8 /* TIME */, min: 0, precision: 0, separator: ',' });
            case 'columns':
                return calculateGeneric(element, value, 32 /* INTEGER */, 1, boundingBox);
            case 'borderImageSlice':
            case 'flex':
            case 'font':
                return calculateGeneric(element, value, 64 /* DECIMAL */, 0, boundingBox);
            case 'backgroundPosition': {
                const result = [];
                for (const position of value.split(XML.SEPARATOR)) {
                    const segment = calculatePosition(element, position, boundingBox);
                    if (segment !== '') {
                        result.push(segment);
                    }
                    else {
                        return '';
                    }
                }
                return result.join(', ');
            }
            case 'border':
            case 'borderBottom':
            case 'borderLeft':
            case 'borderRight':
            case 'borderTop':
            case 'outline': {
                value = value.trim();
                const border = splitEnclosing(value);
                const length = border.length;
                if (length > 1) {
                    for (let i = 1; i < length; ++i) {
                        const previous = border[i - 1];
                        const prefix = previous.split(CHAR.SPACE).pop();
                        let result;
                        if (prefix === 'calc') {
                            result = formatVar(calculateVar(element, prefix + border[i], { min: 0, supportPercent: false }));
                        }
                        else if (isColor(prefix)) {
                            result = calculateColor(element, prefix + border[i]);
                        }
                        else {
                            continue;
                        }
                        if (result !== '') {
                            border[i] = result;
                            border[i - 1] = previous.substring(0, previous.length - prefix.length);
                        }
                        else {
                            return '';
                        }
                    }
                    return border.join('');
                }
                return value;
            }
            case 'animationTimingFunction':
            case 'transitionTimingFunction': {
                value = value.trim();
                const timingFunction = splitEnclosing(value);
                const length = timingFunction.length;
                if (length > 1) {
                    for (let i = 1; i < length; ++i) {
                        let seg = timingFunction[i];
                        if (hasCalc(seg)) {
                            const prefix = timingFunction[i - 1].trim();
                            seg = trimEnclosing(seg);
                            let calc;
                            if (prefix.endsWith('cubic-bezier')) {
                                const cubic = seg.split(XML.SEPARATOR);
                                const q = cubic.length;
                                if (q === 4) {
                                    calc = '';
                                    const options = { unitType: 64 /* DECIMAL */, supportPercent: false };
                                    for (let j = 0; j < q; ++j) {
                                        let bezier = cubic[j];
                                        if (isCalc(bezier)) {
                                            if (j % 2 === 0) {
                                                options.min = 0;
                                                options.max = 1;
                                            }
                                            else {
                                                options.min = undefined;
                                                options.max = undefined;
                                            }
                                            const p = calculateVar(element, bezier, options);
                                            if (!isNaN(p)) {
                                                bezier = p.toString();
                                            }
                                            else {
                                                return '';
                                            }
                                        }
                                        calc += (calc !== '' ? ', ' : '') + bezier;
                                    }
                                }
                            }
                            else if (prefix.endsWith('steps')) {
                                calc = calculateVarAsString(element, seg, { unitType: 32 /* INTEGER */, min: 1 });
                            }
                            if (calc) {
                                timingFunction[i] = `(${calc})`;
                            }
                            else {
                                return '';
                            }
                        }
                    }
                    return timingFunction.join('');
                }
                return value;
            }
            case 'clip':
                return isAbsolutePosition(getStyle(element).position) ? calculateVarAsString(element, value, { supportPercent: false }) : '';
            case 'clipPath':
            case 'offsetPath':
            case 'shapeOutside': {
                value = value.trim();
                const path = splitEnclosing(value);
                const length = path.length;
                if (length === 2) {
                    const prefix = path[0].trim();
                    switch (prefix) {
                        case 'url':
                        case 'path':
                            return !hasCalc(path[1]) ? value : '';
                        case 'linear-gradient':
                        case 'repeating-linear-gradient':
                        case 'radial-gradient':
                        case 'repeating-radial-gradient':
                        case 'conic-gradient':
                            return calculateStyle(element, 'backgroundImage', value, boundingBox);
                    }
                    let shape = path[1].trim();
                    shape = trimEnclosing(shape);
                    switch (prefix) {
                        case 'circle':
                        case 'ellipse': {
                            const result = [];
                            let [radius, position] = shape.split(/\s+at\s+/);
                            if (hasCalc(radius)) {
                                const options = { boundingBox, min: 0, parent: true };
                                if (prefix === 'circle') {
                                    if (radius.includes('%')) {
                                        const { width, height } = boundingBox || getParentBoxDimension(element);
                                        if (width > 0 && height > 0) {
                                            options.boundingSize = Math.min(width, height);
                                        }
                                        else {
                                            return '';
                                        }
                                    }
                                }
                                else {
                                    options.dimension = ['width', 'height'];
                                }
                                radius = calculateVarAsString(element, radius, options);
                                if (radius !== '') {
                                    result.push(radius);
                                }
                                else {
                                    return '';
                                }
                            }
                            else if (radius) {
                                result.push(radius);
                            }
                            if (hasCalc(position)) {
                                position = calculateVarAsString(element, position, { dimension: ['width', 'height'], boundingBox, parent: true });
                                if (position !== '') {
                                    result.push(position);
                                }
                                else {
                                    return '';
                                }
                            }
                            else if (position) {
                                result.push(position);
                            }
                            shape = result.join(' at ');
                            break;
                        }
                        case 'inset':
                            shape = calculateVarAsString(element, shape, { dimension: ['height', 'width', 'height', 'width', 'width'], boundingBox, checkUnit: true });
                            break;
                        case 'polygon': {
                            const result = [];
                            for (let points of shape.split(XML.SEPARATOR)) {
                                if (hasCalc(points)) {
                                    points = calculateVarAsString(element, points, { dimension: ['width', 'height'], boundingBox, parent: true });
                                    if (points !== '') {
                                        result.push(points);
                                    }
                                    else {
                                        return '';
                                    }
                                }
                                else {
                                    result.push(points);
                                }
                            }
                            shape = result.join(', ');
                            break;
                        }
                    }
                    if (shape !== '') {
                        return `${prefix}(${shape})`;
                    }
                }
                return value;
            }
            case 'grid': {
                let [row, column] = value.trim().split(REGEX_DIVIDER);
                if (hasCalc(row)) {
                    const result = calculateStyle(element, 'gridTemplateRows', row, boundingBox);
                    if (result !== '') {
                        row = result;
                    }
                    else {
                        return '';
                    }
                }
                if (hasCalc(column)) {
                    const result = calculateStyle(element, 'gridTemplateColumns', column, boundingBox);
                    if (result !== '') {
                        column = result;
                    }
                    else {
                        return '';
                    }
                }
                return row + (column ? ` / ${column}` : '');
            }
            case 'offset': {
                let [offset, anchor] = value.trim().split(REGEX_DIVIDER);
                if (hasCalc(offset)) {
                    const url = splitEnclosing(offset.trim());
                    const length = url.length;
                    if (length >= 2) {
                        offset = url[0] + url[1];
                        if (hasCalc(offset)) {
                            offset = calculateStyle(element, 'offsetPath', offset, boundingBox);
                            if (offset === '') {
                                return '';
                            }
                        }
                        if (length > 2) {
                            let distance = url.slice(2).join('');
                            if (hasCalc(offset)) {
                                distance = calculateStyle(element, REGEX_LENGTH.test(distance) ? 'offsetDistance' : 'offsetRotate', distance, boundingBox);
                                if (distance === '') {
                                    return '';
                                }
                            }
                            offset += ' ' + distance;
                        }
                    }
                    else {
                        return '';
                    }
                }
                if (hasCalc(anchor)) {
                    const result = calculateStyle(element, 'offsetAnchor', anchor, boundingBox);
                    if (result !== '') {
                        anchor = result;
                    }
                    else {
                        return '';
                    }
                }
                return offset + (anchor ? ` / ${anchor}` : '');
            }
            case 'borderImage': {
                const match = /([a-z-]+\(.+?\))\s*([^/]+)(?:\s*\/\s*)?(.+)?/.exec(value.trim());
                if (match) {
                    let slice = match[2].trim();
                    if (hasCalc(slice)) {
                        slice = calculateStyle(element, 'borderImageSlice', slice, boundingBox);
                    }
                    if (slice !== '') {
                        let width;
                        let outset;
                        if (match[3]) {
                            [width, outset] = match[3].trim().split(REGEX_DIVIDER);
                            if (hasCalc(width)) {
                                const result = calculateStyle(element, 'borderImageWidth', width, boundingBox);
                                if (result !== '') {
                                    width = result;
                                }
                                else {
                                    return '';
                                }
                            }
                            if (hasCalc(outset)) {
                                const result = calculateStyle(element, 'borderImageOutset', outset, boundingBox);
                                if (result !== '') {
                                    outset = result;
                                }
                                else {
                                    return '';
                                }
                            }
                        }
                        return match[1] + ' ' + slice + (width ? ` / ${width}` : '') + (outset ? ` / ${outset}` : '');
                    }
                }
                return '';
            }
            case 'background':
            case 'gridTemplate':
                return getStyle(element)[attr];
            default:
                if (attr.endsWith('Color')) {
                    return calculateColor(element, value.trim());
                }
                else {
                    const alias = checkWritingMode(attr, getStyle(element).writingMode);
                    if (alias !== '') {
                        return calculateStyle(element, alias, value, boundingBox);
                    }
                }
        }
        return '';
    }
    function checkStyleValue(element, attr, value, style) {
        if (value === 'inherit') {
            switch (attr) {
                case 'fontSize':
                case 'lineHeight':
                    if (style) {
                        return style[attr];
                    }
                default:
                    return getInheritedStyle(element, attr);
            }
        }
        else if (hasCalc(value)) {
            value = calculateStyle(element, attr, value);
            if (value === '' && style) {
                value = style[attr];
            }
        }
        else if (isCustomProperty(value)) {
            value = parseVar(element, value);
            if (value === '' && style) {
                value = style[attr];
            }
        }
        return value || '';
    }
    function getKeyframesRules() {
        const result = {};
        violation: {
            const styleSheets = document.styleSheets;
            const length = styleSheets.length;
            let i = 0;
            while (i < length) {
                const cssRules = styleSheets[i++].cssRules;
                if (cssRules) {
                    const q = cssRules.length;
                    for (let j = 0; j < q; ++j) {
                        try {
                            const item = cssRules[j];
                            if (item.type === CSSRule.KEYFRAMES_RULE) {
                                const value = parseKeyframes(item.cssRules);
                                if (Object.keys(value).length) {
                                    const name = item.name;
                                    if (result[name]) {
                                        Object.assign(result[name], value);
                                    }
                                    else {
                                        result[name] = value;
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
    function parseKeyframes(rules) {
        const result = {};
        const length = rules.length;
        let i = 0;
        while (i < length) {
            const item = rules[i++];
            const match = REGEX_KEYFRAME.exec(item.cssText);
            if (match) {
                (item['keyText'] || match[1]).trim().split(XML.SEPARATOR).forEach(percent => {
                    switch (percent) {
                        case 'from':
                            percent = '0%';
                            break;
                        case 'to':
                            percent = '100%';
                            break;
                    }
                    const keyframe = {};
                    match[2].split(XML.DELIMITER).forEach(property => {
                        const index = property.indexOf(':');
                        if (index !== -1) {
                            const value = property.substring(index + 1).trim();
                            if (value !== '') {
                                const attr = property.substring(0, index).trim();
                                keyframe[attr] = value;
                            }
                        }
                    });
                    result[percent] = keyframe;
                });
            }
        }
        return result;
    }
    function checkMediaRule(value, fontSize) {
        switch (value) {
            case 'only all':
            case 'only screen':
                return true;
            default: {
                REGEX_MEDIARULE.lastIndex = 0;
                let match;
                while ((match = REGEX_MEDIARULE.exec(value)) !== null) {
                    const negate = match[1] === 'not';
                    let valid = false;
                    REGEX_MEDIACONDITION.lastIndex = 0;
                    let condition;
                    while ((condition = REGEX_MEDIACONDITION.exec(match[2])) !== null) {
                        const attr = condition[1];
                        let operation = condition[2];
                        const rule = condition[3];
                        if (attr.startsWith('min')) {
                            operation = '>=';
                        }
                        else if (attr.startsWith('max')) {
                            operation = '<=';
                        }
                        switch (attr) {
                            case 'aspect-ratio':
                            case 'min-aspect-ratio':
                            case 'max-aspect-ratio':
                                if (rule) {
                                    const [width, height] = replaceMap(rule.split('/'), (ratio) => parseInt(ratio));
                                    valid = compareRange(operation, window.innerWidth / window.innerHeight, width / height);
                                }
                                else {
                                    valid = false;
                                }
                                break;
                            case 'width':
                            case 'min-width':
                            case 'max-width':
                            case 'height':
                            case 'min-height':
                            case 'max-height':
                                valid = compareRange(operation, attr.endsWith('width') ? window.innerWidth : window.innerHeight, parseUnit(rule, fontSize));
                                break;
                            case 'orientation':
                                valid = rule === 'portrait' && window.innerWidth <= window.innerHeight || rule === 'landscape' && window.innerWidth > window.innerHeight;
                                break;
                            case 'resolution':
                            case 'min-resolution':
                            case 'max-resolution':
                                if (rule) {
                                    let resolution = parseFloat(rule);
                                    if (rule.endsWith('dpcm')) {
                                        resolution *= 2.54;
                                    }
                                    else if (rule.endsWith('dppx')) {
                                        resolution *= 96;
                                    }
                                    valid = compareRange(operation, getDeviceDPI(), resolution);
                                }
                                else {
                                    valid = false;
                                }
                                break;
                            case 'grid':
                                valid = rule === '0';
                                break;
                            case 'color':
                                valid = rule === undefined || parseInt(rule) > 0;
                                break;
                            case 'min-color':
                                valid = parseInt(rule) <= screen.colorDepth / 3;
                                break;
                            case 'max-color':
                                valid = parseInt(rule) >= screen.colorDepth / 3;
                                break;
                            case 'color-index':
                            case 'min-color-index':
                            case 'monochrome':
                            case 'min-monochrome':
                                valid = rule === '0';
                                break;
                            case 'max-color-index':
                            case 'max-monochrome':
                                valid = parseInt(rule) >= 0;
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
        if (element.nodeName.charAt(0) !== '#' && styles.includes(getStyle(element)[attr])) {
            return true;
        }
        else {
            const parentElement = element.parentElement;
            if (parentElement) {
                return styles.includes(getStyle(parentElement)[attr]);
            }
        }
        return false;
    }
    function getInheritedStyle(element, attr, exclude, ...tagNames) {
        let value = '';
        let current = element.parentElement;
        while (current && !tagNames.includes(current.tagName)) {
            value = getStyle(current)[attr];
            if (value === 'inherit' || (exclude === null || exclude === void 0 ? void 0 : exclude.test(value))) {
                value = '';
            }
            else if (value) {
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
            let customValue = style.getPropertyValue(match[1]).trim();
            const fallback = match[2];
            if (fallback && (customValue === '' || isLength(fallback, true) && !isLength(customValue, true) || isNumber(fallback) && !isNumber(customValue) || parseColor(fallback) && !parseColor(customValue))) {
                customValue = fallback;
            }
            if (customValue) {
                value = value.replace(match[0], customValue).trim();
            }
            else {
                return '';
            }
        }
        return value;
    }
    function calculateVarAsString(element, value, options) {
        value = value.trim();
        const optionsVar = Object.assign({}, options);
        let orderedSize;
        let dimension;
        let separator;
        let unitType;
        let checkUnit;
        let errorString;
        if (options) {
            if (Array.isArray(options.orderedSize)) {
                orderedSize = options.orderedSize;
            }
            if (Array.isArray(options.dimension)) {
                dimension = options.dimension;
            }
            ({ separator, unitType, checkUnit, errorString } = options);
        }
        let unit;
        switch (unitType) {
            case 32 /* INTEGER */:
            case 64 /* DECIMAL */:
                unit = '';
                break;
            case 4 /* PERCENT */:
                unit = '%';
                break;
            case 8 /* TIME */:
                unit = 'ms';
                break;
            case 16 /* ANGLE */:
                unit = 'deg';
                break;
            default:
                unit = 'px';
                unitType = 2 /* LENGTH */;
                break;
        }
        const result = [];
        for (let seg of (separator ? value.split(separator) : [value])) {
            seg = seg.trim();
            if (seg !== '') {
                const calc = splitEnclosing(seg, 'calc');
                const length = calc.length;
                if (length) {
                    let partial = '';
                    let i = 0, j = 0;
                    while (i < length) {
                        let output = calc[i++];
                        if (isCalc(output)) {
                            if ((orderedSize === null || orderedSize === void 0 ? void 0 : orderedSize[j]) !== undefined) {
                                optionsVar.boundingSize = orderedSize[j++];
                            }
                            else if (dimension) {
                                optionsVar.dimension = dimension[j++];
                                optionsVar.boundingSize = undefined;
                            }
                            else if (orderedSize) {
                                optionsVar.boundingSize = undefined;
                            }
                            const k = calculateVar(element, output, optionsVar);
                            if (!isNaN(k)) {
                                partial += k + unit;
                            }
                            else {
                                return '';
                            }
                        }
                        else {
                            partial += output;
                            if (dimension) {
                                output = output.trim();
                                if (output !== '' && (!checkUnit || unitType === 2 /* LENGTH */ && (isLength(output, true) || output === 'auto'))) {
                                    ++j;
                                }
                            }
                        }
                    }
                    result.push(partial);
                }
                else {
                    return '';
                }
            }
        }
        value = result.length === 1 ? result[0] : result.join(separator === ' ' ? ' ' : (separator ? separator + ' ' : ''));
        if (errorString) {
            let match;
            while ((match = errorString.exec(value)) !== null) {
                if (match[1] === undefined) {
                    return '';
                }
                const segment = match[0];
                let optional = segment;
                const length = match.length;
                let i = length - 1;
                while (i >= 1) {
                    optional = optional.replace(new RegExp(match[i--] + '$'), '');
                }
                if (optional === segment) {
                    return '';
                }
                else {
                    value = value.replace(segment, optional);
                }
            }
        }
        return value;
    }
    function calculateVar(element, value, options = {}) {
        const output = parseVar(element, value);
        if (output) {
            const { precision, unitType } = options;
            if (value.includes('%')) {
                if (options.supportPercent === false || unitType === 32 /* INTEGER */) {
                    return NaN;
                }
                else if (options.boundingSize === undefined) {
                    const { dimension, boundingBox } = options;
                    if (dimension) {
                        if (boundingBox) {
                            options.boundingSize = boundingBox[dimension];
                        }
                        else {
                            let boundingElement;
                            let offsetPadding = 0;
                            if (options.parent === false) {
                                boundingElement = element;
                            }
                            else {
                                boundingElement = element.parentElement;
                                if (boundingElement instanceof HTMLElement) {
                                    let style;
                                    if (isAbsolutePosition(getStyle(element).position)) {
                                        do {
                                            style = getStyle(boundingElement);
                                            if (boundingElement === document.body) {
                                                break;
                                            }
                                            switch (style.position) {
                                                case 'static':
                                                case 'initial':
                                                case 'unset':
                                                    boundingElement = boundingElement.parentElement;
                                                    continue;
                                            }
                                            break;
                                        } while (boundingElement);
                                    }
                                    else {
                                        style = getStyle(boundingElement);
                                    }
                                    if (style) {
                                        offsetPadding = dimension === 'width' ? getContentBoxWidth(style) : getContentBoxHeight(style);
                                    }
                                }
                                else if (element instanceof SVGElement) {
                                    if (options.parent !== true) {
                                        boundingElement = element;
                                    }
                                }
                                else {
                                    boundingElement = null;
                                }
                            }
                            if (boundingElement) {
                                options.boundingSize = Math.max(0, boundingElement.getBoundingClientRect()[dimension] - offsetPadding);
                            }
                        }
                    }
                }
            }
            else if (options.supportPercent) {
                return NaN;
            }
            if ((!unitType || unitType === 2 /* LENGTH */) && /\d(em|ch)/.test(value) && options.fontSize === undefined) {
                options.fontSize = getFontSize(element);
            }
            let result = calculate(output, options);
            if (precision !== undefined) {
                result = precision === 0 ? Math.floor(result) : parseFloat(truncate(result, precision));
            }
            else if (options.roundValue) {
                result = Math.round(result);
            }
            return result;
        }
        return NaN;
    }
    function getParentBoxDimension(element) {
        const parentElement = element.parentElement;
        let width = 0;
        let height = 0;
        if (parentElement) {
            const style = getStyle(parentElement);
            ({ width, height } = parentElement.getBoundingClientRect());
            width = Math.max(0, width - getContentBoxWidth(style));
            height = Math.max(0, height - getContentBoxHeight(style));
        }
        return { width, height };
    }
    function getBackgroundPosition(value, dimension, options = {}) {
        value = value.trim();
        if (value !== '') {
            const { fontSize, imageDimension, imageSize, screenDimension } = options;
            const { width, height } = dimension;
            const orientation = value.split(CHAR.SPACE);
            if (orientation.length === 1) {
                orientation.push('center');
            }
            const length = orientation.length;
            if (length <= 4) {
                const result = newBoxRectPosition(orientation);
                const setImageOffset = (position, horizontal, direction, directionAsPercent) => {
                    if (imageDimension && !isLength(position)) {
                        let offset = result[directionAsPercent];
                        if (imageSize && imageSize !== 'auto' && imageSize !== 'initial') {
                            const [sizeW, sizeH] = imageSize.split(CHAR.SPACE);
                            if (horizontal) {
                                let imageWidth = width;
                                if (isLength(sizeW, true)) {
                                    if (isPercent(sizeW)) {
                                        imageWidth *= parseFloat(sizeW) / 100;
                                    }
                                    else {
                                        const unit = parseUnit(sizeW, fontSize, screenDimension);
                                        if (unit) {
                                            imageWidth = unit;
                                        }
                                    }
                                }
                                else if (sizeH) {
                                    let percent = 1;
                                    if (isPercent(sizeH)) {
                                        percent = (parseFloat(sizeH) / 100 * height) / imageDimension.height;
                                    }
                                    else if (isLength(sizeH)) {
                                        const unit = parseUnit(sizeH, fontSize, screenDimension);
                                        if (unit) {
                                            percent = unit / imageDimension.height;
                                        }
                                    }
                                    imageWidth = percent * imageDimension.width;
                                }
                                offset *= imageWidth;
                            }
                            else {
                                let imageHeight = height;
                                if (isLength(sizeH, true)) {
                                    if (isPercent(sizeH)) {
                                        imageHeight *= parseFloat(sizeH) / 100;
                                    }
                                    else {
                                        const unit = parseUnit(sizeH, fontSize, screenDimension);
                                        if (unit) {
                                            imageHeight = unit;
                                        }
                                    }
                                }
                                else if (sizeW) {
                                    let percent = 1;
                                    if (isPercent(sizeW)) {
                                        percent = (parseFloat(sizeW) / 100 * width) / imageDimension.width;
                                    }
                                    else if (isLength(sizeW)) {
                                        const unit = parseUnit(sizeW, fontSize, screenDimension);
                                        if (unit) {
                                            percent = unit / imageDimension.width;
                                        }
                                    }
                                    imageHeight = percent * imageDimension.height;
                                }
                                offset *= imageHeight;
                            }
                        }
                        else {
                            offset *= horizontal ? imageDimension.width : imageDimension.height;
                        }
                        result[direction] -= offset;
                    }
                };
                if (length === 2) {
                    orientation.sort((a, b) => {
                        switch (a) {
                            case 'left':
                            case 'right':
                                return -1;
                            case 'top':
                            case 'bottom':
                                return 1;
                        }
                        switch (b) {
                            case 'left':
                            case 'right':
                                return 1;
                            case 'top':
                            case 'bottom':
                                return -1;
                        }
                        return 0;
                    });
                    for (let i = 0; i < 2; ++i) {
                        let position = orientation[i];
                        const horizontal = i === 0;
                        const [direction, offsetParent] = horizontal ? ['left', width] : ['top', height];
                        const directionAsPercent = direction + 'AsPercent';
                        switch (position) {
                            case '0%':
                                if (horizontal) {
                                    position = 'left';
                                }
                            case 'left':
                            case 'top':
                                break;
                            case '100%':
                                if (horizontal) {
                                    position = 'right';
                                }
                            case 'right':
                            case 'bottom':
                                result[direction] = offsetParent;
                                result[directionAsPercent] = 1;
                                break;
                            case '50%':
                            case 'center':
                                position = 'center';
                                result[direction] = offsetParent / 2;
                                result[directionAsPercent] = 0.5;
                                break;
                            default: {
                                const percent = convertPercent(position, offsetParent, fontSize, screenDimension);
                                if (percent > 1) {
                                    orientation[i] = '100%';
                                    position = horizontal ? 'right' : 'bottom';
                                    result[position] = convertLength(formatPercent(percent - 1), offsetParent, fontSize, screenDimension) * -1;
                                }
                                else {
                                    result[direction] = convertLength(position, offsetParent, fontSize, screenDimension);
                                }
                                result[directionAsPercent] = percent;
                                break;
                            }
                        }
                        if (horizontal) {
                            result.horizontal = position;
                        }
                        else {
                            result.vertical = position;
                        }
                        setImageOffset(position, horizontal, direction, directionAsPercent);
                    }
                }
                else {
                    let horizontal = 0;
                    let vertical = 0;
                    const checkPosition = (position, nextPosition) => {
                        switch (position) {
                            case 'left':
                            case 'right':
                                result.horizontal = position;
                                horizontal++;
                                break;
                            case 'center': {
                                if (length === 4) {
                                    return false;
                                }
                                else {
                                    let centerHorizontal = true;
                                    if (nextPosition === undefined) {
                                        if (horizontal > 0) {
                                            result.vertical = position;
                                            centerHorizontal = false;
                                        }
                                        else {
                                            result.horizontal = position;
                                        }
                                    }
                                    else {
                                        switch (nextPosition) {
                                            case 'left':
                                            case 'right':
                                                result.vertical = position;
                                                centerHorizontal = false;
                                                break;
                                            case 'top':
                                            case 'bottom':
                                                result.horizontal = position;
                                                break;
                                            default:
                                                return false;
                                        }
                                    }
                                    if (centerHorizontal) {
                                        result.left = width / 2;
                                        result.leftAsPercent = 0.5;
                                        setImageOffset(position, true, 'left', 'leftAsPercent');
                                    }
                                    else {
                                        result.top = height / 2;
                                        result.topAsPercent = 0.5;
                                        setImageOffset(position, false, 'top', 'topAsPercent');
                                    }
                                }
                                break;
                            }
                            case 'top':
                            case 'bottom':
                                result.vertical = position;
                                vertical++;
                                break;
                            default:
                                return false;
                        }
                        return horizontal < 2 && vertical < 2;
                    };
                    for (let i = 0; i < length; ++i) {
                        const position = orientation[i];
                        if (isLength(position, true)) {
                            const alignment = orientation[i - 1];
                            switch (alignment) {
                                case 'left':
                                case 'right': {
                                    const location = convertLength(position, width, fontSize, screenDimension);
                                    const locationAsPercent = convertPercent(position, width, fontSize, screenDimension);
                                    if (alignment === 'right') {
                                        result.right = location;
                                        result.rightAsPercent = locationAsPercent;
                                        setImageOffset(position, true, 'right', 'rightAsPercent');
                                        result.left = width - location;
                                        result.leftAsPercent = 1 - locationAsPercent;
                                    }
                                    else {
                                        if (locationAsPercent > 1) {
                                            const percent = 1 - locationAsPercent;
                                            result.horizontal = 'right';
                                            result.right = convertLength(formatPercent(percent), width, fontSize, screenDimension);
                                            result.rightAsPercent = percent;
                                            setImageOffset(position, true, 'right', 'rightAsPercent');
                                        }
                                        result.left = location;
                                        result.leftAsPercent = locationAsPercent;
                                    }
                                    setImageOffset(position, true, 'left', 'leftAsPercent');
                                    break;
                                }
                                case 'top':
                                case 'bottom': {
                                    const location = convertLength(position, height, fontSize, screenDimension);
                                    const locationAsPercent = convertPercent(position, height, fontSize, screenDimension);
                                    if (alignment === 'bottom') {
                                        result.bottom = location;
                                        result.bottomAsPercent = locationAsPercent;
                                        setImageOffset(position, false, 'bottom', 'bottomAsPercent');
                                        result.top = height - location;
                                        result.topAsPercent = 1 - locationAsPercent;
                                    }
                                    else {
                                        if (locationAsPercent > 1) {
                                            const percent = 1 - locationAsPercent;
                                            result.horizontal = 'bottom';
                                            result.bottom = convertLength(formatPercent(percent), height, fontSize, screenDimension);
                                            result.bottomAsPercent = percent;
                                            setImageOffset(position, false, 'bottom', 'bottomAsPercent');
                                        }
                                        result.top = location;
                                        result.topAsPercent = locationAsPercent;
                                    }
                                    setImageOffset(position, false, 'top', 'topAsPercent');
                                    break;
                                }
                                default:
                                    return newBoxRectPosition();
                            }
                        }
                        else if (!checkPosition(position, orientation[i + 1])) {
                            return newBoxRectPosition();
                        }
                    }
                }
                result.static = result.top === 0 && result.right === 0 && result.bottom === 0 && result.left === 0;
                return result;
            }
        }
        return newBoxRectPosition();
    }
    function getSrcSet(element, mimeType) {
        const parentElement = element.parentElement;
        const result = [];
        let { srcset, sizes } = element;
        if ((parentElement === null || parentElement === void 0 ? void 0 : parentElement.tagName) === 'PICTURE') {
            iterateArray(parentElement.children, (item) => {
                if (item.tagName === 'SOURCE') {
                    const { media, type, srcset: srcsetA } = item;
                    if (isString(srcsetA) && !(isString(media) && !checkMediaRule(media)) && (!isString(type) || !mimeType || mimeType.includes(type.trim().toLowerCase()))) {
                        srcset = srcsetA;
                        sizes = item.sizes;
                        return true;
                    }
                }
                return;
            });
        }
        if (srcset !== '') {
            srcset.trim().split(XML.SEPARATOR).forEach(value => {
                const match = REGEX_SRCSET.exec(value);
                if (match) {
                    let width = 0;
                    let pixelRatio = 0;
                    switch (match[3]) {
                        case 'w':
                            width = convertFloat(match[2]);
                            break;
                        case 'x':
                            pixelRatio = convertFloat(match[2]);
                            break;
                        default:
                            pixelRatio = 1;
                            break;
                    }
                    result.push({ src: resolvePath(match[1].split(CHAR.SPACE)[0]), pixelRatio, width });
                }
            });
        }
        const length = result.length;
        if (length === 0) {
            result.push({ src: element.src, pixelRatio: 1, width: 0 });
        }
        else if (length > 1) {
            result.sort((a, b) => {
                const pxA = a.pixelRatio, pxB = b.pixelRatio;
                if (pxA > 0 && pxB > 0) {
                    if (pxA !== pxB) {
                        return pxA < pxB ? -1 : 1;
                    }
                }
                else {
                    const widthA = a.width, widthB = b.width;
                    if (widthA !== widthB && widthA > 0 && widthB > 0) {
                        return widthA < widthB ? -1 : 1;
                    }
                }
                return 0;
            });
            if (isString(sizes)) {
                let width = NaN;
                for (const value of sizes.trim().split(XML.SEPARATOR)) {
                    let match = REGEX_SOURCESIZES.exec(value);
                    if (match) {
                        const ruleA = match[2] ? checkMediaRule(match[2]) : undefined;
                        const ruleB = match[6] ? checkMediaRule(match[6]) : undefined;
                        switch (match[5]) {
                            case 'and':
                                if (!ruleA || !ruleB) {
                                    continue;
                                }
                                break;
                            case 'or':
                                if (!ruleA && !ruleB) {
                                    continue;
                                }
                                break;
                            case 'not':
                                if (ruleA !== undefined || ruleB) {
                                    continue;
                                }
                                break;
                            default:
                                if (ruleA === false || ruleB !== undefined) {
                                    continue;
                                }
                                break;
                        }
                        const unit = match[9];
                        if (unit) {
                            match = CSS.CALC.exec(unit);
                            if (match) {
                                width = calculate(match[1], match[1].includes('%') ? { boundingSize: getParentBoxDimension(element).width } : undefined);
                            }
                            else if (isPercent(unit)) {
                                width = parseFloat(unit) / 100 * getParentBoxDimension(element).width;
                            }
                            else if (isLength(unit)) {
                                width = parseUnit(unit);
                            }
                        }
                        if (!isNaN(width)) {
                            break;
                        }
                    }
                }
                if (!isNaN(width)) {
                    const resolution = width * window.devicePixelRatio;
                    let index = -1;
                    for (let i = 0; i < length; ++i) {
                        const imageWidth = result[i].width;
                        if (imageWidth > 0 && imageWidth <= resolution && (index === -1 || result[index].width < imageWidth)) {
                            index = i;
                        }
                    }
                    if (index === 0) {
                        const item = result[0];
                        item.pixelRatio = 1;
                        item.actualWidth = width;
                    }
                    else if (index > 0) {
                        const selected = result.splice(index, 1)[0];
                        selected.pixelRatio = 1;
                        selected.actualWidth = width;
                        result.unshift(selected);
                    }
                    let i = 1;
                    while (i < length) {
                        const item = result[i++];
                        if (item.pixelRatio === 0) {
                            item.pixelRatio = item.width / width;
                        }
                    }
                }
            }
        }
        return result;
    }
    function convertListStyle(name, value, valueAsDefault) {
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
    function extractURL(value) {
        const match = CSS.URL.exec(value);
        return match ? match[1] || match[2] : '';
    }
    function resolveURL(value) {
        value = extractURL(value);
        return value !== '' ? resolvePath(value) : '';
    }
    function insertStyleSheetRule(value, index = 0) {
        const style = document.createElement('style');
        if (isUserAgent(4 /* SAFARI */)) {
            style.appendChild(document.createTextNode(''));
        }
        document.head.appendChild(style);
        const sheet = style.sheet;
        if (typeof (sheet === null || sheet === void 0 ? void 0 : sheet.insertRule) === 'function') {
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
        let result = convertFloat(value);
        switch (unit) {
            case 'rad':
                result *= 180 / Math.PI;
                break;
            case 'grad':
                result /= 400;
            case 'turn':
                result *= 360;
                break;
        }
        return result;
    }
    function convertPX(value, fontSize) {
        return value ? parseUnit(value, fontSize) + 'px' : '0px';
    }
    function calculate(value, options = {}) {
        value = value.trim();
        if (value === '') {
            return NaN;
        }
        const { boundingSize, min, max, unitType, fontSize } = options;
        let length = value.length;
        if (value.charAt(0) !== '(' || value.charAt(length - 1) !== ')') {
            value = `(${value})`;
            length += 2;
        }
        let opened = 0;
        const opening = [];
        const closing = [];
        for (let i = 0; i < length; ++i) {
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
            const equated = [];
            let index = 0;
            while (true) {
                for (let i = 0; i < closing.length; ++i) {
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
                        let operand;
                        let operator;
                        const checkNumber = () => {
                            if (operand) {
                                switch (operator) {
                                    case '+':
                                    case '-':
                                        if (isNumber(operand)) {
                                            return false;
                                        }
                                        break;
                                    case '*':
                                    case '/':
                                        if (!isNumber(operand)) {
                                            return false;
                                        }
                                        break;
                                }
                            }
                            return true;
                        };
                        const checkOperator = () => {
                            if (operand) {
                                switch (operator) {
                                    case '+':
                                    case '-':
                                        return false;
                                }
                            }
                            return true;
                        };
                        let found = false;
                        const seg = [];
                        const evaluate = [];
                        const operation = value.substring(j + 1, closing[i]).split(REGEX_OPERATOR);
                        const q = operation.length;
                        let k = 0;
                        while (k < q) {
                            const partial = operation[k++].trim();
                            switch (partial) {
                                case '+':
                                case '-':
                                case '*':
                                case '/':
                                    evaluate.push(partial);
                                    operator = partial;
                                    break;
                                default: {
                                    const match = /\s*{(\d+)}\s*/.exec(partial);
                                    if (match) {
                                        switch (unitType) {
                                            case 32 /* INTEGER */:
                                            case 64 /* DECIMAL */:
                                                break;
                                            default:
                                                if (!checkNumber()) {
                                                    return NaN;
                                                }
                                                break;
                                        }
                                        const unit = equated[parseInt(match[1])];
                                        seg.push(unit);
                                        operand = unit.toString();
                                        found = true;
                                    }
                                    else {
                                        switch (unitType) {
                                            case 4 /* PERCENT */:
                                                if (isNumber(partial)) {
                                                    if (!checkOperator()) {
                                                        return NaN;
                                                    }
                                                    seg.push(parseFloat(partial));
                                                }
                                                else if (isPercent(partial)) {
                                                    if (!checkNumber()) {
                                                        return NaN;
                                                    }
                                                    seg.push(parseFloat(partial));
                                                    found = true;
                                                }
                                                else {
                                                    return NaN;
                                                }
                                                break;
                                            case 8 /* TIME */:
                                                if (isNumber(partial)) {
                                                    if (!checkOperator()) {
                                                        return NaN;
                                                    }
                                                    seg.push(parseFloat(partial));
                                                }
                                                else if (isTime(partial)) {
                                                    if (!checkNumber()) {
                                                        return NaN;
                                                    }
                                                    seg.push(parseTime(partial));
                                                    found = true;
                                                }
                                                else {
                                                    return NaN;
                                                }
                                                break;
                                            case 16 /* ANGLE */:
                                                if (isNumber(partial)) {
                                                    if (!checkOperator()) {
                                                        return NaN;
                                                    }
                                                    seg.push(parseFloat(partial));
                                                }
                                                else if (isAngle(partial)) {
                                                    if (!checkNumber()) {
                                                        return NaN;
                                                    }
                                                    seg.push(parseAngle(partial));
                                                    found = true;
                                                }
                                                else {
                                                    return NaN;
                                                }
                                                break;
                                            case 32 /* INTEGER */:
                                                if (REGEX_INTEGER.test(partial)) {
                                                    seg.push(parseInt(partial));
                                                    found = true;
                                                }
                                                else {
                                                    return NaN;
                                                }
                                                break;
                                            case 64 /* DECIMAL */:
                                                if (isNumber(partial)) {
                                                    seg.push(parseFloat(partial));
                                                    found = true;
                                                }
                                                else if (isPercent(partial) && boundingSize !== undefined && !isNaN(boundingSize)) {
                                                    seg.push(parseFloat(partial) / 100 * boundingSize);
                                                }
                                                else {
                                                    return NaN;
                                                }
                                                break;
                                            default:
                                                if (isNumber(partial)) {
                                                    if (!checkOperator()) {
                                                        return NaN;
                                                    }
                                                    seg.push(parseFloat(partial));
                                                }
                                                else if (isLength(partial)) {
                                                    if (!checkNumber()) {
                                                        return NaN;
                                                    }
                                                    seg.push(parseUnit(partial, fontSize));
                                                    found = true;
                                                }
                                                else if (isPercent(partial) && boundingSize !== undefined && !isNaN(boundingSize)) {
                                                    if (!checkNumber()) {
                                                        return NaN;
                                                    }
                                                    seg.push(parseFloat(partial) / 100 * boundingSize);
                                                    found = true;
                                                }
                                                else {
                                                    return NaN;
                                                }
                                                break;
                                        }
                                        operand = partial;
                                    }
                                    break;
                                }
                            }
                        }
                        if (!found || seg.length !== evaluate.length + 1) {
                            return NaN;
                        }
                        for (k = 0; k < evaluate.length; ++k) {
                            if (evaluate[k] === '/') {
                                if (Math.abs(seg[k + 1]) !== 0) {
                                    seg.splice(k, 2, seg[k] / seg[k + 1]);
                                    evaluate.splice(k--, 1);
                                }
                                else {
                                    return NaN;
                                }
                            }
                        }
                        for (k = 0; k < evaluate.length; ++k) {
                            if (evaluate[k] === '*') {
                                seg.splice(k, 2, seg[k] * seg[k + 1]);
                                evaluate.splice(k--, 1);
                            }
                        }
                        for (k = 0; k < evaluate.length; ++k) {
                            seg.splice(k, 2, seg[k] + seg[k + 1] * (evaluate[k] === '-' ? -1 : 1));
                            evaluate.splice(k--, 1);
                        }
                        if (seg.length === 1) {
                            if (closing.length === 1) {
                                const result = seg[0];
                                if (min !== undefined && result < min || max !== undefined && result > max) {
                                    return NaN;
                                }
                                return truncateFraction(result);
                            }
                            else {
                                equated[index] = seg[0];
                                const hash = `{${index++}}`;
                                const remaining = closing[i] + 1;
                                value = value.substring(0, j) + hash + ' '.repeat(remaining - (j + hash.length)) + value.substring(remaining);
                                closing.splice(i--, 1);
                            }
                        }
                        else {
                            return NaN;
                        }
                    }
                }
            }
        }
        return NaN;
    }
    function parseUnit(value, fontSize, screenDimension) {
        const match = UNIT.LENGTH.exec(value);
        if (match) {
            let result = parseFloat(match[1]);
            switch (match[2]) {
                case 'px':
                    return result;
                case 'em':
                case 'ch':
                    return result * (fontSize !== null && fontSize !== void 0 ? fontSize : (getFontSize(document.body) || 16));
                case 'rem':
                    return result * (getFontSize(document.body) || 16);
                case 'pc':
                    result *= 12;
                case 'pt':
                    return result * 4 / 3;
                case 'mm':
                    result /= 10;
                case 'cm':
                    result /= 2.54;
                case 'in':
                    return result * getDeviceDPI();
                case 'vw':
                    return result * getInnerWidth(screenDimension) / 100;
                case 'vh':
                    return result * getInnerHeight(screenDimension) / 100;
                case 'vmin':
                    return result * Math.min(getInnerWidth(screenDimension), getInnerHeight(screenDimension)) / 100;
                case 'vmax':
                    return result * Math.max(getInnerWidth(screenDimension), getInnerHeight(screenDimension)) / 100;
            }
        }
        return 0;
    }
    function parseAngle(value) {
        const match = CSS.ANGLE.exec(value);
        return match ? convertAngle(match[1], match[2]) : 0;
    }
    function parseTime(value) {
        const match = CSS.TIME.exec(value);
        if (match) {
            switch (match[2]) {
                case 'ms':
                    return parseInt(match[1]);
                case 's':
                    return parseFloat(match[1]) * 1000;
            }
        }
        return 0;
    }
    function formatPX(value) {
        return Math.round(value) + 'px';
    }
    function formatPercent(value, round = true) {
        if (typeof value === 'string') {
            value = parseFloat(value);
            if (isNaN(value)) {
                return '0%';
            }
        }
        value *= 100;
        return (round ? Math.round(value) : value) + '%';
    }
    function isLength(value, percent) {
        return !percent ? UNIT.LENGTH.test(value) : UNIT.LENGTH_PERCENTAGE.test(value);
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
    function isTime(value) {
        return CSS.TIME.test(value);
    }
    function isPercent(value) {
        return UNIT.PERCENT.test(value);
    }
    function hasCalc(value) {
        return REGEX_CALC.test(value);
    }

    var css = /*#__PURE__*/Object.freeze({
        __proto__: null,
        BOX_POSITION: BOX_POSITION,
        BOX_MARGIN: BOX_MARGIN,
        BOX_BORDER: BOX_BORDER,
        BOX_PADDING: BOX_PADDING,
        TEXT_STYLE: TEXT_STYLE,
        getStyle: getStyle,
        getFontSize: getFontSize,
        hasComputedStyle: hasComputedStyle,
        parseSelectorText: parseSelectorText,
        getSpecificity: getSpecificity,
        checkWritingMode: checkWritingMode,
        calculateStyle: calculateStyle,
        checkStyleValue: checkStyleValue,
        getKeyframesRules: getKeyframesRules,
        parseKeyframes: parseKeyframes,
        checkMediaRule: checkMediaRule,
        isParentStyle: isParentStyle,
        getInheritedStyle: getInheritedStyle,
        parseVar: parseVar,
        calculateVarAsString: calculateVarAsString,
        calculateVar: calculateVar,
        getParentBoxDimension: getParentBoxDimension,
        getBackgroundPosition: getBackgroundPosition,
        getSrcSet: getSrcSet,
        convertListStyle: convertListStyle,
        extractURL: extractURL,
        resolveURL: resolveURL,
        insertStyleSheetRule: insertStyleSheetRule,
        convertAngle: convertAngle,
        convertPX: convertPX,
        calculate: calculate,
        parseUnit: parseUnit,
        parseAngle: parseAngle,
        parseTime: parseTime,
        formatPX: formatPX,
        formatPercent: formatPercent,
        isLength: isLength,
        isCalc: isCalc,
        isCustomProperty: isCustomProperty,
        isAngle: isAngle,
        isTime: isTime,
        isPercent: isPercent,
        hasCalc: hasCalc
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
    function withinViewport(rect) {
        return !(rect.top + window.scrollY + rect.height < 0 || rect.left + window.scrollX + rect.width < 0);
    }
    function assignRect(rect, scrollPosition = true) {
        const result = {
            top: rect.top,
            right: rect.right,
            bottom: rect.bottom,
            left: rect.left,
            width: rect.width,
            height: rect.height
        };
        if (scrollPosition) {
            const { scrollX, scrollY } = window;
            if (scrollY !== 0) {
                result.top += scrollY;
                result.bottom += scrollY;
            }
            if (scrollX !== 0) {
                result.left += scrollX;
                result.right += scrollX;
            }
        }
        return result;
    }
    function getRangeClientRect(element) {
        const domRect = [];
        const range = document.createRange();
        range.selectNodeContents(element);
        const clientRects = range.getClientRects();
        let length = clientRects.length;
        let i = 0;
        while (i < length) {
            const item = clientRects.item(i++);
            if (Math.round(item.width) > 0 && !withinRange(item.left, item.right, 0.5)) {
                domRect.push(item);
            }
        }
        let bounds;
        length = domRect.length;
        if (length) {
            bounds = assignRect(domRect[0]);
            let numberOfLines = 1;
            let overflow = false;
            i = 0;
            while (++i < length) {
                const { left, right, top, bottom, width } = domRect[i];
                if (left < bounds.left) {
                    bounds.left = left;
                }
                else if (left > bounds.right) {
                    overflow = true;
                }
                if (right > bounds.right) {
                    bounds.right = right;
                }
                if (top < bounds.top) {
                    bounds.top = top;
                }
                else if (top >= domRect[i - 1].bottom) {
                    numberOfLines++;
                }
                if (bottom > bounds.bottom) {
                    bounds.bottom = bottom;
                }
                bounds.width += width;
            }
            bounds.height = bounds.bottom - bounds.top;
            if (numberOfLines > 1) {
                bounds.numberOfLines = numberOfLines;
                bounds.overflow = overflow;
            }
        }
        else {
            bounds = newBoxRectDimension();
        }
        return bounds;
    }
    function removeElementsByClassName(className) {
        Array.from(document.getElementsByClassName(className)).forEach(element => { var _a; return (_a = element.parentElement) === null || _a === void 0 ? void 0 : _a.removeChild(element); });
    }
    function getElementsBetweenSiblings(elementStart, elementEnd) {
        const result = [];
        if (!elementStart || elementStart.parentElement === elementEnd.parentElement) {
            const parent = elementEnd.parentElement;
            if (parent) {
                let startIndex = elementStart ? -1 : 0;
                let endIndex = -1;
                iterateArray(parent.childNodes, (element, index) => {
                    if (element === elementEnd) {
                        endIndex = index;
                        if (startIndex !== -1) {
                            return true;
                        }
                    }
                    else if (element === elementStart) {
                        startIndex = index;
                        if (endIndex !== -1) {
                            return true;
                        }
                    }
                    return;
                });
                if (startIndex !== -1 && endIndex !== -1) {
                    iterateArray(parent.childNodes, (element) => {
                        const nodeName = element.nodeName;
                        if (nodeName[0] !== '#' || nodeName === '#text') {
                            result.push(element);
                        }
                    }, Math.min(startIndex, endIndex), Math.max(startIndex, endIndex) + 1);
                }
            }
        }
        return result;
    }
    function createElement(parent, tagName, attrs) {
        const element = document.createElement(tagName);
        const style = element.style;
        for (const attr in attrs) {
            if (attr.includes('-')) {
                style.setProperty(attr, attrs[attr]);
            }
            else {
                style[attr] = attrs[attr];
            }
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
        var _a;
        return ((_a = element.attributes.getNamedItem(attr)) === null || _a === void 0 ? void 0 : _a.value.trim()) || '';
    }
    function isTextNode(element) {
        return element.nodeName === '#text';
    }

    var dom = /*#__PURE__*/Object.freeze({
        __proto__: null,
        ELEMENT_BLOCK: ELEMENT_BLOCK,
        newBoxRect: newBoxRect,
        newBoxRectDimension: newBoxRectDimension,
        newBoxModel: newBoxModel,
        withinViewport: withinViewport,
        assignRect: assignRect,
        getRangeClientRect: getRangeClientRect,
        removeElementsByClassName: removeElementsByClassName,
        getElementsBetweenSiblings: getElementsBetweenSiblings,
        createElement: createElement,
        measureTextWidth: measureTextWidth,
        getNamedItem: getNamedItem,
        isTextNode: isTextNode
    });

    function actualClientRect(element, sessionId) {
        if (sessionId) {
            const rect = getElementCache(element, 'clientRect', sessionId);
            if (rect) {
                return rect;
            }
        }
        const bounds = element.getBoundingClientRect();
        if (sessionId) {
            setElementCache(element, 'clientRect', sessionId, bounds);
        }
        return bounds;
    }
    function actualTextRangeRect(element, sessionId) {
        if (sessionId) {
            const rect = getElementCache(element, 'textRangeRect', sessionId);
            if (rect) {
                return rect;
            }
        }
        let hidden;
        if (element.childElementCount) {
            iterateArray(element.children, (item) => {
                const style = getStyle(item);
                if (style.getPropertyValue('visibility') !== 'visible') {
                    const position = style.getPropertyValue('position');
                    if (position === 'absolute' || position === 'fixed') {
                        const display = style.getPropertyValue('display');
                        if (display !== 'none') {
                            item.style.display = 'none';
                            if (!hidden) {
                                hidden = [];
                            }
                            hidden.push([item, display]);
                        }
                    }
                }
            });
        }
        const bounds = getRangeClientRect(element);
        hidden === null || hidden === void 0 ? void 0 : hidden.forEach(item => item[0].style.display = item[1]);
        if (sessionId) {
            setElementCache(element, 'textRangeRect', sessionId, bounds);
        }
        return bounds;
    }
    function getStyleValue(element, attr, sessionId) {
        var _a;
        return ((_a = getElementCache(element, 'styleMap', sessionId)) === null || _a === void 0 ? void 0 : _a[convertCamelCase(attr)]) || '';
    }
    function getPseudoElt(element, sessionId) {
        return getElementCache(element, 'pseudoElement', sessionId) || '';
    }
    function getElementAsNode(element, sessionId) {
        return getElementCache(element, 'node', sessionId) || null;
    }
    function setElementCache(element, attr, sessionId, data) {
        element[`__${attr}::${sessionId}`] = data;
    }
    function getElementCache(element, attr, sessionId) {
        if (!sessionId) {
            sessionId = element['__sessionId::0'] || '0';
        }
        return element[`__${attr}::${sessionId}`];
    }
    function deleteElementCache(element, attr, sessionId) {
        delete element[`__${attr}::${sessionId}`];
    }

    var session = /*#__PURE__*/Object.freeze({
        __proto__: null,
        actualClientRect: actualClientRect,
        actualTextRangeRect: actualTextRangeRect,
        getStyleValue: getStyleValue,
        getPseudoElt: getPseudoElt,
        getElementAsNode: getElementAsNode,
        setElementCache: setElementCache,
        getElementCache: getElementCache,
        deleteElementCache: deleteElementCache
    });

    const REGEX_INDENT = /^(\t+)(.*)$/;
    const REGEX_FORMAT = {
        ITEM: /\s*(<(\/)?([?\w]+)[^>]*>)\n?([^<]*)/g,
        OPENTAG: /\s*>$/,
        CLOSETAG: /\/>\n*$/,
        NBSP: /&nbsp;/g,
        AMP: /&/g
    };
    const STRING_XMLENCODING = '<?xml version="1.0" encoding="utf-8"?>\n';
    const STRING_SPACE = '&#160;';
    const STRING_TABSPACE = STRING_SPACE.repeat(8);
    function isPlainText(value) {
        const length = value.length;
        let i = 0;
        while (i < length) {
            switch (value.charCodeAt(i++)) {
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
            return joinArray(value.split('\n'), line => line !== '' ? indent + line : '');
        }
        return value;
    }
    function pushIndentArray(values, depth, char = '\t', separator = '') {
        if (depth > 0) {
            const indent = char.repeat(depth);
            const length = values.length;
            let i = 0;
            while (i < length) {
                values[i] = pushIndent(values[i++], depth, char, indent);
            }
        }
        return values.join(separator);
    }
    function replaceIndent(value, depth, pattern) {
        if (depth >= 0) {
            let indent = -1;
            return joinArray(value.split('\n'), line => {
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
                return joinArray(value.split('\n'), line => {
                    const match = REGEX_INDENT.exec(line);
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
        let length = children.length;
        let i = -1;
        while (++i < length) {
            const item = children[i];
            const include = tag['#'] && item[tag['#']];
            const closed = !nested && !include;
            const attrs = tag['@'];
            const descend = tag['>'];
            let valid = false;
            output += indent + '<' + tagName;
            attrs === null || attrs === void 0 ? void 0 : attrs.forEach(attr => {
                const value = item[attr];
                if (value) {
                    output += ` ${(tag['^'] ? tag['^'] + ':' : '') + attr}="${value}"`;
                }
            });
            if (descend) {
                let innerText = '';
                const childDepth = depth + (nested ? i : 0) + 1;
                for (const name in descend) {
                    const value = item[name];
                    if (Array.isArray(value)) {
                        innerText += applyTemplate(name, descend, value, childDepth);
                    }
                    else if (isPlainObject(value)) {
                        innerText += applyTemplate(name, descend, [value], childDepth);
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
            while (--length >= 0) {
                indent = indent.substring(1);
                output += indent + `</${tagName}>\n`;
            }
        }
        return output;
    }
    function formatTemplate(value, closeEmpty = true, startIndent = -1, char = '\t') {
        const lines = [];
        let match;
        while ((match = REGEX_FORMAT.ITEM.exec(value)) !== null) {
            lines.push({
                tag: match[1],
                closing: !!match[2],
                tagName: match[3],
                value: match[4].trim()
            });
        }
        let output = '';
        let indent = startIndent;
        const length = lines.length;
        let i = -1;
        while (++i < length) {
            const line = lines[i];
            let previous = indent;
            if (i > 0) {
                if (line.closing) {
                    --indent;
                }
                else {
                    ++previous;
                    if (!REGEX_FORMAT.CLOSETAG.exec(line.tag)) {
                        if (closeEmpty && line.value.trim() === '') {
                            const next = lines[i + 1];
                            if ((next === null || next === void 0 ? void 0 : next.closing) && next.tagName === line.tagName) {
                                line.tag = line.tag.replace(REGEX_FORMAT.OPENTAG, ' />');
                                ++i;
                            }
                            else {
                                ++indent;
                            }
                        }
                        else {
                            ++indent;
                        }
                    }
                }
                let firstLine = true;
                line.tag.trim().split('\n').forEach(partial => {
                    const depth = previous + (firstLine ? 0 : 1);
                    output += (depth > 0 ? char.repeat(depth) : '') + partial.trim() + '\n';
                    firstLine = false;
                });
            }
            else {
                output += (startIndent > 0 ? char.repeat(startIndent) : '') + line.tag + '\n';
            }
            output += line.value;
        }
        return output;
    }
    function replaceCharacterData(value, tab = false) {
        value = value
            .replace(REGEX_FORMAT.NBSP, '&#160;')
            .replace(ESCAPE.NONENTITY, '&amp;');
        const char = [];
        let length = value.length;
        let i = -1;
        while (++i < length) {
            const ch = value.charAt(i);
            switch (ch) {
                case "'":
                    char.push({ i, text: "\\'" });
                    break;
                case '"':
                    char.push({ i, text: '&quot;' });
                    break;
                case '<':
                    char.push({ i, text: '&lt;' });
                    break;
                case '>':
                    char.push({ i, text: '&gt;' });
                    break;
                case '\t':
                    if (tab) {
                        char.push({ i, text: STRING_TABSPACE });
                    }
                    break;
                case '\u0003':
                    char.push({ i, text: ' ' });
                    break;
                case '\u00A0':
                    char.push({ i, text: '&#160;' });
                    break;
            }
        }
        length = char.length;
        if (length) {
            const parts = value.split('');
            let text;
            let j = 0;
            while (j < length) {
                ({ i, text } = char[j++]);
                parts[i] = text;
            }
            return parts.join('');
        }
        return value;
    }

    var xml = /*#__PURE__*/Object.freeze({
        __proto__: null,
        STRING_XMLENCODING: STRING_XMLENCODING,
        STRING_SPACE: STRING_SPACE,
        STRING_TABSPACE: STRING_TABSPACE,
        isPlainText: isPlainText,
        pushIndent: pushIndent,
        pushIndentArray: pushIndentArray,
        replaceIndent: replaceIndent,
        replaceTab: replaceTab,
        applyTemplate: applyTemplate,
        formatTemplate: formatTemplate,
        replaceCharacterData: replaceCharacterData
    });

    var __awaiter = (undefined && undefined.__awaiter) || function (thisArg, _arguments, P, generator) {
        function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
        return new (P || (P = Promise))(function (resolve, reject) {
            function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
            function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
            function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
            step((generator = generator.apply(thisArg, _arguments || [])).next());
        });
    };
    const extensionsQueue = new Set();
    const optionsQueue = new Map();
    const settings = {};
    const extensionsExternal = new Set();
    const system = {};
    let main;
    let framework;
    function includeExtension(extensions, ext) {
        if (main && !extensions.includes(ext)) {
            ext.application = main;
            extensions.push(ext);
        }
    }
    const checkWritable = (app) => (app === null || app === void 0 ? void 0 : app.initializing) === false && app.length > 0;
    function setFramework(value, cached = false) {
        const reloading = framework !== undefined;
        if (framework !== value) {
            const appBase = cached ? value.cached() : value.create();
            if (!reloading) {
                Object.assign(appBase.userSettings, settings);
            }
            Object.assign(settings, appBase.userSettings);
            main = appBase.application;
            main.userSettings = settings;
            const { builtInExtensions, extensions } = main;
            extensions.length = 0;
            settings.builtInExtensions.forEach(namespace => {
                const ext = builtInExtensions[namespace];
                if (ext) {
                    includeExtension(extensions, ext);
                }
                else {
                    namespace += '.';
                    for (const name in builtInExtensions) {
                        if (name.startsWith(namespace)) {
                            includeExtension(extensions, builtInExtensions[name]);
                        }
                    }
                }
            });
            framework = value;
            if (reloading) {
                Object.keys(system).forEach(attr => delete system[attr]);
            }
            Object.assign(system, value.system);
        }
        if (reloading) {
            reset();
        }
    }
    function setViewModel(data) {
        if (main) {
            main.viewModel = data;
        }
    }
    function parseDocument(...elements) {
        if (main) {
            const extensionManager = main.extensionManager;
            for (const item of extensionsQueue) {
                extensionManager.include(item);
            }
            for (const [name, options] of optionsQueue.entries()) {
                configure(name, options);
            }
            extensionsQueue.clear();
            optionsQueue.clear();
            if (!main.closed) {
                return main.parseDocument(...elements);
            }
            else if (!settings.showErrorMessages || confirm('ERROR: Document is closed. Reset and rerun?')) {
                main.reset();
                return main.parseDocument(...elements);
            }
        }
        else if (settings.showErrorMessages) {
            alert('ERROR: Framework not installed.');
        }
        return new PromiseHandler();
    }
    function parseDocumentAsync(...elements) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield parseDocument(...elements);
        });
    }
    function include(value, options) {
        if (main) {
            if (typeof value === 'string') {
                value = value.trim();
                value = main.builtInExtensions[value] || retrieve(value);
            }
            if (value instanceof squared.base.Extension) {
                extensionsExternal.add(value);
                if (!main.extensionManager.include(value)) {
                    extensionsQueue.add(value);
                }
                if (options) {
                    configure(value, options);
                }
                return true;
            }
        }
        return false;
    }
    function exclude(value) {
        if (main) {
            const extensionManager = main.extensionManager;
            if (typeof value === 'string') {
                value = extensionManager.retrieve(value.trim());
            }
            if (value instanceof squared.base.Extension) {
                extensionsQueue.delete(value);
                extensionsExternal.delete(value);
                return extensionManager.exclude(value);
            }
        }
        return false;
    }
    function configure(value, options) {
        if (isPlainObject(options)) {
            if (typeof value === 'string') {
                if (main) {
                    value = value.trim();
                    const extension = main.extensionManager.retrieve(value) || findSet(extensionsQueue, item => item.name === value);
                    if (extension) {
                        Object.assign(extension.options, options);
                        return true;
                    }
                    else {
                        optionsQueue.set(value, options);
                        return true;
                    }
                }
            }
            else if (value instanceof squared.base.Extension) {
                Object.assign(value.options, options);
                return true;
            }
        }
        return false;
    }
    function retrieve(value) {
        let result = null;
        if (main) {
            result = main.extensionManager.retrieve(value);
            if (result === null) {
                for (const ext of extensionsExternal) {
                    if (ext.name === value) {
                        return ext;
                    }
                }
            }
        }
        return result;
    }
    function reset() {
        main === null || main === void 0 ? void 0 : main.reset();
    }
    function ready() {
        return (main === null || main === void 0 ? void 0 : main.initializing) === false && !main.closed;
    }
    function close() {
        if (checkWritable(main)) {
            main.finalize();
        }
    }
    function copyToDisk(value, options) {
        if (checkWritable(main) && isString(value)) {
            main.finalize();
            main.copyToDisk(value, options);
        }
    }
    function appendToArchive(value, options) {
        if (checkWritable(main) && isString(value)) {
            main.finalize();
            main.appendToArchive(value, options);
        }
    }
    function saveToArchive(value, options) {
        if (checkWritable(main)) {
            main.finalize();
            main.saveToArchive(value, options);
        }
    }
    function createFrom(value, options) {
        var _a;
        if (checkWritable(main) && isString(value) && isPlainObject(options) && ((_a = options.assets) === null || _a === void 0 ? void 0 : _a.length)) {
            main.createFrom(value, options);
        }
    }
    function appendFromArchive(value, options) {
        var _a;
        if (checkWritable(main) && isString(value) && isPlainObject(options) && ((_a = options.assets) === null || _a === void 0 ? void 0 : _a.length)) {
            main.appendFromArchive(value, options);
        }
    }
    function toString() {
        return (main === null || main === void 0 ? void 0 : main.toString()) || '';
    }
    const lib = {
        base: {
            Container,
            PromiseHandler
        },
        client,
        color,
        css,
        dom,
        math,
        regex,
        session,
        util,
        xml
    };

    exports.appendFromArchive = appendFromArchive;
    exports.appendToArchive = appendToArchive;
    exports.close = close;
    exports.configure = configure;
    exports.copyToDisk = copyToDisk;
    exports.createFrom = createFrom;
    exports.exclude = exclude;
    exports.include = include;
    exports.lib = lib;
    exports.parseDocument = parseDocument;
    exports.parseDocumentAsync = parseDocumentAsync;
    exports.ready = ready;
    exports.reset = reset;
    exports.retrieve = retrieve;
    exports.saveToArchive = saveToArchive;
    exports.setFramework = setFramework;
    exports.setViewModel = setViewModel;
    exports.settings = settings;
    exports.system = system;
    exports.toString = toString;

    Object.defineProperty(exports, '__esModule', { value: true });

})));
