/* squared 2.1.3
   https://github.com/anpham6/squared */

(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined'
        ? factory(exports)
        : typeof define === 'function' && define.amd
        ? define(['exports'], factory)
        : ((global = typeof globalThis !== 'undefined' ? globalThis : global || self), factory((global.squared = {})));
})(this, function (exports) {
    'use strict';

    const DECIMAL = '-?(?:\\d+(?:\\.\\d+)?|\\d*\\.\\d+)';
    const UNIT_LENGTH = 'px|em|pt|rem|ch|pc|vw|vh|vmin|vmax|mm|cm|in|ex|Q';
    const STRING = {
        DECIMAL,
        PERCENT: '-?\\d+(?:\\.\\d+)?%',
        LENGTH: `(${DECIMAL})(${UNIT_LENGTH})?`,
        LENGTH_PERCENTAGE: `(${DECIMAL}(?:${UNIT_LENGTH}|%)?)`,
        UNIT_LENGTH,
        DATAURI: '(?:data:([^,]+),)?(.+?)',
        CSS_SELECTOR_LABEL: '[\\.#]?[A-Za-z][\\w\\-]*',
        CSS_SELECTOR_PSEUDO_ELEMENT: '::[A-Za-z\\-]+',
        CSS_SELECTOR_PSEUDO_CLASS: ':[A-Za-z\\-]+(?:\\(\\s*([^)]+)\\s*\\))?',
        CSS_SELECTOR_ATTR:
            '\\[((?:\\*\\|)?(?:[A-Za-z\\-]+:)?[A-Za-z\\-]+)(?:([~^$*|])?=(?:"((?:[^"]|\\\\")+)"|\'((?:[^\']|\\\')+)\'|([^\\s\\]]+))\\s*(i)?)?\\]',
        CSS_ANGLE: `(${DECIMAL})(deg|rad|turn|grad)`,
        CSS_TIME: `(${DECIMAL})(s|ms)`,
        CSS_RESOLUTION: `(${DECIMAL})(dpi|dpcm|dppx)`,
        CSS_CALC: 'calc\\((.+)\\)',
    };
    const FILE = {
        NAME: /[/\\]?(([^/\\]+?)\.([^/\\]+?))$/,
        PROTOCOL: /^([A-Za-z]{3,}:\/\/)([A-Za-z\d\-.]+)(:\d+)?(\/[^?]*)?[?]?(.*)?$/,
        SVG: /\.svg\s*$/i,
    };
    const CSS = {
        URL: /^\s*url\((.+)\)\s*$/,
        HEX: /^#[A-Fa-f\d]{3,8}$/,
        RGBA: /rgba?\(\s*(\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+%?)\s*)?\)/,
        HSLA: /hsla?\(\s*(\d+),\s*(\d+)%,\s*(\d+)%(?:,\s*([\d.]+%?)\s*)?\)/,
        SELECTOR_G: new RegExp(
            `\\s*((?:${STRING.CSS_SELECTOR_ATTR}|${STRING.CSS_SELECTOR_PSEUDO_CLASS}|${STRING.CSS_SELECTOR_PSEUDO_ELEMENT}|${STRING.CSS_SELECTOR_LABEL})+|[>~+*])\\s*`,
            'g'
        ),
        SELECTOR_LABEL: new RegExp(STRING.CSS_SELECTOR_LABEL),
        SELECTOR_PSEUDO_ELEMENT: new RegExp(STRING.CSS_SELECTOR_PSEUDO_ELEMENT),
        SELECTOR_PSEUDO_CLASS: new RegExp(STRING.CSS_SELECTOR_PSEUDO_CLASS),
        SELECTOR_ATTR: new RegExp(STRING.CSS_SELECTOR_ATTR),
    };
    const TRANSFORM = {
        MATRIX: new RegExp(
            `(matrix|matrix3d)\\(\\s*(${DECIMAL})${`,\\s*(${DECIMAL})`.repeat(5)}(?:${`,\\s*(${DECIMAL})`.repeat(
                10
            )})?\\s*\\)`
        ),
        ROTATE: new RegExp(
            `(rotate(?:[XYZ]|3d)?)\\(\\s*(?:(${DECIMAL}),\\s*(${DECIMAL}),\\s*(${DECIMAL}),\\s*)?${STRING.CSS_ANGLE}\\s*\\)`
        ),
        SCALE: new RegExp(`(scale(?:[XYZ]|3d)?)\\(\\s*(${DECIMAL})(?:,\\s*(${DECIMAL}))?(?:,\\s*(${DECIMAL}))?\\s*\\)`),
        TRANSLATE: new RegExp(
            `(translate(?:[XYZ]|3d)?)\\(\\s*${STRING.LENGTH_PERCENTAGE}(?:,\\s*${STRING.LENGTH_PERCENTAGE})?(?:,\\s*${STRING.LENGTH_PERCENTAGE})?\\s*\\)`
        ),
        SKEW: new RegExp(`(skew[XY]?)\\(\\s*${STRING.CSS_ANGLE}(?:,\\s*${STRING.CSS_ANGLE})?\\s*\\)`),
        PERSPECTIVE: new RegExp(`(perspective)\\(\\s*${STRING.LENGTH_PERCENTAGE}\\s*\\)`),
    };

    var regex = /*#__PURE__*/ Object.freeze({
        __proto__: null,
        STRING: STRING,
        FILE: FILE,
        CSS: CSS,
        TRANSFORM: TRANSFORM,
    });

    const CACHE_CAMELCASE = {};
    const CACHE_TRIMBOTH = {};
    const CACHE_TRIMSTRING = {};
    const REGEXP_DECIMAL = new RegExp(`^${STRING.DECIMAL}$`);
    const REGEXP_NONWORD = /[^\w]+/g;
    const REGEXP_NONWORDNUM = /[^A-Za-z\d]+/g;
    function promisify(fn) {
        return (...args) => {
            return new Promise((resolve, reject) => {
                try {
                    resolve(fn.call(null, ...args));
                } catch (err) {
                    reject(err);
                }
            });
        };
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
            case 'bmpf':
            case 'bmpp':
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
            case 'vtt':
                return 'text/vtt';
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
            case 'image/x-ms-bmp':
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
            case 'text/vtt':
                return 'vtt';
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
    function formatXml(value, closeEmpty = true, caseSensitive, indentChar = '\t') {
        const pattern = /\s*(<(\/)?(!?[A-Za-z\d-]+)([^>]*)>)(\s*)([^<]*)/g;
        const patternContent = /^([\S\s]*?)(\s*)$/;
        const lines = [];
        let output = '',
            indent = -1,
            ignoreIndent,
            match;
        while ((match = pattern.exec(value))) {
            const tag = match[1];
            const closing = match[2] === '/';
            const content = patternContent.exec(match[6]);
            lines.push({
                tag,
                closing,
                tagName: caseSensitive ? match[3].toUpperCase() : match[3],
                didClose: !closing && tag.endsWith('/>'),
                leadingSpace: match[5],
                content: content[1],
                trailingSpace: content[2],
            });
        }
        const length = lines.length;
        for (let i = 0; i < length; ++i) {
            const line = lines[i];
            let previousIndent = indent,
                single,
                willClose;
            if (line.closing) {
                const previous = lines[i - 1];
                if (
                    !previous.closing &&
                    previous.tagName === previous.tagName &&
                    previous.leadingSpace.includes('\n')
                ) {
                    output += indentChar.repeat(previousIndent);
                }
                --indent;
            } else {
                const next = lines[i + 1];
                const tagName = line.tagName;
                single = next && next.closing && tagName === next.tagName;
                if (!line.didClose) {
                    for (let j = i + 1, k = 0; j < length; ++j) {
                        const item = lines[j];
                        if (tagName === item.tagName) {
                            if (item.closing) {
                                if (k-- === 0) {
                                    willClose = true;
                                    break;
                                }
                            } else {
                                ++k;
                            }
                        }
                    }
                    if (closeEmpty && !line.content && line.tag[1] !== '!') {
                        if (single || !willClose) {
                            line.tag = line.tag.replace(/\s*>$/, ' />');
                            if (willClose) {
                                ++i;
                            }
                        } else if (willClose) {
                            ++indent;
                        }
                    } else if (willClose) {
                        ++indent;
                    }
                }
                ++previousIndent;
            }
            const tags = line.tag.split('\n');
            for (let j = 0, q = tags.length; j < q; ++j) {
                const partial = tags[j];
                if (ignoreIndent) {
                    output += partial;
                    ignoreIndent = false;
                } else {
                    const depth = previousIndent + Math.min(j, 1);
                    output += (depth > 0 ? indentChar.repeat(depth) : '') + partial.trim();
                }
                if (single && q === 1) {
                    ignoreIndent = true;
                } else {
                    output += '\n';
                }
            }
            if (line.content) {
                let leadingSpace = line.leadingSpace;
                if (leadingSpace && leadingSpace.includes('\n')) {
                    leadingSpace = leadingSpace.replace(/^[^\n]+/, '');
                }
                output +=
                    (leadingSpace ? leadingSpace : '') +
                    line.content +
                    (leadingSpace || line.trailingSpace.includes('\n') ? '\n' : '');
            }
        }
        return output;
    }
    function hasKeys(obj) {
        for (const attr in obj) {
            return obj[attr] !== undefined;
        }
        return false;
    }
    function capitalize(value, upper) {
        return upper === false
            ? value[0].toLowerCase() + value.substring(1)
            : value[0].toUpperCase() + value.substring(1).toLowerCase();
    }
    function convertHyphenated(value, char = '-') {
        let result = value[0].toLowerCase(),
            lower = true;
        for (let i = 1, length = value.length; i < length; ++i) {
            const ch = value[i];
            const upper = ch === ch.toUpperCase();
            result += lower && upper && ch !== char ? char + ch.toLowerCase() : ch;
            lower = !upper;
        }
        return result;
    }
    function convertCamelCase(value, char = '-') {
        const cacheData = CACHE_CAMELCASE[value];
        if (cacheData) {
            return cacheData;
        }
        let i = value.indexOf(char);
        if (i === -1) {
            return (CACHE_CAMELCASE[value] = value);
        }
        let result = value.substring(0, i++),
            previous = true;
        const length = value.length;
        while (i < length) {
            const ch = value[i++];
            if (ch === char) {
                previous = true;
            } else if (previous) {
                result += ch.toUpperCase();
                previous = false;
            } else {
                result += ch;
            }
        }
        return (CACHE_CAMELCASE[value] = result);
    }
    function convertWord(value, dash) {
        return value.replace(dash ? REGEXP_NONWORDNUM : REGEXP_NONWORD, '_');
    }
    function convertInt(value, fallback = 0) {
        const result = parseInt(value);
        return !isNaN(result) ? result : fallback;
    }
    function convertFloat(value, fallback = 0) {
        const result = parseFloat(value);
        return !isNaN(result) ? result : fallback;
    }
    function convertBase64(value) {
        let result = '';
        const data = new Uint8Array(value);
        for (let i = 0, length = data.byteLength; i < length; ++i) {
            result += String.fromCharCode(data[i]);
        }
        return window.btoa(result);
    }
    function delimitString(options, ...appending) {
        const { value, not, remove, sort } = options;
        const length = appending.length;
        if (length === 1 && !value) {
            return appending[0];
        }
        const delimiter = options.delimiter || ', ';
        const values = value ? value.split(delimiter) : [];
        for (let i = 0; i < length; ++i) {
            const append = appending[i];
            if (append) {
                if (not && values.includes(not[i])) {
                    continue;
                }
                const index = values.findIndex(item => item === append);
                if (index === -1) {
                    values.push(append);
                } else if (remove) {
                    values.splice(index, 1);
                }
            }
        }
        if (sort) {
            values.sort(typeof sort === 'function' ? sort : undefined);
        }
        return values.join(delimiter);
    }
    function spliceString(value, index, length) {
        return index === 0 ? value.substring(length) : value.substring(0, index) + value.substring(index + length);
    }
    function splitPair(value, char, trim, last) {
        const index = !last ? value.indexOf(char) : value.lastIndexOf(char);
        if (index !== -1) {
            const start = value.substring(0, index);
            const end = value.substring(index + char.length);
            return !trim ? [start, end] : [start.trim(), end.trim()];
        }
        return !trim ? [value, ''] : [value.trim(), ''];
    }
    function splitPairStart(value, char, trim, last) {
        const index = !last ? value.indexOf(char) : value.lastIndexOf(char);
        const result = index !== -1 ? value.substring(0, index) : value;
        return !trim ? result : result.trim();
    }
    function splitPairEnd(value, char, trim, last) {
        const index = !last ? value.indexOf(char) : value.lastIndexOf(char);
        if (index !== -1) {
            const result = value.substring(index + char.length);
            return !trim ? result : result.trim();
        }
        return '';
    }
    function splitEnclosing(value, prefix, separator = '', opening = '(', closing = ')') {
        if (separator.length > 1) {
            return [];
        }
        prefix || (prefix = opening);
        const prefixed = prefix !== opening;
        const combined = prefixed ? prefix + opening : opening;
        const result = [];
        const appendValues = segment => {
            for (let seg of segment.split(separator)) {
                seg = seg.trim();
                if (seg) {
                    result.push(seg);
                }
            }
        };
        let position = 0,
            index = -1;
        const length = value.length;
        while ((index = value.indexOf(combined, position)) !== -1) {
            let preceding = '';
            if (index !== position) {
                let segment = value.substring(position, index);
                if (separator) {
                    segment = segment.trim();
                    if (segment) {
                        appendValues(segment);
                        if (!prefixed) {
                            const joined = lastItemOf(result);
                            if (joined && value.substring(index - joined.length, index + 1) === joined + prefix) {
                                preceding = joined;
                                --result.length;
                            }
                        }
                    }
                } else {
                    result.push(segment);
                }
            }
            let found;
            for (let i = index + (prefixed ? prefix.length : 0) + 1, open = 1, close = 0; i < length; ++i) {
                switch (value[i]) {
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
                            if (value[i] === separator) {
                                break;
                            }
                        }
                        position = i + 1;
                        result.push(preceding + value.substring(index, i).trim());
                    } else {
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
                if (segment) {
                    appendValues(segment);
                }
            } else {
                result.push(excess);
            }
        }
        return result;
    }
    function lastItemOf(value) {
        return value[value.length - 1];
    }
    function minMaxOf(list, predicate, operator) {
        let result = list[0],
            value = predicate(result, 0, list);
        if (isNaN(value)) {
            result = null;
            value = operator[0] === '>' ? -Infinity : Infinity;
        }
        for (let i = 1, length = list.length; i < length; ++i) {
            const item = list[i];
            const itemValue = predicate(item, i, list);
            if (isNaN(itemValue)) {
                continue;
            }
            switch (operator) {
                case '>':
                    if (itemValue > value) {
                        result = item;
                        value = itemValue;
                    }
                    break;
                case '<':
                    if (itemValue < value) {
                        result = item;
                        value = itemValue;
                    }
                    break;
                case '>=':
                    if (itemValue >= value) {
                        result = item;
                        value = itemValue;
                    }
                    break;
                case '<=':
                    if (itemValue <= value) {
                        result = item;
                        value = itemValue;
                    }
                    break;
            }
        }
        return [result, value];
    }
    function hasBit(value, offset) {
        return (value & offset) === offset;
    }
    function isNumber(value) {
        return REGEXP_DECIMAL.test(value);
    }
    function isString(value) {
        return typeof value === 'string' && !isEmptyString(value);
    }
    function isArray(value) {
        return Array.isArray(value) && value.length > 0;
    }
    function isObject(value) {
        return typeof value === 'object' && value !== null;
    }
    function isPlainObject(value) {
        return isObject(value) && (value.constructor === Object || Object.getPrototypeOf(Object(value)) === null);
    }
    function isEmptyString(value) {
        for (let i = 0, length = value.length; i < length; ++i) {
            const n = value.charCodeAt(i);
            if ((n < 14 && n > 8) || n === 32) {
                continue;
            }
            return false;
        }
        return true;
    }
    function isEqual(source, other) {
        if (source === other) {
            return true;
        } else if (Array.isArray(source) && Array.isArray(other)) {
            const length = source.length;
            if (length === other.length) {
                for (let i = 0; i < length; ++i) {
                    if (source[i] !== other[i]) {
                        return false;
                    }
                }
                return true;
            }
        } else if (isPlainObject(source) && isPlainObject(other)) {
            if (Object.keys(source).length === Object.keys(other).length) {
                for (const attr in source) {
                    const a = source[attr];
                    const b = other[attr];
                    if (a !== b && !(isPlainObject(a) && isPlainObject(b) && isEqual(a, b))) {
                        return false;
                    }
                }
                return true;
            }
        }
        return false;
    }
    function cloneInstance(value) {
        return Object.assign(Object.create(Object.getPrototypeOf(value)), value);
    }
    function cloneObject(data, options) {
        let target, deep;
        if (options) {
            ({ target, deep } = options);
        }
        const nested = deep ? { deep } : undefined;
        if (Array.isArray(data)) {
            if (!target || !Array.isArray(target)) {
                target = [];
            }
            for (let i = 0, length = data.length; i < length; ++i) {
                const value = data[i];
                if (Array.isArray(value)) {
                    target.push(cloneObject(value, nested));
                } else if (deep && isPlainObject(value)) {
                    target.push(cloneObject(value, nested));
                } else {
                    target.push(value);
                }
            }
        } else if (isObject(data)) {
            if (!target || !isObject(target)) {
                target = {};
            }
            for (const attr in data) {
                const value = data[attr];
                if (Array.isArray(value)) {
                    target[attr] = deep ? cloneObject(value, nested) : value;
                } else if (isPlainObject(value)) {
                    target[attr] = cloneObject(value, nested);
                } else {
                    target[attr] = value;
                }
            }
        }
        return target;
    }
    function resolvePath(value, href) {
        value = value.trim();
        if (value && !FILE.PROTOCOL.test(value)) {
            const pathname = (href ? href.replace(location.origin, '') : location.pathname)
                .replace(/\\/g, '/')
                .split('/');
            --pathname.length;
            value = value.replace(/\\/g, '/');
            if (value[0] === '/') {
                return location.origin + value;
            } else if (value.startsWith('../')) {
                const trailing = [];
                for (const dir of value.split('/')) {
                    if (dir === '..') {
                        if (trailing.length === 0) {
                            pathname.pop();
                        } else {
                            --trailing.length;
                        }
                    } else {
                        trailing.push(dir);
                    }
                }
                value = trailing.join('/');
            } else if (value.startsWith('./')) {
                value = value.substring(2);
            }
            return location.origin + pathname.join('/') + '/' + value;
        }
        return value;
    }
    function trimBoth(value, pattern) {
        const match = (
            CACHE_TRIMBOTH[pattern] || (CACHE_TRIMBOTH[pattern] = new RegExp(`^(${pattern})+([\\s\\S]*?)\\1$`))
        ).exec(value);
        return match ? match[2] : value;
    }
    function trimString(value, pattern) {
        const match = (
            CACHE_TRIMSTRING[pattern] ||
            (CACHE_TRIMSTRING[pattern] = new RegExp(`^(?:${pattern})*([\\s\\S]*?)(?:${pattern})*$`))
        ).exec(value);
        return match ? match[1] : value;
    }
    function trimStart(value, pattern) {
        return value.replace(new RegExp(`^(?:${pattern})+`), '');
    }
    function trimEnd(value, pattern) {
        return value.replace(new RegExp(`(?:${pattern})+$`), '');
    }
    function fromLastIndexOf(value, ...char) {
        let i = 0;
        while (i < char.length) {
            const index = value.lastIndexOf(char[i++]);
            if (index !== -1) {
                return value.substring(index + 1);
            }
        }
        return value;
    }
    function* searchObject(obj, value) {
        const start = value[0] === '*';
        const end = lastItemOf(value) === '*';
        const search =
            start && end
                ? a => a.includes(value.replace(/^\*/, '').replace(/\*$/, ''))
                : start
                ? a => a.endsWith(value.replace(/^\*/, ''))
                : end
                ? a => a.startsWith(value.replace(/\*$/, ''))
                : a => a === value;
        for (const attr in obj) {
            if (search(attr)) {
                yield attr;
            }
        }
    }
    function hasValue(value) {
        return value !== undefined && value !== null && value !== '';
    }
    function withinRange(a, b, offset = 1) {
        return b >= a - offset && b <= a + offset;
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
            let current = dest,
                i = 0;
            do {
                const name = attrs[i];
                const value = current[name];
                if (i === length - 2) {
                    if (!hasValue(value)) {
                        current[name] = attrs[i + 1];
                    }
                    break;
                } else if (name) {
                    if (value === undefined || value === null) {
                        current = {};
                        current[name] = current;
                    } else if (isObject(value)) {
                        current = value;
                    } else {
                        break;
                    }
                } else {
                    break;
                }
            } while (++i);
        }
    }
    function sortNumber(values, ascending = true) {
        return ascending ? values.sort((a, b) => a - b) : values.sort((a, b) => b - a);
    }
    function findSet(list, predicate) {
        let i = 0;
        for (const item of list) {
            if (predicate(item, i++, list)) {
                return item;
            }
        }
    }
    function sortByArray(list, ...attrs) {
        let length = attrs.length,
            ascending = attrs[length - 1];
        if (typeof ascending === 'boolean') {
            length = --attrs.length;
        } else {
            ascending = true;
        }
        return list.sort((a, b) => {
            let valueA = a,
                valueB = b;
            for (let i = 0; i < length; ++i) {
                const attr = attrs[i];
                if (typeof attr !== 'string') {
                    continue;
                }
                for (const name of attr.split('.')) {
                    const vA = valueA[name];
                    const vB = valueB[name];
                    const oA = vA !== undefined && vA !== null;
                    const oB = vB !== undefined && vB !== null;
                    if (oA && oB) {
                        valueA = vA;
                        valueB = vB;
                    } else if (!oA && !oB) {
                        return 0;
                    } else if (oA) {
                        return ascending ? -1 : 1;
                    } else {
                        return ascending ? 1 : -1;
                    }
                }
            }
            if (valueA !== valueB && typeof valueA !== 'object' && typeof valueB !== 'object') {
                if (ascending) {
                    return valueA < valueB ? -1 : 1;
                }
                return valueA > valueB ? -1 : 1;
            }
            return 0;
        });
    }
    function flatArray(list, depth = 1, current = 0) {
        const result = [];
        for (let i = 0, length = list.length; i < length; ++i) {
            const item = list[i];
            if (current < depth && Array.isArray(item)) {
                if (item.length) {
                    result.push(...flatArray(item, depth, current + 1));
                }
            } else if (item !== undefined && item !== null) {
                result.push(item);
            }
        }
        return result;
    }
    function spliceArray(list, predicate, callback, deleteCount) {
        let deleted = 0;
        for (let i = 0; i < list.length; ++i) {
            const item = list[i];
            if (predicate(item, i, list)) {
                if (callback) {
                    callback(item, i, list);
                }
                list.splice(i--, 1);
                if (++deleted === deleteCount) {
                    break;
                }
            }
        }
        return list;
    }
    function partitionArray(list, predicate) {
        const valid = [];
        const invalid = [];
        for (let i = 0, length = list.length; i < length; ++i) {
            const item = list[i];
            if (predicate(item, i, list)) {
                valid.push(item);
            } else {
                invalid.push(item);
            }
        }
        return [valid, invalid];
    }
    function sameArray(list, predicate) {
        const length = list.length;
        if (length) {
            let baseValue;
            for (let i = 0; i < length; ++i) {
                const value = predicate(list[i], i, list);
                if (i === 0) {
                    baseValue = value;
                } else if (value !== baseValue) {
                    return false;
                }
            }
            return true;
        }
        return false;
    }
    function joinArray(list, predicate, char = '') {
        let result = '';
        for (let i = 0, length = list.length; i < length; ++i) {
            const value = predicate(list[i], i, list);
            if (value) {
                result += result ? char + value : value;
            }
        }
        return result;
    }
    function iterateArray(list, predicate, start = 0, end = Infinity) {
        for (let i = Math.max(start, 0), length = Math.min(list.length, end); i < length; ++i) {
            const result = predicate(list[i], i, list);
            if (result === true) {
                return Infinity;
            }
        }
        return length;
    }
    function iterateReverseArray(list, predicate, start = 0, end = Infinity) {
        start = Math.max(start, 0);
        for (let i = Math.min(list.length, end) - 1; i >= start; --i) {
            const result = predicate(list[i], i, list);
            if (result === true) {
                return Infinity;
            }
        }
        return length;
    }
    function replaceMap(list, predicate) {
        for (let i = 0, length = list.length; i < length; ++i) {
            list[i] = predicate(list[i], i, list);
        }
        return list;
    }
    function plainMap(list, predicate) {
        const length = list.length;
        const result = new Array(length);
        for (let i = 0; i < length; ++i) {
            result[i] = predicate(list[i], i, list);
        }
        return result;
    }

    var util = /*#__PURE__*/ Object.freeze({
        __proto__: null,
        promisify: promisify,
        parseMimeType: parseMimeType,
        fromMimeType: fromMimeType,
        formatXml: formatXml,
        hasKeys: hasKeys,
        capitalize: capitalize,
        convertHyphenated: convertHyphenated,
        convertCamelCase: convertCamelCase,
        convertWord: convertWord,
        convertInt: convertInt,
        convertFloat: convertFloat,
        convertBase64: convertBase64,
        delimitString: delimitString,
        spliceString: spliceString,
        splitPair: splitPair,
        splitPairStart: splitPairStart,
        splitPairEnd: splitPairEnd,
        splitEnclosing: splitEnclosing,
        lastItemOf: lastItemOf,
        minMaxOf: minMaxOf,
        hasBit: hasBit,
        isNumber: isNumber,
        isString: isString,
        isArray: isArray,
        isObject: isObject,
        isPlainObject: isPlainObject,
        isEmptyString: isEmptyString,
        isEqual: isEqual,
        cloneInstance: cloneInstance,
        cloneObject: cloneObject,
        resolvePath: resolvePath,
        trimBoth: trimBoth,
        trimString: trimString,
        trimStart: trimStart,
        trimEnd: trimEnd,
        fromLastIndexOf: fromLastIndexOf,
        searchObject: searchObject,
        hasValue: hasValue,
        withinRange: withinRange,
        assignEmptyProperty: assignEmptyProperty,
        assignEmptyValue: assignEmptyValue,
        sortNumber: sortNumber,
        findSet: findSet,
        sortByArray: sortByArray,
        flatArray: flatArray,
        spliceArray: spliceArray,
        partitionArray: partitionArray,
        sameArray: sameArray,
        joinArray: joinArray,
        iterateArray: iterateArray,
        iterateReverseArray: iterateReverseArray,
        replaceMap: replaceMap,
        plainMap: plainMap,
    });

    function isPlatform(value) {
        const platform = navigator.platform.toLowerCase();
        return typeof value === 'string'
            ? platform.includes(value.toLowerCase())
            : (hasBit(value, 1 /* WINDOWS */) && platform.includes('win')) ||
                  (hasBit(value, 2 /* MAC */) && /(mac|iphone|ipad|ipod)/.test(platform)) ||
                  (hasBit(value, 4 /* LINUX */) && platform.includes('linux'));
    }
    function isUserAgent(value) {
        const userAgent = navigator.userAgent;
        let client = 1; /* CHROME */
        if (userAgent.includes('Safari/') && !userAgent.includes('Chrome/')) {
            client = 2 /* SAFARI */;
        } else if (userAgent.includes('Firefox/')) {
            client = 4 /* FIREFOX */;
        } else if (userAgent.includes('Edg/')) {
            client = 8 /* EDGE */;
        }
        if (typeof value === 'string') {
            const name = value.toLowerCase();
            value = 0;
            if (name.includes('chrome')) {
                value |= 1 /* CHROME */;
            }
            if (name.includes('safari')) {
                value |= 2 /* SAFARI */;
            }
            if (name.includes('firefox')) {
                value |= 4 /* FIREFOX */;
            }
            if (name.includes('edge')) {
                value |= 8 /* EDGE */;
            }
        }
        return hasBit(value, client);
    }
    function getDeviceDPI() {
        return window.devicePixelRatio * 96;
    }

    var client = /*#__PURE__*/ Object.freeze({
        __proto__: null,
        isPlatform: isPlatform,
        isUserAgent: isUserAgent,
        getDeviceDPI: getDeviceDPI,
    });

    const REGEXP_DECIMALNOTAION = /^(-?\d+\.\d+)e(-?\d+)$/;
    const REGEXP_FRACTION = /^(-?\d+)\.(\d*?)(0{5,}|9{5,})\d*$/;
    const REGEXP_TRAILINGZERO = /\.(\d*?)(0+)$/;
    function convertDecimalNotation(value) {
        const match = REGEXP_DECIMALNOTAION.exec(value.toString());
        return match ? (parseInt(match[2]) > 0 ? Number.MAX_SAFE_INTEGER.toString() : '0') : value.toString();
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
        } else if (
            (value >= 0 && value <= 1 / Math.pow(10, precision)) ||
            (value < 0 && value >= -1 / Math.pow(10, precision))
        ) {
            return '0';
        }
        if (base !== 0) {
            precision += base.toString().length;
        }
        return truncateTrailingZero(value.toPrecision(precision));
    }
    function truncateFraction(value) {
        if (value !== Math.floor(value)) {
            const match = REGEXP_FRACTION.exec(convertDecimalNotation(value));
            if (match) {
                const trailing = match[2];
                if (!trailing) {
                    return Math.round(value);
                }
                const leading = match[1];
                return parseFloat(value.toPrecision((leading !== '0' ? leading.length : 0) + trailing.length));
            }
        }
        return value;
    }
    function truncateTrailingZero(value) {
        const match = REGEXP_TRAILINGZERO.exec(value);
        return match ? value.substring(0, value.length - match[match[1] ? 2 : 0].length) : value;
    }
    function convertRadian(value) {
        return (value * Math.PI) / 180;
    }
    function triangulate(a, b, clen) {
        const c = 180 - a - b;
        return [
            (clen / Math.sin(convertRadian(c))) * Math.sin(convertRadian(a)),
            (clen / Math.sin(convertRadian(c))) * Math.sin(convertRadian(b)),
        ];
    }
    function absoluteAngle(start, end) {
        const x = end.x - start.x;
        const y = end.y - start.y;
        return (Math.atan2(y, x) * 180) / Math.PI;
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
        } else if (value > max) {
            value = max;
        }
        return value;
    }
    function multipleOf(values, min = 0, offset) {
        const length = values.length;
        if (length > 1) {
            const increment = Math.min(...values);
            if (offset && offset.length === length) {
                for (let i = 0; i < length; ++i) {
                    min = Math.max(min, offset[i] + values[i]);
                }
            } else {
                offset = null;
                min = Math.max(min, increment);
            }
            let value = 0;
            while (value < min) {
                value += increment;
            }
            const start = (offset && offset[0]) || 0;
            let valid;
            while (!valid) {
                const total = start + value;
                for (let i = 1; i < length; ++i) {
                    const multiple = (offset ? offset[i] : 0) + values[i];
                    if (total % multiple === 0) {
                        valid = true;
                    } else {
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
        for (let i = 3, j = 0; i <= accuracy; i += 2, ++j) {
            result += (Math.pow(value, i) / factorial(i)) * (j % 2 === 0 ? -1 : 1);
        }
        return result;
    }
    function cos(value, accuracy = 10) {
        value = convertRadian(value);
        let result = 1;
        for (let i = 2, j = 0; i <= accuracy; i += 2, ++j) {
            result += (Math.pow(value, i) / factorial(i)) * (j % 2 === 0 ? -1 : 1);
        }
        return result;
    }
    function tan(value, accuracy = 11) {
        return sin(value, accuracy) / cos(value, accuracy);
    }
    function factorial(value) {
        let result = 2;
        for (let i = 3; i <= value; ++i) {
            result *= i;
        }
        return result;
    }
    function hypotenuse(a, b) {
        return Math.sqrt(Math.pow(a, 2) + Math.pow(b, 2));
    }

    var math = /*#__PURE__*/ Object.freeze({
        __proto__: null,
        equal: equal,
        moreEqual: moreEqual,
        lessEqual: lessEqual,
        truncate: truncate,
        truncateFraction: truncateFraction,
        truncateTrailingZero: truncateTrailingZero,
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
        hypotenuse: hypotenuse,
    });

    const STRING_HEX = '0123456789ABCDEF';
    const COLOR_CSS3 = [
        {
            value: '#000000',
            key: 'black',
            rgb: { r: 0, g: 0, b: 0 },
            hsl: { h: 0, s: 0, l: 0 },
        },
        {
            value: '#696969',
            key: 'dimgray',
            rgb: { r: 105, g: 105, b: 105 },
            hsl: { h: 0, s: 0, l: 41 },
        },
        {
            value: '#696969',
            key: 'dimgrey',
            rgb: { r: 105, g: 105, b: 105 },
            hsl: { h: 0, s: 0, l: 41 },
        },
        {
            value: '#808080',
            key: 'gray',
            rgb: { r: 128, g: 128, b: 128 },
            hsl: { h: 0, s: 0, l: 50 },
        },
        {
            value: '#808080',
            key: 'grey',
            rgb: { r: 128, g: 128, b: 128 },
            hsl: { h: 0, s: 0, l: 50 },
        },
        {
            value: '#A9A9A9',
            key: 'darkgray',
            rgb: { r: 169, g: 169, b: 169 },
            hsl: { h: 0, s: 0, l: 66 },
        },
        {
            value: '#A9A9A9',
            key: 'darkgrey',
            rgb: { r: 169, g: 169, b: 169 },
            hsl: { h: 0, s: 0, l: 66 },
        },
        {
            value: '#C0C0C0',
            key: 'silver',
            rgb: { r: 192, g: 192, b: 192 },
            hsl: { h: 0, s: 0, l: 75 },
        },
        {
            value: '#D3D3D3',
            key: 'lightgray',
            rgb: { r: 211, g: 211, b: 211 },
            hsl: { h: 0, s: 0, l: 83 },
        },
        {
            value: '#D3D3D3',
            key: 'lightgrey',
            rgb: { r: 211, g: 211, b: 211 },
            hsl: { h: 0, s: 0, l: 83 },
        },
        {
            value: '#DCDCDC',
            key: 'gainsboro',
            rgb: { r: 220, g: 220, b: 220 },
            hsl: { h: 0, s: 0, l: 86 },
        },
        {
            value: '#F5F5F5',
            key: 'whitesmoke',
            rgb: { r: 245, g: 245, b: 245 },
            hsl: { h: 0, s: 0, l: 96 },
        },
        {
            value: '#FFFFFF',
            key: 'white',
            rgb: { r: 255, g: 255, b: 255 },
            hsl: { h: 0, s: 0, l: 100 },
        },
        {
            value: '#BC8F8F',
            key: 'rosybrown',
            rgb: { r: 188, g: 143, b: 143 },
            hsl: { h: 0, s: 25, l: 65 },
        },
        {
            value: '#CD5C5C',
            key: 'indianred',
            rgb: { r: 205, g: 92, b: 92 },
            hsl: { h: 0, s: 53, l: 58 },
        },
        {
            value: '#A52A2A',
            key: 'brown',
            rgb: { r: 165, g: 42, b: 42 },
            hsl: { h: 0, s: 59, l: 41 },
        },
        {
            value: '#B22222',
            key: 'firebrick',
            rgb: { r: 178, g: 34, b: 34 },
            hsl: { h: 0, s: 68, l: 42 },
        },
        {
            value: '#F08080',
            key: 'lightcoral',
            rgb: { r: 240, g: 128, b: 128 },
            hsl: { h: 0, s: 79, l: 72 },
        },
        {
            value: '#800000',
            key: 'maroon',
            rgb: { r: 128, g: 0, b: 0 },
            hsl: { h: 0, s: 100, l: 25 },
        },
        {
            value: '#8B0000',
            key: 'darkred',
            rgb: { r: 139, g: 0, b: 0 },
            hsl: { h: 0, s: 100, l: 27 },
        },
        {
            value: '#FF0000',
            key: 'red',
            rgb: { r: 255, g: 0, b: 0 },
            hsl: { h: 0, s: 100, l: 50 },
        },
        {
            value: '#FFFAFA',
            key: 'snow',
            rgb: { r: 255, g: 250, b: 250 },
            hsl: { h: 0, s: 100, l: 99 },
        },
        {
            value: '#FFE4E1',
            key: 'mistyrose',
            rgb: { r: 255, g: 228, b: 225 },
            hsl: { h: 6, s: 100, l: 94 },
        },
        {
            value: '#FA8072',
            key: 'salmon',
            rgb: { r: 250, g: 128, b: 114 },
            hsl: { h: 6, s: 93, l: 71 },
        },
        {
            value: '#FF6347',
            key: 'tomato',
            rgb: { r: 255, g: 99, b: 71 },
            hsl: { h: 9, s: 100, l: 64 },
        },
        {
            value: '#E9967A',
            key: 'darksalmon',
            rgb: { r: 233, g: 150, b: 122 },
            hsl: { h: 15, s: 72, l: 70 },
        },
        {
            value: '#FF7F50',
            key: 'coral',
            rgb: { r: 255, g: 127, b: 80 },
            hsl: { h: 16, s: 100, l: 66 },
        },
        {
            value: '#FF4500',
            key: 'orangered',
            rgb: { r: 255, g: 69, b: 0 },
            hsl: { h: 16, s: 100, l: 50 },
        },
        {
            value: '#FFA07A',
            key: 'lightsalmon',
            rgb: { r: 255, g: 160, b: 122 },
            hsl: { h: 17, s: 100, l: 74 },
        },
        {
            value: '#A0522D',
            key: 'sienna',
            rgb: { r: 160, g: 82, b: 45 },
            hsl: { h: 19, s: 56, l: 40 },
        },
        {
            value: '#FFF5EE',
            key: 'seashell',
            rgb: { r: 255, g: 245, b: 238 },
            hsl: { h: 25, s: 100, l: 97 },
        },
        {
            value: '#D2691E',
            key: 'chocolate',
            rgb: { r: 210, g: 105, b: 30 },
            hsl: { h: 25, s: 75, l: 47 },
        },
        {
            value: '#8B4513',
            key: 'saddlebrown',
            rgb: { r: 139, g: 69, b: 19 },
            hsl: { h: 25, s: 76, l: 31 },
        },
        {
            value: '#F4A460',
            key: 'sandybrown',
            rgb: { r: 244, g: 164, b: 96 },
            hsl: { h: 28, s: 87, l: 67 },
        },
        {
            value: '#FFDAB9',
            key: 'peachpuff',
            rgb: { r: 255, g: 218, b: 185 },
            hsl: { h: 28, s: 100, l: 86 },
        },
        {
            value: '#CD853F',
            key: 'peru',
            rgb: { r: 205, g: 133, b: 63 },
            hsl: { h: 30, s: 59, l: 53 },
        },
        {
            value: '#FAF0E6',
            key: 'linen',
            rgb: { r: 250, g: 240, b: 230 },
            hsl: { h: 30, s: 67, l: 94 },
        },
        {
            value: '#FFE4C4',
            key: 'bisque',
            rgb: { r: 255, g: 228, b: 196 },
            hsl: { h: 33, s: 100, l: 88 },
        },
        {
            value: '#FF8C00',
            key: 'darkorange',
            rgb: { r: 255, g: 140, b: 0 },
            hsl: { h: 33, s: 100, l: 50 },
        },
        {
            value: '#DEB887',
            key: 'burlywood',
            rgb: { r: 222, g: 184, b: 135 },
            hsl: { h: 34, s: 57, l: 70 },
        },
        {
            value: '#FAEBD7',
            key: 'antiquewhite',
            rgb: { r: 250, g: 235, b: 215 },
            hsl: { h: 34, s: 78, l: 91 },
        },
        {
            value: '#D2B48C',
            key: 'tan',
            rgb: { r: 210, g: 180, b: 140 },
            hsl: { h: 34, s: 44, l: 69 },
        },
        {
            value: '#FFDEAD',
            key: 'navajowhite',
            rgb: { r: 255, g: 222, b: 173 },
            hsl: { h: 36, s: 100, l: 84 },
        },
        {
            value: '#FFEBCD',
            key: 'blanchedalmond',
            rgb: { r: 255, g: 235, b: 205 },
            hsl: { h: 36, s: 100, l: 90 },
        },
        {
            value: '#FFEFD5',
            key: 'papayawhip',
            rgb: { r: 255, g: 239, b: 213 },
            hsl: { h: 37, s: 100, l: 92 },
        },
        {
            value: '#FFE4B5',
            key: 'moccasin',
            rgb: { r: 255, g: 228, b: 181 },
            hsl: { h: 38, s: 100, l: 85 },
        },
        {
            value: '#FFA500',
            key: 'orange',
            rgb: { r: 255, g: 165, b: 0 },
            hsl: { h: 39, s: 100, l: 50 },
        },
        {
            value: '#F5DEB3',
            key: 'wheat',
            rgb: { r: 245, g: 222, b: 179 },
            hsl: { h: 39, s: 77, l: 83 },
        },
        {
            value: '#FDF5E6',
            key: 'oldlace',
            rgb: { r: 253, g: 245, b: 230 },
            hsl: { h: 39, s: 85, l: 95 },
        },
        {
            value: '#FFFAF0',
            key: 'floralwhite',
            rgb: { r: 255, g: 250, b: 240 },
            hsl: { h: 40, s: 100, l: 97 },
        },
        {
            value: '#B8860B',
            key: 'darkgoldenrod',
            rgb: { r: 184, g: 134, b: 11 },
            hsl: { h: 43, s: 89, l: 38 },
        },
        {
            value: '#DAA520',
            key: 'goldenrod',
            rgb: { r: 218, g: 165, b: 32 },
            hsl: { h: 43, s: 74, l: 49 },
        },
        {
            value: '#FFF8DC',
            key: 'cornsilk',
            rgb: { r: 255, g: 248, b: 220 },
            hsl: { h: 48, s: 100, l: 93 },
        },
        {
            value: '#FFD700',
            key: 'gold',
            rgb: { r: 255, g: 215, b: 0 },
            hsl: { h: 51, s: 100, l: 50 },
        },
        {
            value: '#FFFACD',
            key: 'lemonchiffon',
            rgb: { r: 255, g: 250, b: 205 },
            hsl: { h: 54, s: 100, l: 90 },
        },
        {
            value: '#F0E68C',
            key: 'khaki',
            rgb: { r: 240, g: 230, b: 140 },
            hsl: { h: 54, s: 77, l: 75 },
        },
        {
            value: '#EEE8AA',
            key: 'palegoldenrod',
            rgb: { r: 238, g: 232, b: 170 },
            hsl: { h: 55, s: 67, l: 80 },
        },
        {
            value: '#BDB76B',
            key: 'darkkhaki',
            rgb: { r: 189, g: 183, b: 107 },
            hsl: { h: 56, s: 38, l: 58 },
        },
        {
            value: '#F5F5DC',
            key: 'beige',
            rgb: { r: 245, g: 245, b: 220 },
            hsl: { h: 60, s: 56, l: 91 },
        },
        {
            value: '#FAFAD2',
            key: 'lightgoldenrodyellow',
            rgb: { r: 250, g: 250, b: 210 },
            hsl: { h: 60, s: 80, l: 90 },
        },
        {
            value: '#808000',
            key: 'olive',
            rgb: { r: 128, g: 128, b: 0 },
            hsl: { h: 60, s: 100, l: 25 },
        },
        {
            value: '#FFFF00',
            key: 'yellow',
            rgb: { r: 255, g: 255, b: 0 },
            hsl: { h: 60, s: 100, l: 50 },
        },
        {
            value: '#FFFFE0',
            key: 'lightyellow',
            rgb: { r: 255, g: 255, b: 224 },
            hsl: { h: 60, s: 100, l: 94 },
        },
        {
            value: '#FFFFF0',
            key: 'ivory',
            rgb: { r: 255, g: 255, b: 240 },
            hsl: { h: 60, s: 100, l: 97 },
        },
        {
            value: '#6B8E23',
            key: 'olivedrab',
            rgb: { r: 107, g: 142, b: 35 },
            hsl: { h: 80, s: 60, l: 35 },
        },
        {
            value: '#9ACD32',
            key: 'yellowgreen',
            rgb: { r: 154, g: 205, b: 50 },
            hsl: { h: 80, s: 61, l: 50 },
        },
        {
            value: '#556B2F',
            key: 'darkolivegreen',
            rgb: { r: 85, g: 107, b: 47 },
            hsl: { h: 82, s: 39, l: 30 },
        },
        {
            value: '#ADFF2F',
            key: 'greenyellow',
            rgb: { r: 173, g: 255, b: 47 },
            hsl: { h: 84, s: 100, l: 59 },
        },
        {
            value: '#7FFF00',
            key: 'chartreuse',
            rgb: { r: 127, g: 255, b: 0 },
            hsl: { h: 90, s: 100, l: 50 },
        },
        {
            value: '#7CFC00',
            key: 'lawngreen',
            rgb: { r: 124, g: 252, b: 0 },
            hsl: { h: 90, s: 100, l: 49 },
        },
        {
            value: '#8FBC8F',
            key: 'darkseagreen',
            rgb: { r: 143, g: 188, b: 143 },
            hsl: { h: 120, s: 25, l: 65 },
        },
        {
            value: '#228B22',
            key: 'forestgreen',
            rgb: { r: 34, g: 139, b: 34 },
            hsl: { h: 120, s: 61, l: 34 },
        },
        {
            value: '#32CD32',
            key: 'limegreen',
            rgb: { r: 50, g: 205, b: 50 },
            hsl: { h: 120, s: 61, l: 50 },
        },
        {
            value: '#90EE90',
            key: 'lightgreen',
            rgb: { r: 144, g: 238, b: 144 },
            hsl: { h: 120, s: 73, l: 75 },
        },
        {
            value: '#98FB98',
            key: 'palegreen',
            rgb: { r: 152, g: 251, b: 152 },
            hsl: { h: 120, s: 93, l: 79 },
        },
        {
            value: '#006400',
            key: 'darkgreen',
            rgb: { r: 0, g: 100, b: 0 },
            hsl: { h: 120, s: 100, l: 20 },
        },
        {
            value: '#008000',
            key: 'green',
            rgb: { r: 0, g: 128, b: 0 },
            hsl: { h: 120, s: 100, l: 25 },
        },
        {
            value: '#00FF00',
            key: 'lime',
            rgb: { r: 0, g: 255, b: 0 },
            hsl: { h: 120, s: 100, l: 50 },
        },
        {
            value: '#F0FFF0',
            key: 'honeydew',
            rgb: { r: 240, g: 255, b: 240 },
            hsl: { h: 120, s: 100, l: 97 },
        },
        {
            value: '#2E8B57',
            key: 'seagreen',
            rgb: { r: 46, g: 139, b: 87 },
            hsl: { h: 146, s: 50, l: 36 },
        },
        {
            value: '#3CB371',
            key: 'mediumseagreen',
            rgb: { r: 60, g: 179, b: 113 },
            hsl: { h: 147, s: 50, l: 47 },
        },
        {
            value: '#00FF7F',
            key: 'springgreen',
            rgb: { r: 0, g: 255, b: 127 },
            hsl: { h: 150, s: 100, l: 50 },
        },
        {
            value: '#F5FFFA',
            key: 'mintcream',
            rgb: { r: 245, g: 255, b: 250 },
            hsl: { h: 150, s: 100, l: 98 },
        },
        {
            value: '#00FA9A',
            key: 'mediumspringgreen',
            rgb: { r: 0, g: 250, b: 154 },
            hsl: { h: 157, s: 100, l: 49 },
        },
        {
            value: '#66CDAA',
            key: 'mediumaquamarine',
            rgb: { r: 102, g: 205, b: 170 },
            hsl: { h: 160, s: 51, l: 60 },
        },
        {
            value: '#7FFFD4',
            key: 'aquamarine',
            rgb: { r: 127, g: 255, b: 212 },
            hsl: { h: 160, s: 100, l: 75 },
        },
        {
            value: '#40E0D0',
            key: 'turquoise',
            rgb: { r: 64, g: 224, b: 208 },
            hsl: { h: 174, s: 72, l: 56 },
        },
        {
            value: '#20B2AA',
            key: 'lightseagreen',
            rgb: { r: 32, g: 178, b: 170 },
            hsl: { h: 177, s: 70, l: 41 },
        },
        {
            value: '#48D1CC',
            key: 'mediumturquoise',
            rgb: { r: 72, g: 209, b: 204 },
            hsl: { h: 178, s: 60, l: 55 },
        },
        {
            value: '#2F4F4F',
            key: 'darkslategray',
            rgb: { r: 47, g: 79, b: 79 },
            hsl: { h: 180, s: 25, l: 25 },
        },
        {
            value: '#2F4F4F',
            key: 'darkslategrey',
            rgb: { r: 47, g: 79, b: 79 },
            hsl: { h: 180, s: 25, l: 25 },
        },
        {
            value: '#AFEEEE',
            key: 'paleturquoise',
            rgb: { r: 175, g: 238, b: 238 },
            hsl: { h: 180, s: 65, l: 81 },
        },
        {
            value: '#008080',
            key: 'teal',
            rgb: { r: 0, g: 128, b: 128 },
            hsl: { h: 180, s: 100, l: 25 },
        },
        {
            value: '#008B8B',
            key: 'darkcyan',
            rgb: { r: 0, g: 139, b: 139 },
            hsl: { h: 180, s: 100, l: 27 },
        },
        {
            value: '#00FFFF',
            key: 'aqua',
            rgb: { r: 0, g: 255, b: 255 },
            hsl: { h: 180, s: 100, l: 50 },
        },
        {
            value: '#00FFFF',
            key: 'cyan',
            rgb: { r: 0, g: 255, b: 255 },
            hsl: { h: 180, s: 100, l: 50 },
        },
        {
            value: '#E0FFFF',
            key: 'lightcyan',
            rgb: { r: 224, g: 255, b: 255 },
            hsl: { h: 180, s: 100, l: 94 },
        },
        {
            value: '#F0FFFF',
            key: 'azure',
            rgb: { r: 240, g: 255, b: 255 },
            hsl: { h: 180, s: 100, l: 97 },
        },
        {
            value: '#00CED1',
            key: 'darkturquoise',
            rgb: { r: 0, g: 206, b: 209 },
            hsl: { h: 181, s: 100, l: 41 },
        },
        {
            value: '#5F9EA0',
            key: 'cadetblue',
            rgb: { r: 95, g: 158, b: 160 },
            hsl: { h: 182, s: 25, l: 50 },
        },
        {
            value: '#B0E0E6',
            key: 'powderblue',
            rgb: { r: 176, g: 224, b: 230 },
            hsl: { h: 187, s: 52, l: 80 },
        },
        {
            value: '#ADD8E6',
            key: 'lightblue',
            rgb: { r: 173, g: 216, b: 230 },
            hsl: { h: 195, s: 53, l: 79 },
        },
        {
            value: '#00BFFF',
            key: 'deepskyblue',
            rgb: { r: 0, g: 191, b: 255 },
            hsl: { h: 195, s: 100, l: 50 },
        },
        {
            value: '#87CEEB',
            key: 'skyblue',
            rgb: { r: 135, g: 206, b: 235 },
            hsl: { h: 197, s: 71, l: 73 },
        },
        {
            value: '#87CEFA',
            key: 'lightskyblue',
            rgb: { r: 135, g: 206, b: 250 },
            hsl: { h: 203, s: 92, l: 75 },
        },
        {
            value: '#4682B4',
            key: 'steelblue',
            rgb: { r: 70, g: 130, b: 180 },
            hsl: { h: 207, s: 44, l: 49 },
        },
        {
            value: '#F0F8FF',
            key: 'aliceblue',
            rgb: { r: 240, g: 248, b: 255 },
            hsl: { h: 208, s: 100, l: 97 },
        },
        {
            value: '#1E90FF',
            key: 'dodgerblue',
            rgb: { r: 30, g: 144, b: 255 },
            hsl: { h: 210, s: 100, l: 56 },
        },
        {
            value: '#708090',
            key: 'slategray',
            rgb: { r: 112, g: 128, b: 144 },
            hsl: { h: 210, s: 13, l: 50 },
        },
        {
            value: '#708090',
            key: 'slategrey',
            rgb: { r: 112, g: 128, b: 144 },
            hsl: { h: 210, s: 13, l: 50 },
        },
        {
            value: '#778899',
            key: 'lightslategray',
            rgb: { r: 119, g: 136, b: 153 },
            hsl: { h: 210, s: 14, l: 53 },
        },
        {
            value: '#778899',
            key: 'lightslategrey',
            rgb: { r: 119, g: 136, b: 153 },
            hsl: { h: 210, s: 14, l: 53 },
        },
        {
            value: '#B0C4DE',
            key: 'lightsteelblue',
            rgb: { r: 176, g: 196, b: 222 },
            hsl: { h: 214, s: 41, l: 78 },
        },
        {
            value: '#6495ED',
            key: 'cornflower',
            rgb: { r: 100, g: 149, b: 237 },
            hsl: { h: 219, s: 79, l: 66 },
        },
        {
            value: '#4169E1',
            key: 'royalblue',
            rgb: { r: 65, g: 105, b: 225 },
            hsl: { h: 225, s: 73, l: 57 },
        },
        {
            value: '#191970',
            key: 'midnightblue',
            rgb: { r: 25, g: 25, b: 112 },
            hsl: { h: 240, s: 64, l: 27 },
        },
        {
            value: '#E6E6FA',
            key: 'lavender',
            rgb: { r: 230, g: 230, b: 250 },
            hsl: { h: 240, s: 67, l: 94 },
        },
        {
            value: '#000080',
            key: 'navy',
            rgb: { r: 0, g: 0, b: 128 },
            hsl: { h: 240, s: 100, l: 25 },
        },
        {
            value: '#00008B',
            key: 'darkblue',
            rgb: { r: 0, g: 0, b: 139 },
            hsl: { h: 240, s: 100, l: 27 },
        },
        {
            value: '#0000CD',
            key: 'mediumblue',
            rgb: { r: 0, g: 0, b: 205 },
            hsl: { h: 240, s: 100, l: 40 },
        },
        {
            value: '#0000FF',
            key: 'blue',
            rgb: { r: 0, g: 0, b: 255 },
            hsl: { h: 240, s: 100, l: 50 },
        },
        {
            value: '#F8F8FF',
            key: 'ghostwhite',
            rgb: { r: 248, g: 248, b: 255 },
            hsl: { h: 240, s: 100, l: 99 },
        },
        {
            value: '#6A5ACD',
            key: 'slateblue',
            rgb: { r: 106, g: 90, b: 205 },
            hsl: { h: 248, s: 53, l: 58 },
        },
        {
            value: '#483D8B',
            key: 'darkslateblue',
            rgb: { r: 72, g: 61, b: 139 },
            hsl: { h: 248, s: 39, l: 39 },
        },
        {
            value: '#7B68EE',
            key: 'mediumslateblue',
            rgb: { r: 123, g: 104, b: 238 },
            hsl: { h: 249, s: 80, l: 67 },
        },
        {
            value: '#9370DB',
            key: 'mediumpurple',
            rgb: { r: 147, g: 112, b: 219 },
            hsl: { h: 260, s: 60, l: 65 },
        },
        {
            value: '#8A2BE2',
            key: 'blueviolet',
            rgb: { r: 138, g: 43, b: 226 },
            hsl: { h: 271, s: 76, l: 53 },
        },
        {
            value: '#4B0082',
            key: 'indigo',
            rgb: { r: 75, g: 0, b: 130 },
            hsl: { h: 275, s: 100, l: 25 },
        },
        {
            value: '#9932CC',
            key: 'darkorchid',
            rgb: { r: 153, g: 50, b: 204 },
            hsl: { h: 280, s: 61, l: 50 },
        },
        {
            value: '#9400D3',
            key: 'darkviolet',
            rgb: { r: 148, g: 0, b: 211 },
            hsl: { h: 282, s: 100, l: 41 },
        },
        {
            value: '#BA55D3',
            key: 'mediumorchid',
            rgb: { r: 186, g: 85, b: 211 },
            hsl: { h: 288, s: 59, l: 58 },
        },
        {
            value: '#D8BFD8',
            key: 'thistle',
            rgb: { r: 216, g: 191, b: 216 },
            hsl: { h: 300, s: 24, l: 80 },
        },
        {
            value: '#DDA0DD',
            key: 'plum',
            rgb: { r: 221, g: 160, b: 221 },
            hsl: { h: 300, s: 47, l: 75 },
        },
        {
            value: '#EE82EE',
            key: 'violet',
            rgb: { r: 238, g: 130, b: 238 },
            hsl: { h: 300, s: 76, l: 72 },
        },
        {
            value: '#800080',
            key: 'purple',
            rgb: { r: 128, g: 0, b: 128 },
            hsl: { h: 300, s: 100, l: 25 },
        },
        {
            value: '#8B008B',
            key: 'darkmagenta',
            rgb: { r: 139, g: 0, b: 139 },
            hsl: { h: 300, s: 100, l: 27 },
        },
        {
            value: '#FF00FF',
            key: 'fuchsia',
            rgb: { r: 255, g: 0, b: 255 },
            hsl: { h: 300, s: 100, l: 50 },
        },
        {
            value: '#FF00FF',
            key: 'magenta',
            rgb: { r: 255, g: 0, b: 255 },
            hsl: { h: 300, s: 100, l: 50 },
        },
        {
            value: '#DA70D6',
            key: 'orchid',
            rgb: { r: 218, g: 112, b: 214 },
            hsl: { h: 302, s: 59, l: 65 },
        },
        {
            value: '#C71585',
            key: 'mediumvioletred',
            rgb: { r: 199, g: 21, b: 133 },
            hsl: { h: 322, s: 81, l: 43 },
        },
        {
            value: '#FF1493',
            key: 'deeppink',
            rgb: { r: 255, g: 20, b: 147 },
            hsl: { h: 328, s: 100, l: 54 },
        },
        {
            value: '#FF69B4',
            key: 'hotpink',
            rgb: { r: 255, g: 105, b: 180 },
            hsl: { h: 330, s: 100, l: 71 },
        },
        {
            value: '#FFF0F5',
            key: 'lavenderblush',
            rgb: { r: 255, g: 240, b: 245 },
            hsl: { h: 340, s: 100, l: 97 },
        },
        {
            value: '#DB7093',
            key: 'palevioletred',
            rgb: { r: 219, g: 112, b: 147 },
            hsl: { h: 340, s: 60, l: 65 },
        },
        {
            value: '#DC143C',
            key: 'crimson',
            rgb: { r: 220, g: 20, b: 60 },
            hsl: { h: 348, s: 83, l: 47 },
        },
        {
            value: '#FFC0CB',
            key: 'pink',
            rgb: { r: 255, g: 192, b: 203 },
            hsl: { h: 350, s: 100, l: 88 },
        },
        {
            value: '#FFB6C1',
            key: 'lightpink',
            rgb: { r: 255, g: 182, b: 193 },
            hsl: { h: 351, s: 100, l: 86 },
        },
    ];
    const CACHE_COLORDATA = {};
    const CACHE_COLORRESULT = new Map();
    function hue2rgb(t, p, q) {
        if (t < 0) {
            t += 1;
        } else if (t > 1) {
            t -= 1;
        }
        if (t < 1 / 6) {
            return p + (q - p) * 6 * t;
        } else if (t < 1 / 2) {
            return q;
        } else if (t < 2 / 3) {
            return p + (q - p) * (2 / 3 - t) * 6;
        }
        return p;
    }
    const convertOpacity = value => parseFloat(value) / (value.includes('%') ? 100 : 1);
    const clampOpacity = value => clamp(value) * 255;
    function findColorName(value) {
        if (CACHE_COLORRESULT.size === 0) {
            for (let i = 0, length = COLOR_CSS3.length; i < length; ++i) {
                const color = COLOR_CSS3[i];
                CACHE_COLORRESULT.set(color.key, color);
            }
        }
        return CACHE_COLORRESULT.get(value.toLowerCase());
    }
    function findColorShade(value) {
        const rgba = parseRGBA(value);
        if (rgba) {
            const hsl = convertHSLA(rgba);
            const result = [];
            let baseline = -1;
            for (let i = 0, length = COLOR_CSS3.length; i < length; ++i) {
                const color = COLOR_CSS3[i];
                if (color.value === value) {
                    return color;
                } else if (baseline !== -1) {
                    if (baseline === color.hsl.h) {
                        result.push(color);
                    }
                } else if (hsl.h <= color.hsl.h) {
                    result.push(color);
                    baseline = color.hsl.h;
                }
            }
            const length = result.length;
            if (length === 1) {
                return result[0];
            } else if (length > 1) {
                const total = hsl.l + hsl.s;
                let nearest = Infinity,
                    index = -1;
                for (let i = 0; i < length; ++i) {
                    const { l, s } = result[i].hsl;
                    const offset = Math.abs(total - (l + s));
                    if (offset < nearest) {
                        nearest = offset;
                        index = i;
                    }
                }
                return result[index];
            }
            return COLOR_CSS3[COLOR_CSS3.length - 1];
        }
    }
    function parseColor(value, opacity = 1, transparency) {
        if (value && (value !== 'transparent' || transparency)) {
            let colorData = CACHE_COLORDATA[value];
            if (colorData) {
                return colorData;
            }
            let key = '',
                rgba;
            if (value[0] === '#') {
                rgba = parseRGBA(value);
            } else if (value === 'transparent') {
                rgba = { r: 0, g: 0, b: 0, a: 0 };
                key = 'transparent';
            } else {
                let match = CSS.RGBA.exec(value);
                if (match) {
                    rgba = {
                        r: parseInt(match[1]),
                        g: parseInt(match[2]),
                        b: parseInt(match[3]),
                        a: match[4] ? convertOpacity(match[4]) * 255 : clampOpacity(opacity),
                    };
                } else {
                    match = CSS.HSLA.exec(value);
                    if (match) {
                        rgba = convertRGBA({
                            h: parseInt(match[1]),
                            s: parseInt(match[2]),
                            l: parseInt(match[3]),
                            a: clamp(match[4] ? convertOpacity(match[4]) : opacity),
                        });
                    } else {
                        const color = findColorName(value);
                        if (color) {
                            rgba = Object.assign(Object.assign({}, color.rgb), { a: clampOpacity(opacity) });
                            key = value;
                        } else {
                            rgba = null;
                        }
                    }
                }
            }
            if (rgba) {
                const a = rgba.a;
                if (a > 0 || transparency) {
                    const hexAsString = getHexCode(rgba.r, rgba.g, rgba.b);
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
                        transparent: opacity === 0,
                    };
                    if (opacity === 1) {
                        CACHE_COLORDATA[value] = colorData;
                    }
                    CACHE_COLORDATA[valueAsRGBA] = colorData;
                    return colorData;
                }
            }
        }
        return null;
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
        const result = parseColor(
            formatRGBA({
                r: (r + Math.round((base - r) * percent)) % 255,
                g: (g + Math.round((base - g) * percent)) % 255,
                b: (b + Math.round((base - b) * percent)) % 255,
                a: value.a,
            })
        );
        if (cacheName) {
            CACHE_COLORDATA[cacheName] = result;
        }
        return result;
    }
    function getHexCode(...values) {
        let output = '';
        for (let i = 0, length = values.length; i < length; ++i) {
            const rgb = Math.max(0, Math.min(values[i], 255));
            output += isNaN(rgb) ? '00' : STRING_HEX.charAt((rgb - (rgb % 16)) / 16) + STRING_HEX.charAt(rgb % 16);
        }
        return output;
    }
    function convertHex(value) {
        return `#${getHexCode(value.r, value.g, value.b) + (value.a < 255 ? getHexCode(value.a) : '')}`;
    }
    function parseRGBA(value) {
        if (CSS.HEX.test(value)) {
            value = value.substring(1);
            let a = 255;
            switch (value.length) {
                case 4:
                    a = parseInt(value[3].repeat(2), 16);
                case 3:
                    value = value[0].repeat(2) + value[1].repeat(2) + value[2].repeat(2);
                    break;
                case 5:
                    value += value[4];
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
                    a,
                };
            }
        }
        return null;
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
        } else {
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
            a: value.a / 255,
        };
    }
    function convertRGBA(value) {
        let { h, s, l, a } = value;
        h /= 360;
        s /= 100;
        l /= 100;
        let r, g, b;
        if (s === 0) {
            r = l;
            g = l;
            b = l;
        } else {
            const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
            const p = 2 * l - q;
            r = hue2rgb(h + 1 / 3, p, q);
            g = hue2rgb(h, p, q);
            b = hue2rgb(h - 1 / 3, p, q);
        }
        r = Math.round(Math.min(r, 1) * 255);
        g = Math.round(Math.min(g, 1) * 255);
        b = Math.round(Math.min(b, 1) * 255);
        a = Math.round(Math.min(a, 1) * 255);
        return { r, g, b, a };
    }
    function formatRGBA(value) {
        return `rgb${
            value.a < 255 ? 'a' : ''
        }(${value.r}, ${value.g}, ${value.b + (value.a < 255 ? ', ' + (value.a / 255).toPrecision(2) : '')})`;
    }
    function formatHSLA(value) {
        return `hsl${
            value.a < 255 ? 'a' : ''
        }(${value.h}, ${value.s}%, ${value.l}%${value.a < 255 ? ', ' + (value.a / 255).toPrecision(2) : ''})`;
    }

    var color = /*#__PURE__*/ Object.freeze({
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
        formatHSLA: formatHSLA,
    });

    var PLATFORM;
    (function (PLATFORM) {
        PLATFORM[(PLATFORM['WINDOWS'] = 1)] = 'WINDOWS';
        PLATFORM[(PLATFORM['MAC'] = 2)] = 'MAC';
        PLATFORM[(PLATFORM['LINUX'] = 4)] = 'LINUX';
    })(PLATFORM || (PLATFORM = {}));
    var USER_AGENT;
    (function (USER_AGENT) {
        USER_AGENT[(USER_AGENT['CHROME'] = 1)] = 'CHROME';
        USER_AGENT[(USER_AGENT['SAFARI'] = 2)] = 'SAFARI';
        USER_AGENT[(USER_AGENT['FIREFOX'] = 4)] = 'FIREFOX';
        USER_AGENT[(USER_AGENT['EDGE'] = 8)] = 'EDGE';
    })(USER_AGENT || (USER_AGENT = {}));
    var CSS_UNIT;
    (function (CSS_UNIT) {
        CSS_UNIT[(CSS_UNIT['NONE'] = 0)] = 'NONE';
        CSS_UNIT[(CSS_UNIT['LENGTH'] = 1)] = 'LENGTH';
        CSS_UNIT[(CSS_UNIT['PERCENT'] = 2)] = 'PERCENT';
        CSS_UNIT[(CSS_UNIT['TIME'] = 4)] = 'TIME';
        CSS_UNIT[(CSS_UNIT['ANGLE'] = 8)] = 'ANGLE';
        CSS_UNIT[(CSS_UNIT['INTEGER'] = 16)] = 'INTEGER';
        CSS_UNIT[(CSS_UNIT['DECIMAL'] = 32)] = 'DECIMAL';
    })(CSS_UNIT || (CSS_UNIT = {}));
    var CSS_TRAITS;
    (function (CSS_TRAITS) {
        CSS_TRAITS[(CSS_TRAITS['CALC'] = 1)] = 'CALC';
        CSS_TRAITS[(CSS_TRAITS['SHORTHAND'] = 2)] = 'SHORTHAND';
        CSS_TRAITS[(CSS_TRAITS['LAYOUT'] = 4)] = 'LAYOUT';
        CSS_TRAITS[(CSS_TRAITS['CONTAIN'] = 8)] = 'CONTAIN';
        CSS_TRAITS[(CSS_TRAITS['COLOR'] = 16)] = 'COLOR';
        CSS_TRAITS[(CSS_TRAITS['DEPRECATED'] = 32)] = 'DEPRECATED';
        CSS_TRAITS[(CSS_TRAITS['NONE'] = 64)] = 'NONE';
        CSS_TRAITS[(CSS_TRAITS['AUTO'] = 128)] = 'AUTO';
        CSS_TRAITS[(CSS_TRAITS['UNIT'] = 256)] = 'UNIT';
    })(CSS_TRAITS || (CSS_TRAITS = {}));

    var constant = /*#__PURE__*/ Object.freeze({
        __proto__: null,
        get PLATFORM() {
            return PLATFORM;
        },
        get USER_AGENT() {
            return USER_AGENT;
        },
        get CSS_UNIT() {
            return CSS_UNIT;
        },
        get CSS_TRAITS() {
            return CSS_TRAITS;
        },
    });

    let SESSION_MAP = {};
    newSessionInit('0');
    function newSessionInit(value) {
        const elementMap = new WeakMap();
        SESSION_MAP[value] = elementMap;
        return elementMap;
    }
    function resetSessionAll() {
        SESSION_MAP = { '0': SESSION_MAP['0'] };
    }
    function setElementCache(element, attr, data, sessionId = '0') {
        let elementMap = SESSION_MAP[sessionId].get(element);
        if (!elementMap) {
            elementMap = {};
            SESSION_MAP[sessionId].set(element, elementMap);
        }
        elementMap[attr] = data;
    }
    function getElementCache(element, attr, sessionId) {
        const elementMap = getElementData(element, sessionId);
        if (elementMap) {
            return elementMap[attr];
        }
    }
    function getElementData(element, sessionId) {
        var _a;
        if (!sessionId) {
            sessionId = (_a = SESSION_MAP['0'].get(element)) === null || _a === void 0 ? void 0 : _a.sessionId;
            if (!sessionId) {
                return;
            }
        }
        return SESSION_MAP[sessionId].get(element);
    }
    function getElementAsNode(element, sessionId) {
        return getElementCache(element, 'node', sessionId) || null;
    }

    var session = /*#__PURE__*/ Object.freeze({
        __proto__: null,
        newSessionInit: newSessionInit,
        resetSessionAll: resetSessionAll,
        setElementCache: setElementCache,
        getElementCache: getElementCache,
        getElementData: getElementData,
        getElementAsNode: getElementAsNode,
    });

    const DOCUMENT_ELEMENT = document.documentElement;
    const DOCUMENT_FIXEDMAP = [9 / 13, 10 / 13, 12 / 13, 16 / 13, 20 / 13, 2, 3];
    let DOCUMENT_FONTMAP;
    let DOCUMENT_FONTBASE;
    let DOCUMENT_FONTSIZE;
    const PATTERN_SIZES = `(\\(\\s*(?:orientation:\\s*(?:portrait|landscape)|(?:max|min)-width:\\s*${STRING.LENGTH_PERCENTAGE})\\s*\\))`;
    const REGEXP_LENGTH = new RegExp(`^${STRING.LENGTH}$`);
    const REGEXP_LENGTHPERCENTAGE = new RegExp(`^${STRING.LENGTH_PERCENTAGE}$`);
    const REGEXP_PERCENT = new RegExp(`^${STRING.PERCENT}$`);
    const REGEXP_ANGLE = new RegExp(`^${STRING.CSS_ANGLE}$`);
    const REGEXP_TIME = new RegExp(`^${STRING.CSS_TIME}$`);
    const REGEXP_RESOLUTION = new RegExp(`^${STRING.CSS_RESOLUTION}$`);
    const REGEXP_CALC = new RegExp(`^${STRING.CSS_CALC}$`);
    const REGEXP_CALCWITHIN = new RegExp(STRING.CSS_CALC);
    const REGEXP_SOURCESIZES = new RegExp(
        `\\s*(?:(?:\\(\\s*)?${PATTERN_SIZES}|(?:\\(\\s*))?\\s*(and|or|not)?\\s*(?:${PATTERN_SIZES}(?:\\s*\\))?)?\\s*(.+)`
    );
    const REGEXP_KEYFRAMES = /((?:\d+%\s*,?\s*)+|from|to)\s*{\s*(.+?)\s*}/;
    const REGEXP_MEDIARULE = /(?:(not|only)?\s*(?:all|screen)\s+and\s+)?((?:\([^)]+\)(?:\s+and\s+)?)+),?\s*/g;
    const REGEXP_MEDIARULECONDITION = /\(([a-z-]+)\s*(:|<?=?|=?>?)?\s*([\w.%]+)?\)(?:\s+and\s+)?/g;
    const REGEXP_VAR = /\s*(.*)var\((--[\w-]+)\s*(?!,\s*var\()(?:,\s*([a-z-]+\([^)]+\)|[^)]+))?\)(.*)/;
    const REGEXP_CUSTOMPROPERTY = /var\(--.+\)/;
    const REGEXP_IMGSRCSET = /^(.*?)(?:\s+([\d.]+)([xw]))?$/;
    const REGEXP_CALCOPERATION = /\s+([+-]\s+|\s*[*/])\s*/;
    const REGEXP_CALCUNIT = /\s*{(\d+)}\s*/;
    const REGEXP_TRANSFORM = /(\w+)\([^)]+\)/g;
    const REGEXP_EMBASED = /\s*-?[\d.]+(?:em|ch|ex)\s*/;
    const CHAR_SPACE = /\s+/;
    const CHAR_SEPARATOR = /\s*,\s*/;
    const CHAR_DIVIDER = /\s*\/\s*/;
    updateDocumentFont();
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
        for (const seg of splitEnclosing(value.trim(), 'calc').map(item => item.trim())) {
            if (seg.includes(' ') && !isCalc(seg)) {
                alignment.push(...seg.split(CHAR_SPACE));
            } else {
                alignment.push(seg);
            }
        }
        const length = alignment.length;
        switch (length) {
            case 1:
            case 2:
                return calculateVarAsString(element, alignment.join(' '), {
                    dimension: ['width', 'height'],
                    boundingBox,
                    parent: false,
                });
            case 3:
            case 4: {
                let horizontal = 0,
                    vertical = 0;
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
                                if (!result) {
                                    return '';
                                }
                                alignment[i] = result;
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
                        const component = trimEnclosing(seg).split(CHAR_SEPARATOR);
                        const q = component.length;
                        if (q >= 3) {
                            const hsl = name.startsWith('hsl');
                            for (let j = 0; j < q; ++j) {
                                const rgb = component[j];
                                if (isCalc(rgb)) {
                                    if (hsl && (j === 1 || j === 2)) {
                                        const result = calculateVar(element, rgb, {
                                            unitType: 2 /* PERCENT */,
                                            supportPercent: true,
                                        });
                                        if (isNaN(result)) {
                                            return '';
                                        }
                                        component[j] = clamp(result, 0, 100) + '%';
                                    } else if (j === 3) {
                                        const percent = rgb.includes('%');
                                        let result = calculateVar(
                                            element,
                                            rgb,
                                            percent ? { unitType: 2 /* PERCENT */ } : { unitType: 32 /* DECIMAL */ }
                                        );
                                        if (isNaN(result)) {
                                            return '';
                                        }
                                        if (percent) {
                                            result /= 100;
                                        }
                                        component[j] = clamp(result).toString();
                                    } else {
                                        const result = calculateVar(element, rgb, {
                                            unitType: 32 /* DECIMAL */,
                                            supportPercent: false,
                                        });
                                        if (isNaN(result)) {
                                            return '';
                                        }
                                        component[j] = clamp(result, 0, 255).toString();
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
        for (let i = 0, length = segments.length; i < length; ++i) {
            const seg = segments[i];
            if (isCalc(seg)) {
                const px = REGEXP_LENGTH.test(seg);
                const result = calculateVar(
                    element,
                    seg,
                    px ? { dimension, boundingBox, min: 0, parent: false } : { unitType, min, supportPercent: false }
                );
                if (isNaN(result)) {
                    return '';
                }
                segments[i] = result + (px ? 'px' : '');
            }
        }
        return segments.join('').trim();
    }
    function calculateAngle(element, value) {
        const result = calculateVar(element, value, { unitType: 8 /* ANGLE */, supportPercent: false });
        if (!isNaN(result)) {
            return result + 'deg';
        }
    }
    function calculatePercent(element, value, clampRange) {
        const percent = value.includes('%');
        let result = calculateVar(element, value, { unitType: percent ? 2 /* PERCENT */ : 32 /* DECIMAL */ });
        if (!isNaN(result)) {
            if (percent) {
                result /= 100;
            }
            return (clampRange ? clamp(result) : result).toString();
        }
        return '';
    }
    function getWritingMode(value) {
        if (value) {
            switch (value) {
                case 'vertical-lr':
                    return 1;
                case 'vertical-rl':
                    return 2;
            }
        }
        return 0;
    }
    function getContentBoxWidth(style) {
        return (
            (hasBorderStyle(style.borderLeftStyle) ? parseFloat(style.borderLeftWidth) : 0) +
            parseFloat(style.paddingLeft) +
            parseFloat(style.paddingRight) +
            (hasBorderStyle(style.borderRightStyle) ? parseFloat(style.borderRightWidth) : 0)
        );
    }
    function getContentBoxHeight(style) {
        return (
            (hasBorderStyle(style.borderTopStyle) ? parseFloat(style.borderTopWidth) : 0) +
            parseFloat(style.paddingTop) +
            parseFloat(style.paddingBottom) +
            (hasBorderStyle(style.borderBottomStyle) ? parseFloat(style.borderBottomWidth) : 0)
        );
    }
    function checkCalculateNumber(operand, operator) {
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
    }
    function checkCalculateOperator(operand, operator) {
        if (operand) {
            switch (operator) {
                case '+':
                case '-':
                    return false;
            }
        }
        return true;
    }
    function getContentBoxDimension(element) {
        if (element) {
            const { width, height } = element.getBoundingClientRect();
            const style = getStyle(element);
            return {
                width: Math.max(0, width - getContentBoxWidth(style)),
                height: Math.max(0, height - getContentBoxHeight(style)),
            };
        }
        return { width: 0, height: 0 };
    }
    function getInnerDimension(horizontal, options) {
        if (options) {
            const screenDimension = options.screenDimension;
            if (screenDimension) {
                return horizontal ? screenDimension.width : screenDimension.height;
            }
        }
        return horizontal ? window.innerWidth : window.innerHeight;
    }
    const hasBorderStyle = value => value !== 'none' && value !== 'hidden';
    const calculateLength = (element, value) =>
        formatVar(calculateVar(element, value, { min: 0, supportPercent: false }));
    const fromFontNamedValue = (index, fixedWidth) =>
        (!fixedWidth ? DOCUMENT_FONTMAP[index] : DOCUMENT_FIXEDMAP[index]).toPrecision(8) + 'rem';
    const isColor = value => /(rgb|hsl)a?/.test(value);
    const formatVar = value => (!isNaN(value) ? value + 'px' : '');
    const formatDecimal = value => (!isNaN(value) ? value.toString() : '');
    const trimEnclosing = value => value.substring(1, value.length - 1);
    const CSS_PROPERTIES = {
        alignContent: {
            trait: 8 /* CONTAIN */,
            value: 'normal',
        },
        alignItems: {
            trait: 8 /* CONTAIN */,
            value: 'normal',
        },
        alignSelf: {
            trait: 8 /* CONTAIN */,
            value: 'auto',
        },
        animation: {
            trait: 1 /* CALC */ | 2 /* SHORTHAND */,
            value: [
                'animationDuration',
                'animationTimingFunction',
                'animationDelay',
                'animationIterationCount',
                'animationDirection',
                'animationFillMode',
                'animationPlayState',
                'animationName',
            ],
        },
        animationDelay: {
            trait: 1 /* CALC */,
            value: '0s',
        },
        animationDirection: {
            trait: 0,
            value: 'normal',
        },
        animationDuration: {
            trait: 1 /* CALC */,
            value: '0s',
        },
        animationFillMode: {
            trait: 0,
            value: 'none',
        },
        animationIterationCount: {
            trait: 1 /* CALC */,
            value: '1',
        },
        animationName: {
            trait: 0,
            value: 'none',
        },
        animationPlayState: {
            trait: 0,
            value: 'running',
        },
        animationTimingFunction: {
            trait: 1 /* CALC */,
            value: 'ease',
        },
        backdropFilter: {
            trait: 1 /* CALC */,
            value: 'none',
        },
        backfaceVisibility: {
            trait: 0,
            value: 'visible',
        },
        background: {
            trait: 1 /* CALC */ | 2 /* SHORTHAND */ | 64 /* NONE */ | 128 /* AUTO */,
            value: [
                'backgroundImage',
                'backgroundPositionX',
                'backgroundPositionY',
                'backgroundSize',
                'backgroundRepeat',
                'backgroundAttachment',
                'backgroundOrigin',
                'backgroundClip',
                'backgroundColor',
            ],
        },
        backgroundAttachment: {
            trait: 0,
            value: 'scroll',
        },
        backgroundBlendMode: {
            trait: 0,
            value: 'normal',
        },
        backgroundClip: {
            trait: 0,
            value: 'border-box',
        },
        backgroundColor: {
            trait: 1 /* CALC */,
            value: 'transparent',
        },
        backgroundImage: {
            trait: 1 /* CALC */,
            value: 'none',
        },
        backgroundOrigin: {
            trait: 0,
            value: 'padding-box',
        },
        backgroundPosition: {
            trait: 1 /* CALC */ | 2 /* SHORTHAND */,
            value: ['backgroundPositionX', 'backgroundPositionY'],
        },
        backgroundPositionX: {
            trait: 1 /* CALC */,
            value: 'left',
        },
        backgroundPositionY: {
            trait: 1 /* CALC */,
            value: 'top',
        },
        backgroundRepeat: {
            trait: 0,
            value: 'repeat',
        },
        backgroundSize: {
            trait: 1 /* CALC */,
            value: 'auto',
        },
        border: {
            trait: 1 /* CALC */ | 2 /* SHORTHAND */ | 4 /* LAYOUT */ | 64 /* NONE */,
            value: [
                'borderTopWidth',
                'borderTopStyle',
                'borderTopColor',
                'borderRightWidth',
                'borderRightStyle',
                'borderRightColor',
                'borderBottomWidth',
                'borderBottomStyle',
                'borderBottomColor',
                'borderLeftWidth',
                'borderLeftStyle',
                'borderLeftColor',
            ],
        },
        borderBottom: {
            trait: 1 /* CALC */ | 2 /* SHORTHAND */ | 64 /* NONE */,
            value: ['borderBottomWidth', 'borderBottomStyle', 'borderBottomColor'],
        },
        borderBottomColor: {
            trait: 1 /* CALC */ | 16 /* COLOR */,
            value: 'currentcolor',
        },
        borderBottomLeftRadius: {
            trait: 1 /* CALC */ | 256 /* UNIT */,
            value: '0',
        },
        borderBottomRightRadius: {
            trait: 1 /* CALC */ | 256 /* UNIT */,
            value: '0',
        },
        borderBottomStyle: {
            trait: 0,
            value: 'none',
        },
        borderBottomWidth: {
            trait: 1 /* CALC */ | 4 /* LAYOUT */,
            value: 'medium',
        },
        borderCollapse: {
            trait: 4 /* LAYOUT */,
            value: 'separate',
        },
        borderColor: {
            trait: 1 /* CALC */ | 2 /* SHORTHAND */,
            value: ['borderTopColor', 'borderRightColor', 'borderBottomColor', 'borderLeftColor'],
        },
        borderImage: {
            trait: 1 /* CALC */ | 2 /* SHORTHAND */ | 64 /* NONE */,
            value: [
                'borderImageSource',
                'borderImageSlice',
                'borderImageWidth',
                'borderImageOutset',
                'borderImageRepeat',
            ],
            valueOfNone: 'none 100% / 1 / 0 stretch',
        },
        borderImageOutset: {
            trait: 1 /* CALC */,
            value: '0',
        },
        borderImageRepeat: {
            trait: 0,
            value: 'stretch',
        },
        borderImageSlice: {
            trait: 1 /* CALC */,
            value: '100%',
        },
        borderImageSource: {
            trait: 1 /* CALC */,
            value: 'none',
        },
        borderImageWidth: {
            trait: 1 /* CALC */,
            value: '1',
        },
        borderLeft: {
            trait: 1 /* CALC */ | 2 /* SHORTHAND */ | 64 /* NONE */,
            value: ['borderLeftWidth', 'borderLeftStyle', 'borderLeftColor'],
        },
        borderLeftColor: {
            trait: 1 /* CALC */ | 16 /* COLOR */,
            value: 'currentcolor',
        },
        borderLeftStyle: {
            trait: 0,
            value: 'none',
        },
        borderLeftWidth: {
            trait: 1 /* CALC */ | 4 /* LAYOUT */,
            value: 'medium',
        },
        borderRadius: {
            trait: 1 /* CALC */ | 2 /* SHORTHAND */,
            value: ['borderTopLeftRadius', 'borderTopRightRadius', 'borderBottomRightRadius', 'borderBottomLeftRadius'],
        },
        borderRight: {
            trait: 1 /* CALC */ | 2 /* SHORTHAND */ | 64 /* NONE */,
            value: ['borderRightWidth', 'borderRightStyle', 'borderRightColor'],
        },
        borderRightColor: {
            trait: 1 /* CALC */ | 16 /* COLOR */,
            value: 'currentcolor',
        },
        borderRightStyle: {
            trait: 0,
            value: 'none',
        },
        borderRightWidth: {
            trait: 1 /* CALC */ | 4 /* LAYOUT */,
            value: 'medium',
        },
        borderSpacing: {
            trait: 1 /* CALC */ | 256 /* UNIT */,
            value: '0',
            valueOfNone: '0px 0px',
        },
        borderStyle: {
            trait: 2 /* SHORTHAND */ | 64 /* NONE */,
            value: ['borderTopStyle', 'borderRightStyle', 'borderBottomStyle', 'borderLeftStyle'],
        },
        borderTop: {
            trait: 1 /* CALC */ | 2 /* SHORTHAND */ | 64 /* NONE */,
            value: ['borderTopWidth', 'borderTopStyle', 'borderTopColor'],
        },
        borderTopColor: {
            trait: 1 /* CALC */ | 16 /* COLOR */,
            value: 'currentcolor',
        },
        borderTopLeftRadius: {
            trait: 1 /* CALC */ | 256 /* UNIT */,
            value: '0',
        },
        borderTopRightRadius: {
            trait: 1 /* CALC */ | 256 /* UNIT */,
            value: '0',
        },
        borderTopStyle: {
            trait: 0,
            value: 'none',
        },
        borderTopWidth: {
            trait: 1 /* CALC */ | 4 /* LAYOUT */,
            value: 'medium',
        },
        borderWidth: {
            trait: 1 /* CALC */ | 2 /* SHORTHAND */ | 4 /* LAYOUT */,
            value: ['borderTopWidth', 'borderRightWidth', 'borderBottomWidth', 'borderLeftWidth'],
        },
        bottom: {
            trait: 1 /* CALC */ | 4 /* LAYOUT */,
            value: 'auto',
        },
        boxShadow: {
            trait: 1 /* CALC */ | 4 /* LAYOUT */,
            value: 'none',
        },
        boxSizing: {
            trait: 4 /* LAYOUT */,
            value: 'content-box',
        },
        breakAfter: {
            trait: 4 /* LAYOUT */,
            value: 'auto',
        },
        breakBefore: {
            trait: 4 /* LAYOUT */,
            value: 'auto',
        },
        breakInside: {
            trait: 4 /* LAYOUT */,
            value: 'auto',
        },
        captionSide: {
            trait: 0,
            value: 'top',
        },
        caretColor: {
            trait: 1 /* CALC */ | 16 /* COLOR */,
            value: 'auto',
        },
        clear: {
            trait: 4 /* LAYOUT */,
            value: 'none',
        },
        clip: {
            trait: 1 /* CALC */ | 32 /* DEPRECATED */,
            value: 'clip',
        },
        clipPath: {
            trait: 1 /* CALC */,
            value: 'none',
        },
        color: {
            trait: 1 /* CALC */ | 16 /* COLOR */,
            value: 'black',
        },
        columnCount: {
            trait: 1 /* CALC */,
            value: 'auto',
        },
        columnFill: {
            trait: 0,
            value: 'balance',
        },
        columnGap: {
            trait: 1 /* CALC */,
            value: 'normal',
        },
        columnRule: {
            trait: 1 /* CALC */ | 2 /* SHORTHAND */ | 64 /* NONE */,
            value: ['columnRuleWidth', 'columnRuleStyle', 'columnRuleColor'],
        },
        columnRuleColor: {
            trait: 1 /* CALC */ | 16 /* COLOR */,
            value: 'currentcolor',
        },
        columnRuleStyle: {
            trait: 0,
            value: 'none',
        },
        columnRuleWidth: {
            trait: 1 /* CALC */,
            value: 'medium',
        },
        columnSpan: {
            trait: 4 /* LAYOUT */,
            value: 'none',
        },
        columnWidth: {
            trait: 1 /* CALC */,
            value: 'auto',
        },
        columns: {
            trait: 1 /* CALC */ | 2 /* SHORTHAND */ | 128 /* AUTO */,
            value: ['columnCount', 'columnWidth'],
        },
        content: {
            trait: 4 /* LAYOUT */,
            value: 'normal',
        },
        counterIncrement: {
            trait: 1 /* CALC */,
            value: 'none',
        },
        counterReset: {
            trait: 1 /* CALC */,
            value: 'none',
        },
        cursor: {
            trait: 0,
            value: 'auto',
        },
        direction: {
            trait: 4 /* LAYOUT */,
            value: 'ltr',
        },
        display: {
            trait: 4 /* LAYOUT */,
            value: 'inline',
        },
        emptyCells: {
            trait: 0,
            value: 'show',
        },
        filter: {
            trait: 1 /* CALC */,
            value: 'none',
        },
        flex: {
            trait: 1 /* CALC */ | 2 /* SHORTHAND */ | 128 /* AUTO */,
            value: ['flexGrow', 'flexShrink', 'flexBasis'],
        },
        flexBasis: {
            trait: 1 /* CALC */ | 4 /* LAYOUT */,
            value: 'auto',
        },
        flexDirection: {
            trait: 4 /* LAYOUT */,
            value: 'row',
        },
        flexFlow: {
            trait: 2 /* SHORTHAND */ | 4 /* LAYOUT */,
            value: ['flexDirection', 'flexWrap'],
        },
        flexGrow: {
            trait: 1 /* CALC */ | 4 /* LAYOUT */,
            value: '0',
        },
        flexShrink: {
            trait: 1 /* CALC */ | 4 /* LAYOUT */,
            value: '1',
        },
        flexWrap: {
            trait: 4 /* LAYOUT */,
            value: 'nowrap',
        },
        float: {
            trait: 4 /* LAYOUT */,
            value: 'none',
        },
        font: {
            trait: 1 /* CALC */ | 2 /* SHORTHAND */ | 4 /* LAYOUT */,
            value: ['fontStyle', 'fontVariant', 'fontWeight', 'fontStretch', 'fontSize', 'lineHeight', 'fontFamily'],
        },
        fontFamily: {
            trait: 4 /* LAYOUT */,
            value: isPlatform(2 /* MAC */) ? 'Helvetica' : 'Arial',
        },
        fontFeatureSettings: {
            trait: 1 /* CALC */ | 4 /* LAYOUT */,
            value: 'normal',
        },
        fontKerning: {
            trait: 4 /* LAYOUT */,
            value: 'auto',
        },
        fontSize: {
            trait: 1 /* CALC */ | 4 /* LAYOUT */,
            value: 'medium',
        },
        fontSizeAdjust: {
            trait: 1 /* CALC */ | 4 /* LAYOUT */,
            value: 'none',
        },
        fontOpticalSizing: {
            trait: 4 /* LAYOUT */,
            value: 'auto',
        },
        fontStretch: {
            trait: 1 /* CALC */ | 4 /* LAYOUT */,
            value: 'normal',
        },
        fontStyle: {
            trait: 1 /* CALC */ | 4 /* LAYOUT */,
            value: 'normal',
        },
        fontVariant: {
            trait: 1 /* CALC */ | 2 /* SHORTHAND */ | 4 /* LAYOUT */ | 64 /* NONE */,
            value: ['fontVariantCaps', 'fontVariantLigatures', 'fontVariantNumeric', 'fontVariantEastAsian'],
            valueOfNone: 'no-common-ligatures no-discretionary-ligatures no-historical-ligatures no-contextual',
        },
        fontVariantCaps: {
            trait: 1 /* CALC */ | 4 /* LAYOUT */,
            value: 'normal',
        },
        fontVariantEastAsian: {
            trait: 1 /* CALC */ | 4 /* LAYOUT */,
            value: 'normal',
        },
        fontVariantLigatures: {
            trait: 1 /* CALC */ | 4 /* LAYOUT */,
            value: 'normal',
        },
        fontVariantNumeric: {
            trait: 1 /* CALC */ | 4 /* LAYOUT */,
            value: 'normal',
        },
        fontVariationSettings: {
            trait: 1 /* CALC */ | 4 /* LAYOUT */,
            value: 'normal',
        },
        fontWeight: {
            trait: 1 /* CALC */ | 4 /* LAYOUT */,
            value: 'normal',
        },
        gap: {
            trait: 1 /* CALC */ | 2 /* SHORTHAND */ | 4 /* LAYOUT */,
            value: ['rowGap', 'columnGap'],
        },
        grid: {
            trait: 1 /* CALC */ | 2 /* SHORTHAND */ | 4 /* LAYOUT */,
            value: [
                'gridTemplateRows',
                'gridAutoColumns',
                'gridTemplateColumns',
                'gridAutoRows',
                'gridTemplateAreas',
                'gridAutoFlow',
                'gridRowGap',
                'gridColumnGap',
            ],
        },
        gridArea: {
            trait: 1 /* CALC */ | 2 /* SHORTHAND */ | 4 /* LAYOUT */ | 64 /* NONE */ | 128 /* AUTO */,
            value: ['gridRowStart', 'gridColumnStart', 'gridRowEnd', 'gridColumnEnd'],
            valueOfNone: 'none / none / none / none',
        },
        gridAutoColumns: {
            trait: 1 /* CALC */ | 4 /* LAYOUT */,
            value: 'auto',
        },
        gridAutoFlow: {
            trait: 4 /* LAYOUT */,
            value: 'row',
        },
        gridAutoRows: {
            trait: 1 /* CALC */ | 4 /* LAYOUT */,
            value: 'auto',
        },
        gridColumn: {
            trait: 1 /* CALC */ | 2 /* SHORTHAND */ | 4 /* LAYOUT */ | 64 /* NONE */,
            value: ['gridColumnStart', 'gridColumnEnd'],
            valueOfNone: 'none / none',
        },
        gridColumnEnd: {
            trait: 1 /* CALC */ | 4 /* LAYOUT */,
            value: 'auto',
        },
        gridColumnGap: {
            trait: 1 /* CALC */ | 4 /* LAYOUT */,
            value: 'normal',
        },
        gridColumnStart: {
            trait: 1 /* CALC */ | 4 /* LAYOUT */,
            value: 'auto',
        },
        gridGap: {
            trait: 1 /* CALC */ | 2 /* SHORTHAND */ | 4 /* LAYOUT */,
            value: ['gridRowGap', 'gridColumnGap'],
        },
        gridRow: {
            trait: 1 /* CALC */ | 2 /* SHORTHAND */ | 4 /* LAYOUT */ | 64 /* NONE */,
            value: ['gridRowStart', 'gridRowEnd'],
            valueOfNone: 'none / none',
        },
        gridRowEnd: {
            trait: 1 /* CALC */ | 4 /* LAYOUT */,
            value: 'auto',
        },
        gridRowGap: {
            trait: 1 /* CALC */ | 4 /* LAYOUT */,
            value: 'normal',
        },
        gridRowStart: {
            trait: 1 /* CALC */ | 4 /* LAYOUT */,
            value: 'auto',
        },
        gridTemplate: {
            trait: 1 /* CALC */ | 2 /* SHORTHAND */ | 4 /* LAYOUT */,
            value: ['gridTemplateRows', 'gridTemplateColumns', 'gridTemplateAreas'],
        },
        gridTemplateAreas: {
            trait: 4 /* LAYOUT */,
            value: 'none',
        },
        gridTemplateColumns: {
            trait: 1 /* CALC */ | 4 /* LAYOUT */,
            value: 'none',
        },
        gridTemplateRows: {
            trait: 1 /* CALC */ | 4 /* LAYOUT */,
            value: 'none',
        },
        height: {
            trait: 1 /* CALC */ | 4 /* LAYOUT */,
            value: 'auto',
        },
        hyphens: {
            trait: 4 /* LAYOUT */,
            value: 'manual',
        },
        imageRendering: {
            trait: 0,
            value: 'auto',
        },
        isolation: {
            trait: 0,
            value: 'auto',
        },
        lineBreak: {
            trait: 4 /* LAYOUT */,
            value: 'auto',
        },
        justifyContent: {
            trait: 8 /* CONTAIN */,
            value: 'normal',
        },
        justifyItems: {
            trait: 8 /* CONTAIN */,
            value: 'normal',
        },
        justifySelf: {
            trait: 8 /* CONTAIN */,
            value: 'auto',
        },
        left: {
            trait: 1 /* CALC */ | 4 /* LAYOUT */,
            value: 'auto',
        },
        letterSpacing: {
            trait: 1 /* CALC */ | 4 /* LAYOUT */,
            value: 'normal',
        },
        lineHeight: {
            trait: 1 /* CALC */ | 4 /* LAYOUT */,
            value: 'normal',
        },
        listStyle: {
            trait: 2 /* SHORTHAND */ | 4 /* LAYOUT */,
            value: ['listStyleType', 'listStylePosition', 'listStyleImage'],
        },
        listStyleImage: {
            trait: 4 /* LAYOUT */,
            value: 'none',
        },
        listStylePosition: {
            trait: 4 /* LAYOUT */,
            value: 'outside',
        },
        listStyleType: {
            trait: 4 /* LAYOUT */,
            value: 'disc',
        },
        margin: {
            trait: 1 /* CALC */ | 2 /* SHORTHAND */ | 4 /* LAYOUT */ | 128 /* AUTO */,
            value: ['marginTop', 'marginRight', 'marginBottom', 'marginLeft'],
        },
        marginBottom: {
            trait: 1 /* CALC */ | 4 /* LAYOUT */ | 256 /* UNIT */,
            value: '0',
        },
        marginLeft: {
            trait: 1 /* CALC */ | 4 /* LAYOUT */ | 256 /* UNIT */,
            value: '0',
        },
        marginRight: {
            trait: 1 /* CALC */ | 4 /* LAYOUT */ | 256 /* UNIT */,
            value: '0',
        },
        marginTop: {
            trait: 1 /* CALC */ | 4 /* LAYOUT */ | 256 /* UNIT */,
            value: '0',
        },
        maskType: {
            trait: 0,
            value: 'luminance',
        },
        maxHeight: {
            trait: 1 /* CALC */ | 4 /* LAYOUT */,
            value: 'none',
        },
        maxWidth: {
            trait: 1 /* CALC */ | 4 /* LAYOUT */,
            value: 'none',
        },
        minHeight: {
            trait: 1 /* CALC */ | 4 /* LAYOUT */,
            value: 'auto',
        },
        minWidth: {
            trait: 1 /* CALC */ | 4 /* LAYOUT */,
            value: 'auto',
        },
        mixBlendMode: {
            trait: 0,
            value: 'normal',
        },
        objectFit: {
            trait: 4 /* LAYOUT */,
            value: 'fill',
        },
        objectPosition: {
            trait: 1 /* CALC */,
            value: '50% 50%',
        },
        offset: {
            trait: 1 /* CALC */ | 2 /* SHORTHAND */ | 64 /* NONE */ | 128 /* AUTO */,
            value: ['offsetPath', 'offsetDistance', 'offsetRotate', 'offsetAnchor'],
        },
        offsetPath: {
            trait: 1 /* CALC */,
            value: 'none',
        },
        offsetDistance: {
            trait: 1 /* CALC */,
            value: '0',
        },
        offsetRotate: {
            trait: 1 /* CALC */,
            value: 'auto 0deg',
        },
        offsetAnchor: {
            trait: 1 /* CALC */,
            value: 'auto',
        },
        opacity: {
            trait: 1 /* CALC */,
            value: '1',
        },
        order: {
            trait: 1 /* CALC */ | 2 /* SHORTHAND */ | 4 /* LAYOUT */,
            value: '0',
        },
        outline: {
            trait: 1 /* CALC */ | 2 /* SHORTHAND */ | 64 /* NONE */,
            value: ['outlineWidth', 'outlineStyle', 'outlineColor'],
        },
        outlineColor: {
            trait: 1 /* CALC */ | 16 /* COLOR */,
            value: 'currentcolor',
        },
        outlineOffset: {
            trait: 1 /* CALC */ | 256 /* UNIT */,
            value: '0',
        },
        outlineStyle: {
            trait: 0,
            value: 'none',
        },
        outlineWidth: {
            trait: 1 /* CALC */,
            value: 'medium',
        },
        overflow: {
            trait: 2 /* SHORTHAND */ | 4 /* LAYOUT */,
            value: ['overflowX', 'overflowY'],
        },
        overflowAnchor: {
            trait: 0,
            value: 'auto',
        },
        overflowWrap: {
            trait: 4 /* LAYOUT */,
            value: 'normal',
        },
        overflowX: {
            trait: 4 /* LAYOUT */,
            value: 'visible',
        },
        overflowY: {
            trait: 4 /* LAYOUT */,
            value: 'visible',
        },
        overscrollBehavior: {
            trait: 2 /* SHORTHAND */ | 64 /* NONE */ | 128 /* AUTO */,
            value: ['overscrollBehaviorX', 'overscrollBehaviorY'],
        },
        overscrollBehaviorX: {
            trait: 4 /* LAYOUT */,
            value: 'auto',
        },
        overscrollBehaviorY: {
            trait: 4 /* LAYOUT */,
            value: 'auto',
        },
        padding: {
            trait: 1 /* CALC */ | 2 /* SHORTHAND */ | 4 /* LAYOUT */,
            value: ['paddingTop', 'paddingRight', 'paddingBottom', 'paddingLeft'],
        },
        paddingBottom: {
            trait: 1 /* CALC */ | 4 /* LAYOUT */ | 256 /* UNIT */,
            value: '0',
        },
        paddingLeft: {
            trait: 1 /* CALC */ | 4 /* LAYOUT */ | 256 /* UNIT */,
            value: '0',
        },
        paddingRight: {
            trait: 1 /* CALC */ | 4 /* LAYOUT */ | 256 /* UNIT */,
            value: '0',
        },
        paddingTop: {
            trait: 1 /* CALC */ | 4 /* LAYOUT */ | 256 /* UNIT */,
            value: '0',
        },
        pageBreakAfter: {
            trait: 4 /* LAYOUT */,
            value: 'auto',
            alias: 'breakAfter',
        },
        pageBreakBefore: {
            trait: 4 /* LAYOUT */,
            value: 'auto',
            alias: 'breakBefore',
        },
        pageBreakInside: {
            trait: 4 /* LAYOUT */,
            value: 'auto',
            alias: 'breakInside',
        },
        perspective: {
            trait: 1 /* CALC */,
            value: 'none',
        },
        perspectiveOrigin: {
            trait: 1 /* CALC */,
            value: '50% 50%',
        },
        placeContent: {
            trait: 8 /* CONTAIN */,
            value: ['alignContent', 'justifyContent'],
        },
        placeItems: {
            trait: 2 /* SHORTHAND */ | 8 /* CONTAIN */,
            value: ['alignItems', 'justifyItems'],
        },
        placeSelf: {
            trait: 2 /* SHORTHAND */ | 8 /* CONTAIN */,
            value: ['alignSelf', 'justifySelf'],
        },
        position: {
            trait: 4 /* LAYOUT */,
            value: 'static',
        },
        quotes: {
            trait: 4 /* LAYOUT */,
            value: 'none',
        },
        resize: {
            trait: 4 /* LAYOUT */,
            value: 'none',
        },
        right: {
            trait: 1 /* CALC */ | 4 /* LAYOUT */,
            value: 'auto',
        },
        rowGap: {
            trait: 1 /* CALC */ | 4 /* LAYOUT */,
            value: 'normal',
        },
        scrollBehavior: {
            trait: 0,
            value: 'auto',
        },
        scrollMargin: {
            trait: 1 /* CALC */ | 2 /* SHORTHAND */ | 4 /* LAYOUT */,
            value: ['scrollMarginTop', 'scrollMarginRight', 'scrollMarginBottom', 'scrollMarginLeft'],
        },
        scrollMarginBottom: {
            trait: 1 /* CALC */ | 4 /* LAYOUT */ | 256 /* UNIT */,
            value: '0',
        },
        scrollMarginLeft: {
            trait: 1 /* CALC */ | 4 /* LAYOUT */ | 256 /* UNIT */,
            value: '0',
        },
        scrollMarginRight: {
            trait: 1 /* CALC */ | 4 /* LAYOUT */ | 256 /* UNIT */,
            value: '0',
        },
        scrollMarginTop: {
            trait: 1 /* CALC */ | 4 /* LAYOUT */ | 256 /* UNIT */,
            value: '0',
        },
        scrollPadding: {
            trait: 1 /* CALC */ | 2 /* SHORTHAND */ | 4 /* LAYOUT */ | 128 /* AUTO */,
            value: ['scrollPaddingTop', 'scrollPaddingRight', 'scrollPaddingBottom', 'scrollPaddingLeft'],
        },
        scrollPaddingBottom: {
            trait: 1 /* CALC */ | 4 /* LAYOUT */,
            value: 'auto',
        },
        scrollPaddingLeft: {
            trait: 1 /* CALC */ | 4 /* LAYOUT */,
            value: 'auto',
        },
        scrollPaddingRight: {
            trait: 1 /* CALC */ | 4 /* LAYOUT */,
            value: 'auto',
        },
        scrollPaddingTop: {
            trait: 1 /* CALC */ | 4 /* LAYOUT */,
            value: 'auto',
        },
        scrollSnapAlign: {
            trait: 64 /* NONE */,
            value: 'none',
        },
        scrollSnapStop: {
            trait: 64 /* NONE */,
            value: 'none',
        },
        scrollSnapType: {
            trait: 64 /* NONE */,
            value: 'none',
        },
        shapeImageThreshold: {
            trait: 1 /* CALC */ | 4 /* LAYOUT */,
            value: '0',
        },
        shapeMargin: {
            trait: 1 /* CALC */ | 4 /* LAYOUT */ | 256 /* UNIT */,
            value: '0',
        },
        shapeOutside: {
            trait: 1 /* CALC */ | 4 /* LAYOUT */,
            value: 'none',
        },
        tabSize: {
            trait: 1 /* CALC */ | 4 /* LAYOUT */,
            value: '8',
        },
        tableLayout: {
            trait: 4 /* LAYOUT */,
            value: 'auto',
        },
        textAlign: {
            trait: 8 /* CONTAIN */,
            value: 'start',
        },
        textAlignLast: {
            trait: 8 /* CONTAIN */,
            value: 'auto',
        },
        textDecoration: {
            trait: 1 /* CALC */ | 2 /* SHORTHAND */ | 64 /* NONE */,
            value: ['textDecorationLine', 'textDecorationStyle', 'textDecorationColor'],
        },
        textDecorationColor: {
            trait: 1 /* CALC */ | 16 /* COLOR */,
            value: 'currentcolor',
        },
        textDecorationLine: {
            trait: 0,
            value: 'none',
        },
        textDecorationSkipInk: {
            trait: 0,
            value: 'auto',
        },
        textDecorationStyle: {
            trait: 0,
            value: 'solid',
        },
        textEmphasis: {
            trait: 1 /* CALC */ | 2 /* SHORTHAND */ | 64 /* NONE */,
            value: ['textEmphasisStyle', 'textEmphasisColor'],
        },
        textEmphasisColor: {
            trait: 1 /* CALC */ | 16 /* COLOR */,
            value: 'currentcolor',
        },
        textEmphasisPosition: {
            trait: 0,
            value: 'over right',
        },
        textEmphasisStyle: {
            trait: 64 /* NONE */,
            value: 'none',
        },
        textIndent: {
            trait: 1 /* CALC */ | 4 /* LAYOUT */ | 256 /* UNIT */,
            value: '0',
        },
        textJustify: {
            trait: 8 /* CONTAIN */,
            value: 'auto',
        },
        textOverflow: {
            trait: 0,
            value: 'clip',
        },
        textShadow: {
            trait: 1 /* CALC */,
            value: 'none',
        },
        textSizeAdjust: {
            trait: 1 /* CALC */ | 4 /* LAYOUT */,
            value: 'auto',
        },
        textTransform: {
            trait: 4 /* LAYOUT */,
            value: 'none',
        },
        textUnderlinePosition: {
            trait: 0,
            value: 'auto',
        },
        top: {
            trait: 1 /* CALC */ | 4 /* LAYOUT */,
            value: 'auto',
        },
        touchAction: {
            trait: 0,
            value: 'auto',
        },
        transform: {
            trait: 1 /* CALC */,
            value: 'none',
        },
        transformOrigin: {
            trait: 1 /* CALC */,
            value: '50% 50% 0',
        },
        transformStyle: {
            trait: 0,
            value: 'flat',
        },
        transition: {
            trait: 1 /* CALC */ | 2 /* SHORTHAND */ | 64 /* NONE */,
            value: ['transitionProperty', 'transitionDuration', 'transitionTimingFunction', 'transitionDelay'],
            valueOfNone: 'one 0s ease 0s',
        },
        transitionDelay: {
            trait: 1 /* CALC */,
            value: '0s',
        },
        transitionDuration: {
            trait: 1 /* CALC */,
            value: '0s',
        },
        transitionProperty: {
            trait: 0,
            value: 'all',
        },
        transitionTimingFunction: {
            trait: 1 /* CALC */,
            value: 'ease',
        },
        unicodeBidi: {
            trait: 4 /* LAYOUT */,
            value: 'normal',
        },
        userSelect: {
            trait: 64 /* NONE */,
            value: 'none',
        },
        verticalAlign: {
            trait: 1 /* CALC */ | 4 /* LAYOUT */,
            value: 'baseline',
        },
        visibility: {
            trait: 4 /* LAYOUT */,
            value: 'visible',
        },
        whiteSpace: {
            trait: 4 /* LAYOUT */,
            value: 'normal',
        },
        width: {
            trait: 1 /* CALC */ | 4 /* LAYOUT */,
            value: 'auto',
        },
        willChange: {
            trait: 0,
            value: 'auto',
        },
        wordBreak: {
            trait: 4 /* LAYOUT */,
            value: 'normal',
        },
        wordSpacing: {
            trait: 1 /* CALC */ | 4 /* LAYOUT */,
            value: 'normal',
        },
        wordWrap: {
            trait: 4 /* LAYOUT */ | 32 /* DEPRECATED */,
            value: 'normal',
            alias: 'overflowWrap',
        },
        writingMode: {
            trait: 4 /* LAYOUT */,
            value: 'horizontal-tb',
        },
        zIndex: {
            trait: 1 /* CALC */,
            value: 'auto',
        },
    };
    const PROXY_INLINESTYLE = Object.freeze(
        new Proxy(
            Object.create({
                fontSize: 'inherit',
                lineHeight: 'inherit',
                'setProperty': function () {},
                'getPropertyValue': function (p) {
                    return this[convertCamelCase(p)];
                },
            }),
            {
                get: (target, attr) => {
                    var _a;
                    let value = target[attr];
                    if (value) {
                        return value;
                    }
                    value = (_a = CSS_PROPERTIES[attr.toString()]) === null || _a === void 0 ? void 0 : _a.value;
                    if (value) {
                        return typeof value === 'string' ? value : '';
                    }
                },
            }
        )
    );
    const ELEMENT_BLOCK = new Set([
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
        'UL',
    ]);
    function getPropertiesAsTraits(value) {
        const result = {};
        for (const attr in CSS_PROPERTIES) {
            const item = CSS_PROPERTIES[attr];
            if (hasBit(item.trait, value)) {
                item.name = convertHyphenated(attr);
                result[attr] = item;
            }
        }
        return result;
    }
    function getStyle(element, pseudoElt = '') {
        let style = getElementCache(element, 'style' + pseudoElt, '0');
        if (style) {
            return style;
        }
        if (element.nodeName[0] !== '#') {
            style = getComputedStyle(element, pseudoElt);
            setElementCache(element, 'style' + pseudoElt, style);
            return style;
        }
        return PROXY_INLINESTYLE;
    }
    function updateDocumentFont() {
        const documentStyle = getStyle(DOCUMENT_ELEMENT);
        DOCUMENT_FONTSIZE = parseFloat(documentStyle.fontSize);
        if (isNaN(DOCUMENT_FONTSIZE)) {
            DOCUMENT_FONTSIZE = 16;
        }
        const style = DOCUMENT_ELEMENT.style;
        const fontSize = style.fontSize;
        style.fontSize = 'initial';
        DOCUMENT_FONTBASE = parseFloat(documentStyle.fontSize);
        if (isNaN(DOCUMENT_FONTBASE)) {
            DOCUMENT_FONTBASE = 16;
        }
        style.fontSize = fontSize;
        const index = 16 - Math.floor(DOCUMENT_FONTBASE);
        switch (index) {
            case 0:
                DOCUMENT_FONTMAP = [9 / 16, 10 / 16, 13 / 16, 18 / 16, 24 / 16, 2, 3];
                break;
            case 1:
                DOCUMENT_FONTMAP = [9 / 15, 10 / 15, 13 / 15, 18 / 15, 23 / 15, 2, 3];
                break;
            case 2:
                DOCUMENT_FONTMAP = [9 / 14, 10 / 14, 12 / 14, 17 / 14, 21 / 14, 2, 3];
                break;
            case 3:
                DOCUMENT_FONTMAP = DOCUMENT_FIXEDMAP;
                break;
            case 4:
                DOCUMENT_FONTMAP = [9 / 12, 9 / 12, 10 / 12, 14 / 12, 18 / 12, 2, 3];
                break;
            case 5:
                DOCUMENT_FONTMAP = [9 / 11, 9 / 11, 10 / 11, 13 / 11, 17 / 11, 2, 3];
                break;
            case 6:
                DOCUMENT_FONTMAP = [9 / 10, 9 / 10, 9 / 10, 12 / 10, 15 / 10, 2, 3];
                break;
            default:
                DOCUMENT_FONTMAP = index < 0 ? [0.6, 0.75, 0.89, 1.2, 1.5, 2, 3] : [1, 1, 1, 11 / 9, 14 / 9, 2, 3];
                break;
        }
    }
    function getRemSize(fixedWidth) {
        return !fixedWidth ? DOCUMENT_FONTSIZE : 13;
    }
    function getFontSize(element) {
        return parseFloat(getStyle(element.nodeName[0] === '#' ? element.parentElement : element).fontSize);
    }
    function hasComputedStyle(element) {
        return element.nodeName[0] !== '#';
    }
    function parseSelectorText(value) {
        value = value.trim();
        if (value.includes(',')) {
            let normalized = value,
                found,
                match;
            while ((match = CSS.SELECTOR_ATTR.exec(normalized))) {
                const index = match.index;
                const length = match[0].length;
                normalized =
                    (index ? normalized.substring(0, index) : '') +
                    '_'.repeat(length) +
                    normalized.substring(index + length);
                found = true;
            }
            if (found) {
                const result = [];
                let position = 0;
                while (true) {
                    const index = normalized.indexOf(',', position);
                    if (index !== -1) {
                        result.push(value.substring(position, index).trim());
                        position = index + 1;
                    } else {
                        if (position > 0) {
                            result.push(value.substring(position).trim());
                        }
                        break;
                    }
                }
                return result.length ? result : [value];
            }
            return value.split(CHAR_SEPARATOR);
        }
        return [value];
    }
    function getSpecificity(value) {
        CSS.SELECTOR_G.lastIndex = 0;
        let result = 0,
            match;
        while ((match = CSS.SELECTOR_G.exec(value))) {
            let segment = match[1];
            if (segment.length === 1) {
                switch (segment[0]) {
                    case '+':
                    case '~':
                    case '>':
                    case '*':
                        continue;
                }
            } else if (segment.startsWith('*|*')) {
                if (segment.length > 3) {
                    result = 0;
                    break;
                }
            } else if (segment.startsWith('*|')) {
                segment = segment.substring(2);
            } else if (segment.startsWith('::')) {
                result = 0;
                break;
            }
            let subMatch;
            while ((subMatch = CSS.SELECTOR_ATTR.exec(segment))) {
                if (subMatch[1]) {
                    result += 1;
                }
                if (subMatch[3] || subMatch[4] || subMatch[5]) {
                    result += 10;
                }
                segment = spliceString(segment, subMatch.index, subMatch[0].length);
            }
            while ((subMatch = CSS.SELECTOR_PSEUDO_CLASS.exec(segment))) {
                const pseudoClass = subMatch[0];
                if (pseudoClass.startsWith(':not(')) {
                    const negate = subMatch[1];
                    if (negate) {
                        const lastIndex = CSS.SELECTOR_G.lastIndex;
                        result += getSpecificity(negate);
                        CSS.SELECTOR_G.lastIndex = lastIndex;
                    }
                } else {
                    switch (pseudoClass) {
                        case ':scope':
                        case ':root':
                            break;
                        default:
                            result += 10;
                            break;
                    }
                }
                segment = spliceString(segment, subMatch.index, pseudoClass.length);
            }
            while ((subMatch = CSS.SELECTOR_PSEUDO_ELEMENT.exec(segment))) {
                result += 1;
                segment = spliceString(segment, subMatch.index, subMatch[0].length);
            }
            while ((subMatch = CSS.SELECTOR_LABEL.exec(segment))) {
                const label = subMatch[0];
                switch (label[0]) {
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
                segment = spliceString(segment, subMatch.index, label.length);
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
            case 'overscrollBehaviorInline':
                return getWritingMode(value) === 0 ? 'overscrollBehaviorX' : 'overscrollBehaviorY';
            case 'overscrollBehaviorBlock':
                return getWritingMode(value) === 0 ? 'overscrollBehaviorY' : 'overscrollBehaviorX';
            case 'marginInlineStart':
                return getWritingMode(value) === 0 ? 'marginLeft' : 'marginTop';
            case 'marginInlineEnd':
                return getWritingMode(value) === 0 ? 'marginRight' : 'marginBottom';
            case 'borderInlineStart':
                return getWritingMode(value) === 0 ? 'borderLeft' : 'borderTop';
            case 'borderInlineStartWidth':
                return getWritingMode(value) === 0 ? 'borderLeftWidth' : 'borderTopWidth';
            case 'borderInlineStartStyle':
                return getWritingMode(value) === 0 ? 'borderLeftStyle' : 'borderTopStyle';
            case 'borderInlineStartColor':
                return getWritingMode(value) === 0 ? 'borderLeftColor' : 'borderTopColor';
            case 'borderInlineEnd':
                return getWritingMode(value) === 0 ? 'borderRight' : 'borderBottom';
            case 'borderInlineEndWidth':
                return getWritingMode(value) === 0 ? 'borderRightWidth' : 'borderBottomWidth';
            case 'borderInlineEndStyle':
                return getWritingMode(value) === 0 ? 'borderRightStyle' : 'borderBottomStyle';
            case 'borderInlineEndColor':
                return getWritingMode(value) === 0 ? 'borderRightColor' : 'borderBottomColor';
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
            case 'marginBlockStart':
                switch (getWritingMode(value)) {
                    case 0:
                        return 'marginTop';
                    case 1:
                        return 'marginLeft';
                    default:
                        return 'marginRight';
                }
            case 'marginBlockEnd':
                switch (getWritingMode(value)) {
                    case 0:
                        return 'marginBottom';
                    case 1:
                        return 'marginRight';
                    default:
                        return 'marginLeft';
                }
            case 'borderBlockStart':
                switch (getWritingMode(value)) {
                    case 0:
                        return 'borderTop';
                    case 1:
                        return 'borderLeft';
                    default:
                        return 'borderRight';
                }
            case 'borderBlockStartWidth':
                switch (getWritingMode(value)) {
                    case 0:
                        return 'borderTopWidth';
                    case 1:
                        return 'borderLeftWidth';
                    default:
                        return 'borderRightWidth';
                }
            case 'borderBlockStartStyle':
                switch (getWritingMode(value)) {
                    case 0:
                        return 'borderTopStyle';
                    case 1:
                        return 'borderLeftStyle';
                    default:
                        return 'borderRightStyle';
                }
            case 'borderBlockStartColor':
                switch (getWritingMode(value)) {
                    case 0:
                        return 'borderTopColor';
                    case 1:
                        return 'borderLeftColor';
                    default:
                        return 'borderRightColor';
                }
            case 'borderBlockEnd':
                switch (getWritingMode(value)) {
                    case 0:
                        return 'borderBottom';
                    case 1:
                        return 'borderRight';
                    default:
                        return 'borderLeft';
                }
            case 'borderBlockEndWidth':
                switch (getWritingMode(value)) {
                    case 0:
                        return 'borderBottomWidth';
                    case 1:
                        return 'borderRightWidth';
                    default:
                        return 'borderLeftWidth';
                }
            case 'borderBlockEndStyle':
                switch (getWritingMode(value)) {
                    case 0:
                        return 'borderBottomStyle';
                    case 1:
                        return 'borderRightStyle';
                    default:
                        return 'borderLeftStyle';
                }
            case 'borderBlockEndColor':
                switch (getWritingMode(value)) {
                    case 0:
                        return 'borderBottomColor';
                    case 1:
                        return 'borderRightColor';
                    default:
                        return 'borderLeftColor';
                }
            case 'paddingBlockStart':
                switch (getWritingMode(value)) {
                    case 0:
                        return 'paddingTop';
                    case 1:
                        return 'paddingLeft';
                    default:
                        return 'paddingRight';
                }
            case 'paddingBlockEnd':
                switch (getWritingMode(value)) {
                    case 0:
                        return 'paddingBottom';
                    case 1:
                        return 'paddingRight';
                    default:
                        return 'paddingLeft';
                }
            case 'scrollMarginBlockStart':
                switch (getWritingMode(value)) {
                    case 0:
                        return 'scrollMarginTop';
                    case 1:
                        return 'scrollMarginLeft';
                    default:
                        return 'scrollMarginRight';
                }
            case 'scrollMarginBlockEnd':
                switch (getWritingMode(value)) {
                    case 0:
                        return 'scrollMarginBottom';
                    case 1:
                        return 'scrollMarginRight';
                    default:
                        return 'scrollMarginLeft';
                }
            case 'scrollPaddingBlockStart':
                switch (getWritingMode(value)) {
                    case 0:
                        return 'scrollPaddingTop';
                    case 1:
                        return 'scrollPaddingLeft';
                    default:
                        return 'scrollPaddingRight';
                }
            case 'scrollPaddingBlockEnd':
                switch (getWritingMode(value)) {
                    case 0:
                        return 'scrollPaddingBottom';
                    case 1:
                        return 'scrollPaddingRight';
                    default:
                        return 'scrollPaddingLeft';
                }
            case 'scrollMarginInline':
                return getWritingMode(value) === 0
                    ? ['scrollMarginLeft', 'scrollMarginRight']
                    : ['scrollMarginTop', 'scrollMarginBottom'];
            case 'scrollMarginBlock':
                return getWritingMode(value) === 0
                    ? ['scrollMarginTop', 'scrollMarginBottom']
                    : ['scrollMarginLeft', 'scrollMarginRight'];
            case 'scrollPaddingInline':
                return getWritingMode(value) === 0
                    ? ['scrollPaddingLeft', 'scrollPaddingRight']
                    : ['scrollPaddingTop', 'scrollPaddingBottom'];
            case 'scrollPaddingBlock':
                return getWritingMode(value) === 0
                    ? ['scrollPaddingTop', 'scrollPaddingBottom']
                    : ['scrollPaddingLeft', 'scrollPaddingRight'];
            default:
                return attr;
        }
    }
    function calculateStyle(element, attr, value, boundingBox) {
        var _a;
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
                return formatVar(
                    calculateVar(element, value, { dimension: 'width', boundingBox, min: 0, parent: false })
                );
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
                return formatVar(
                    calculateVar(element, value, { dimension: 'height', boundingBox, min: 0, parent: false })
                );
            case 'flexBasis':
                return formatVar(
                    calculateVar(element, value, {
                        dimension:
                            element.parentElement && getStyle(element.parentElement).flexDirection.includes('column')
                                ? 'height'
                                : 'width',
                        boundingBox,
                        min: 0,
                    })
                );
            case 'borderBottomWidth':
            case 'borderLeftWidth':
            case 'borderRightWidth':
            case 'borderTopWidth':
            case 'columnRuleWidth':
            case 'letterSpacing':
            case 'outlineOffset':
            case 'outlineWidth':
            case 'perspective':
            case 'wordSpacing':
                return calculateLength(element, value);
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
                return formatVar(
                    calculateVar(element, value, {
                        boundingSize: hasEm(value) ? getFontSize(element) : undefined,
                        min: 0,
                    })
                );
            case 'fontSize':
                return formatVar(
                    calculateVar(element, value, {
                        boundingSize: hasEm(value) ? getFontSize(element.parentElement || DOCUMENT_ELEMENT) : undefined,
                        min: 0,
                    })
                );
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
            case 'backgroundSize':
            case 'maskSize':
            case 'gap':
            case 'gridGap':
            case 'perspectiveOrigin':
                return calculateVarAsString(element, value, {
                    dimension: ['width', 'height'],
                    boundingBox,
                    min: attr === 'perspectiveOrigin' ? -Infinity : 0,
                    parent: false,
                });
            case 'borderImageOutset':
            case 'borderImageWidth':
                return calculateVarAsString(element, value, {
                    dimension: ['height', 'width', 'height', 'width'],
                    boundingBox,
                    min: 0,
                    parent: false,
                });
            case 'borderWidth':
            case 'borderSpacing':
                return calculateVarAsString(element, value, { min: 0, supportPercent: false });
            case 'gridAutoColumns':
            case 'gridTemplateColumns':
                return calculateGeneric(element, value, 16 /* INTEGER */, 1, boundingBox);
            case 'gridAutoRows':
            case 'gridTemplateRows':
                return calculateGeneric(element, value, 16 /* INTEGER */, 1, boundingBox, 'height');
            case 'order':
            case 'zIndex':
                return formatDecimal(calculateVar(element, value, { unitType: 16 /* INTEGER */ }));
            case 'tabSize':
                return formatDecimal(calculateVar(element, value, { unitType: 16 /* INTEGER */, min: 0 }));
            case 'columnCount':
            case 'fontWeight':
            case 'widows':
                return formatDecimal(calculateVar(element, value, { unitType: 16 /* INTEGER */, min: 1 }));
            case 'gridRow':
            case 'gridRowEnd':
            case 'gridRowStart':
            case 'gridColumn':
            case 'gridColumnEnd':
            case 'gridColumnStart':
            case 'counterIncrement':
            case 'counterReset':
                return calculateVarAsString(element, value, { unitType: 16 /* INTEGER */ });
            case 'gridArea':
                return calculateVarAsString(element, value, { unitType: 16 /* INTEGER */, min: 1 });
            case 'flexGrow':
            case 'flexShrink':
                return formatDecimal(calculateVar(element, value, { unitType: 32 /* DECIMAL */, min: 0 }));
            case 'animationIterationCount':
            case 'fontSizeAdjust':
                return formatDecimal(
                    calculateVar(element, value, { unitType: 32 /* DECIMAL */, min: 0, supportPercent: false })
                );
            case 'opacity':
            case 'shapeImageThreshold':
                return calculatePercent(element, value, true);
            case 'fontStretch':
            case 'textSizeAdjust':
                return calculateVarAsString(element, value, {
                    unitType: 2 /* PERCENT */,
                    min: 0,
                    supportPercent: true,
                });
            case 'fontStyle':
            case 'offsetRotate':
                return calculateVarAsString(element, value, { unitType: 8 /* ANGLE */, supportPercent: false });
            case 'offsetAnchor':
            case 'transformOrigin':
                return calculatePosition(element, value, boundingBox);
            case 'transform': {
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
                                    calc = calculateVarAsString(element, seg, {
                                        unitType: 32 /* DECIMAL */,
                                        supportPercent: false,
                                    });
                                    break;
                                case 'scaleX':
                                case 'scaleY':
                                case 'scaleZ': {
                                    const result = calculateVar(element, seg, {
                                        unitType: 32 /* DECIMAL */,
                                        min: 0,
                                        supportPercent: false,
                                    });
                                    if (!isNaN(result)) {
                                        calc = result.toString();
                                    }
                                    break;
                                }
                                case 'scale':
                                case 'scale3d':
                                    calc = calculateVarAsString(element, seg, {
                                        unitType: 32 /* DECIMAL */,
                                        min: 0,
                                        supportPercent: false,
                                    });
                                    break;
                                case 'translateX':
                                    calc = formatVar(
                                        calculateVar(element, seg, { dimension: 'width', boundingBox, parent: true })
                                    );
                                    break;
                                case 'translateY':
                                    calc = formatVar(
                                        calculateVar(element, seg, { dimension: 'height', boundingBox, parent: true })
                                    );
                                    break;
                                case 'translateZ':
                                case 'perspective':
                                    calc = formatVar(calculateVar(element, seg, { supportPercent: false }));
                                    break;
                                case 'translate':
                                case 'translate3d':
                                    calc = calculateVarAsString(element, seg, {
                                        dimension: ['width', 'height'],
                                        boundingBox,
                                        parent: true,
                                    });
                                    break;
                                case 'skew':
                                case 'rotate':
                                    calc = calculateVarAsString(element, seg, {
                                        unitType: 8 /* ANGLE */,
                                        supportPercent: false,
                                    });
                                    break;
                                case 'skewX':
                                case 'skewY':
                                case 'rotateX':
                                case 'rotateY':
                                case 'rotateZ':
                                    calc = calculateAngle(element, seg);
                                    break;
                                case 'rotate3d': {
                                    const component = seg.split(CHAR_SEPARATOR);
                                    const q = component.length;
                                    if (q === 3 || q === 4) {
                                        calc = '';
                                        for (let j = 0; j < q; ++j) {
                                            let rotate = component[j];
                                            if (isCalc(rotate)) {
                                                const result = calculateVar(element, rotate, {
                                                    unitType: j === 3 ? 8 /* ANGLE */ : 32 /* DECIMAL */,
                                                    supportPercent: false,
                                                });
                                                if (isNaN(result)) {
                                                    return '';
                                                }
                                                rotate = result + (j === 3 ? 'deg' : '');
                                            }
                                            calc += calc ? ', ' + rotate : rotate;
                                        }
                                    }
                                    break;
                                }
                            }
                            if (!calc) {
                                return '';
                            }
                            transform[i] = `(${calc})`;
                        }
                    }
                    return transform.join('');
                }
                return value;
            }
            case 'backgroundImage':
            case 'maskImage':
            case 'borderImageSource': {
                const image = splitEnclosing(value);
                const length = image.length;
                if (length > 1) {
                    for (let i = 1; i < length; ++i) {
                        const color = image[i];
                        if (isColor(color) && hasCalc(color)) {
                            const component = splitEnclosing(trimEnclosing(color));
                            for (let j = 1, q = component.length; j < q; ++j) {
                                if (hasCalc(component[j])) {
                                    const previous = component[j - 1];
                                    if (isColor(previous)) {
                                        const prefix = previous.split(CHAR_SPACE).pop();
                                        const result = calculateColor(element, prefix + component[j]);
                                        if (result) {
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
                const color = splitEnclosing(value);
                const length = color.length;
                if (length > 1) {
                    for (let i = 1; i < length; ++i) {
                        const previous = color[i - 1];
                        if (isColor(previous) && hasCalc(color[i])) {
                            const prefix = previous.split(CHAR_SPACE).pop();
                            const result = calculateColor(element, prefix + color[i]);
                            if (!result) {
                                return '';
                            }
                            color[i] = result;
                            color[i - 1] = previous.substring(0, previous.length - prefix.length);
                        }
                    }
                    return color.join('');
                }
                return value;
            }
            case 'boxShadow':
            case 'textShadow':
                return calculateVarAsString(element, calculateStyle(element, 'borderColor', value), {
                    supportPercent: false,
                    errorString: /-?[\d.]+[a-z]*\s+-?[\d.]+[a-z]*(\s+-[\d.]+[a-z]*)/,
                });
            case 'animation':
            case 'animationDelay':
            case 'animationDuration':
            case 'transition':
            case 'transitionDelay':
            case 'transitionDuration':
                return calculateVarAsString(element, value, {
                    unitType: 4 /* TIME */,
                    min: 0,
                    precision: 0,
                    separator: ',',
                });
            case 'fontFeatureSettings':
            case 'fontVariantCaps':
            case 'fontVariantEastAsian':
            case 'fontVariantLigatures':
            case 'fontVariantNumeric':
            case 'fontVariationSettings':
                return calculateVarAsString(element, value, { unitType: 16 /* INTEGER */, min: 0, separator: ',' });
            case 'columns':
                return calculateGeneric(element, value, 16 /* INTEGER */, 1, boundingBox);
            case 'borderImageSlice':
            case 'flex':
            case 'font':
                return calculateGeneric(element, value, 32 /* DECIMAL */, 0, boundingBox);
            case 'backgroundPosition':
            case 'maskPosition': {
                const result = [];
                for (const position of value.split(CHAR_SEPARATOR)) {
                    const segment = calculatePosition(element, position, boundingBox);
                    if (!segment) {
                        return '';
                    }
                    result.push(segment);
                }
                return result.join(', ');
            }
            case 'border':
            case 'borderBottom':
            case 'borderLeft':
            case 'borderRight':
            case 'borderTop':
            case 'columnRule':
            case 'outline':
            case 'textEmphasis':
            case 'textDecoration': {
                const border = splitEnclosing(value);
                const length = border.length;
                if (length > 1) {
                    for (let i = 1; i < length; ++i) {
                        const previous = border[i - 1];
                        const prefix = previous.split(CHAR_SPACE).pop();
                        let result;
                        if (prefix === 'calc') {
                            result = formatVar(
                                calculateVar(element, prefix + border[i], { min: 0, supportPercent: false })
                            );
                        } else if (isColor(prefix)) {
                            result = calculateColor(element, prefix + border[i]);
                        } else {
                            continue;
                        }
                        if (!result) {
                            return '';
                        }
                        border[i] = result;
                        border[i - 1] = previous.substring(0, previous.length - prefix.length);
                    }
                    return border.join('');
                }
                return value;
            }
            case 'animationTimingFunction':
            case 'transitionTimingFunction': {
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
                                const cubic = seg.split(CHAR_SEPARATOR);
                                const q = cubic.length;
                                if (q === 4) {
                                    calc = '';
                                    for (let j = 0; j < q; ++j) {
                                        let bezier = cubic[j];
                                        if (isCalc(bezier)) {
                                            const p = calculateVar(
                                                element,
                                                bezier,
                                                j % 2 === 0
                                                    ? {
                                                          unitType: 32 /* DECIMAL */,
                                                          supportPercent: false,
                                                          min: 0,
                                                          max: 1,
                                                      }
                                                    : undefined
                                            );
                                            if (isNaN(p)) {
                                                return '';
                                            }
                                            bezier = p.toString();
                                        }
                                        calc += calc ? ', ' + bezier : bezier;
                                    }
                                }
                            } else if (prefix.endsWith('steps')) {
                                calc = calculateVarAsString(element, seg, { unitType: 16 /* INTEGER */, min: 1 });
                            }
                            if (!calc) {
                                return '';
                            }
                            timingFunction[i] = `(${calc})`;
                        }
                    }
                    return timingFunction.join('');
                }
                return value;
            }
            case 'clip':
                return hasCoords(getStyle(element).position)
                    ? calculateVarAsString(element, value, { supportPercent: false })
                    : '';
            case 'clipPath':
            case 'offsetPath':
            case 'shapeOutside': {
                const path = splitEnclosing(value);
                const length = path.length;
                if (length === 2) {
                    const prefix = path[0].trim();
                    let shape = trimEnclosing(path[1].trim());
                    switch (prefix) {
                        case 'linear-gradient':
                        case 'radial-gradient':
                        case 'conic-gradient':
                        case 'repeating-linear-gradient':
                        case 'repeating-radial-gradient':
                            return calculateStyle(element, 'backgroundImage', value, boundingBox);
                        case 'circle':
                        case 'ellipse': {
                            const result = [];
                            let [radius, position] = shape.split(/\s+at\s+/);
                            if (hasCalc(radius)) {
                                const options = { boundingBox, min: 0, parent: true };
                                if (prefix === 'circle') {
                                    if (radius.includes('%')) {
                                        const { width, height } =
                                            boundingBox || getContentBoxDimension(element.parentElement);
                                        if (!width || !height) {
                                            return '';
                                        }
                                        options.boundingSize = Math.min(width, height);
                                    }
                                } else {
                                    options.dimension = ['width', 'height'];
                                }
                                radius = calculateVarAsString(element, radius, options);
                                if (!radius) {
                                    return '';
                                }
                            }
                            if (radius) {
                                result.push(radius);
                            }
                            if (hasCalc(position)) {
                                position = calculateVarAsString(element, position, {
                                    dimension: ['width', 'height'],
                                    boundingBox,
                                    parent: true,
                                });
                                if (!position) {
                                    return '';
                                }
                            }
                            if (position) {
                                result.push(position);
                            }
                            shape = result.join(' at ');
                            break;
                        }
                        case 'inset':
                            shape = calculateVarAsString(element, shape, {
                                dimension: ['height', 'width', 'height', 'width', 'width'],
                                boundingBox,
                                checkUnit: true,
                            });
                            break;
                        case 'polygon': {
                            const result = [];
                            for (let points of shape.split(CHAR_SEPARATOR)) {
                                if (hasCalc(points)) {
                                    points = calculateVarAsString(element, points, {
                                        dimension: ['width', 'height'],
                                        boundingBox,
                                        parent: true,
                                    });
                                    if (!points) {
                                        return '';
                                    }
                                }
                                result.push(points);
                            }
                            shape = result.join(', ');
                            break;
                        }
                        default:
                            return !hasCalc(path[1]) ? value : '';
                    }
                    if (shape) {
                        return `${prefix}(${shape})`;
                    }
                }
                return value;
            }
            case 'grid': {
                let [row, column] = value.trim().split(CHAR_DIVIDER);
                if (hasCalc(row)) {
                    const result = calculateStyle(element, 'gridTemplateRows', row, boundingBox);
                    if (!result) {
                        return '';
                    }
                    row = result;
                }
                if (hasCalc(column)) {
                    const result = calculateStyle(element, 'gridTemplateColumns', column, boundingBox);
                    if (!result) {
                        return '';
                    }
                    column = result;
                }
                return row + (column ? ` / ${column}` : '');
            }
            case 'offset': {
                let [offset, anchor] = value.trim().split(CHAR_DIVIDER);
                if (hasCalc(offset)) {
                    const url = splitEnclosing(offset.trim());
                    const length = url.length;
                    if (length < 2) {
                        return '';
                    }
                    offset = url[0] + url[1];
                    if (hasCalc(offset)) {
                        offset = calculateStyle(element, 'offsetPath', offset, boundingBox);
                        if (!offset) {
                            return '';
                        }
                    }
                    if (length > 2) {
                        let distance = url.slice(2).join('');
                        if (hasCalc(offset)) {
                            distance = calculateStyle(
                                element,
                                REGEXP_LENGTH.test(distance) ? 'offsetDistance' : 'offsetRotate',
                                distance,
                                boundingBox
                            );
                            if (!distance) {
                                return '';
                            }
                        }
                        offset += ' ' + distance;
                    }
                }
                if (hasCalc(anchor)) {
                    const result = calculateStyle(element, 'offsetAnchor', anchor, boundingBox);
                    if (!result) {
                        return '';
                    }
                    anchor = result;
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
                    if (slice) {
                        let width, outset;
                        if (match[3]) {
                            [width, outset] = match[3].trim().split(CHAR_DIVIDER);
                            if (hasCalc(width)) {
                                const result = calculateStyle(element, 'borderImageWidth', width, boundingBox);
                                if (!result) {
                                    return '';
                                }
                                width = result;
                            }
                            if (hasCalc(outset)) {
                                const result = calculateStyle(element, 'borderImageOutset', outset, boundingBox);
                                if (!result) {
                                    return '';
                                }
                                outset = result;
                            }
                        }
                        return match[1] + ' ' + slice + (width ? ` / ${width}` : '') + (outset ? ` / ${outset}` : '');
                    }
                }
                return '';
            }
            case 'filter':
            case 'backdropFilter': {
                const filters = splitEnclosing(value);
                const length = filters.length;
                if (length > 1) {
                    for (let i = 1; i < length; ++i) {
                        let seg = filters[i];
                        if (hasCalc(seg)) {
                            seg = trimEnclosing(seg);
                            let result;
                            switch (filters[i - 1].trim()) {
                                case 'blur':
                                    result = calculateLength(element, seg);
                                    break;
                                case 'brightness':
                                case 'saturate':
                                    result = calculatePercent(element, seg, false);
                                    break;
                                case 'contrast':
                                case 'grayscale':
                                case 'invert':
                                case 'opacity':
                                case 'sepia':
                                    result = calculatePercent(element, seg, true);
                                    break;
                                case 'drop-shadow':
                                    result = calculateStyle(element, 'boxShadow', seg, boundingBox);
                                    break;
                                case 'hue-rotate':
                                    result = calculateAngle(element, seg);
                                    break;
                                case 'url':
                                    continue;
                            }
                            if (!result) {
                                return '';
                            }
                            filters[i] = `(${result})`;
                        }
                    }
                    return filters.join('');
                }
                return value;
            }
            case 'background':
            case 'mask':
            case 'gridTemplate':
                return getStyle(element)[attr];
            default: {
                if (
                    attr.endsWith('Color') ||
                    hasBit((_a = CSS_PROPERTIES[attr]) === null || _a === void 0 ? void 0 : _a.trait, 16 /* COLOR */)
                ) {
                    return calculateColor(element, value.trim());
                }
                const alias = checkWritingMode(attr, getStyle(element).writingMode);
                if (alias !== attr) {
                    return calculateStyle(element, alias, value, boundingBox);
                }
            }
        }
        return '';
    }
    function checkStyleValue(element, attr, value) {
        switch (value) {
            case 'unset':
                switch (attr) {
                    case 'lineHeight':
                    case 'fontSize':
                        return 'inherit';
                }
            case 'initial':
                switch (attr) {
                    case 'position':
                        return 'static';
                    case 'display':
                        return ELEMENT_BLOCK.has(element.tagName) ? 'block' : 'inline';
                    case 'fontSize':
                        return 'inherit';
                    case 'verticalAlign':
                        switch (element.tagName) {
                            case 'SUP':
                                return 'super';
                            case 'SUB':
                                return 'sub';
                            default:
                                return 'baseline';
                        }
                    case 'backgroundColor':
                        return 'transparent';
                    case 'backgroundRepeat':
                        return 'repeat-x repeat-y';
                    case 'backgroundImage':
                    case 'borderTopStyle':
                    case 'borderRightStyle':
                    case 'borderBottomStyle':
                    case 'borderLeftStyle':
                    case 'float':
                        return 'none';
                    case 'lineHeight':
                        return 'normal';
                    case 'boxSizing':
                        return 'content-box';
                    case 'borderCollapse':
                        return 'separate';
                    default:
                        return '';
                }
            case 'inherit':
                switch (attr) {
                    case 'fontSize':
                    case 'lineHeight':
                        return 'inherit';
                    default:
                        return getStyle(element)[attr];
                }
        }
        if (hasCalc(value)) {
            return calculateStyle(element, attr, value) || getStyle(element)[attr];
        } else if (isCustomProperty(value)) {
            return parseVar(element, value) || getStyle(element)[attr];
        }
        return value;
    }
    function checkFontSizeValue(value, fixedWidth) {
        switch (value) {
            case '':
                return 'inherit';
            case 'medium':
                return '1rem';
            case 'smaller':
                return '0.833333em';
            case 'larger':
                return '1.2em';
            case 'xxx-large':
                return fromFontNamedValue(6, fixedWidth);
            case 'xx-large':
                return fromFontNamedValue(5, fixedWidth);
            case 'x-large':
                return fromFontNamedValue(4, fixedWidth);
            case 'large':
                return fromFontNamedValue(3, fixedWidth);
            case 'small':
                return fromFontNamedValue(2, fixedWidth);
            case 'x-small':
                return fromFontNamedValue(1, fixedWidth);
            case 'xx-small':
                return fromFontNamedValue(0, fixedWidth);
            default:
                return value;
        }
    }
    function getKeyframesRules(documentRoot = document) {
        const result = new Map();
        violation: {
            const styleSheets = documentRoot.styleSheets;
            for (let i = 0, length = styleSheets.length; i < length; ++i) {
                try {
                    const cssRules = styleSheets[i].cssRules;
                    if (cssRules) {
                        for (let j = 0, q = cssRules.length; j < q; ++j) {
                            try {
                                const item = cssRules[j];
                                if (item.type === CSSRule.KEYFRAMES_RULE) {
                                    const value = parseKeyframes(item.cssRules);
                                    if (value) {
                                        const data = result.get(item.name);
                                        if (data) {
                                            Object.assign(data, value);
                                        } else {
                                            result.set(item.name, value);
                                        }
                                    }
                                }
                            } catch (_a) {
                                break violation;
                            }
                        }
                    }
                } catch (_b) {}
            }
        }
        return result;
    }
    function parseKeyframes(rules) {
        const result = {};
        let valid;
        for (let i = 0, length = rules.length; i < length; ++i) {
            const item = rules[i];
            const match = REGEXP_KEYFRAMES.exec(item.cssText);
            if (match) {
                const keyframes = (item['keyText'] || match[1]).trim().split(CHAR_SEPARATOR);
                for (let j = 0, q = keyframes.length; j < q; ++j) {
                    let percent = keyframes[j];
                    switch (percent) {
                        case 'from':
                            percent = '0%';
                            break;
                        case 'to':
                            percent = '100%';
                            break;
                    }
                    const keyframe = {};
                    for (const property of match[2].split(/\s*;\s*/)) {
                        const [attr, value] = splitPair(property, ':');
                        if (value) {
                            keyframe[attr.trim()] = value.trim();
                        }
                    }
                    result[percent] = keyframe;
                    valid = true;
                }
            }
        }
        return valid ? result : null;
    }
    function checkMediaRule(value, fontSize) {
        switch (value.trim()) {
            case 'all':
            case 'screen':
            case 'only all':
            case 'only screen':
                return true;
            default: {
                REGEXP_MEDIARULE.lastIndex = 0;
                let match;
                while ((match = REGEXP_MEDIARULE.exec(value))) {
                    const negate = match[1] === 'not';
                    let valid, condition;
                    while ((condition = REGEXP_MEDIARULECONDITION.exec(match[2]))) {
                        const attr = condition[1];
                        let operation = condition[2];
                        const rule = condition[3];
                        if (attr.startsWith('min')) {
                            operation = '>=';
                        } else if (attr.startsWith('max')) {
                            operation = '<=';
                        }
                        switch (attr) {
                            case 'aspect-ratio':
                            case 'min-aspect-ratio':
                            case 'max-aspect-ratio':
                                if (rule) {
                                    const [width, height] = splitPair(rule, '/');
                                    valid = compareRange(
                                        operation,
                                        window.innerWidth / window.innerHeight,
                                        parseInt(width) / parseInt(height)
                                    );
                                } else {
                                    valid = false;
                                }
                                break;
                            case 'width':
                            case 'min-width':
                            case 'max-width':
                            case 'height':
                            case 'min-height':
                            case 'max-height':
                                valid = compareRange(
                                    operation,
                                    attr.endsWith('width') ? window.innerWidth : window.innerHeight,
                                    parseUnit(rule, { fontSize })
                                );
                                break;
                            case 'orientation':
                                valid =
                                    (rule === 'portrait' && window.innerWidth <= window.innerHeight) ||
                                    (rule === 'landscape' && window.innerWidth > window.innerHeight);
                                break;
                            case 'resolution':
                            case 'min-resolution':
                            case 'max-resolution':
                                valid =
                                    !!rule &&
                                    compareRange(
                                        operation,
                                        window.devicePixelRatio,
                                        Math.max(0, parseResolution(rule))
                                    );
                                break;
                            case 'grid':
                                valid = rule === '0';
                                break;
                            case 'color':
                                valid = parseInt(rule) > 0;
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
                    REGEXP_MEDIARULECONDITION.lastIndex = 0;
                    if ((!negate && valid) || (negate && !valid)) {
                        return true;
                    }
                }
            }
        }
        return false;
    }
    function parseVar(element, value, style) {
        let match;
        while ((match = REGEXP_VAR.exec(value))) {
            let customValue = (style || (style = getStyle(element))).getPropertyValue(match[2]).trim();
            const fallback = match[3];
            if (
                fallback &&
                (!customValue ||
                    (isLength(fallback, true) && !isLength(customValue, true)) ||
                    (isNumber(fallback) && !isNumber(customValue)) ||
                    (parseColor(fallback) && !parseColor(customValue)))
            ) {
                customValue = fallback.trim();
            }
            if (!customValue) {
                return '';
            }
            value = match[1] + customValue + match[4];
        }
        return value;
    }
    function calculateVarAsString(element, value, options) {
        let orderedSize, dimension, separator, unitType, checkUnit, errorString;
        if (options) {
            if (Array.isArray(options.orderedSize)) {
                orderedSize = options.orderedSize;
            }
            if (Array.isArray(options.dimension)) {
                dimension = options.dimension;
            }
            ({ separator, unitType, checkUnit, errorString } = options);
        }
        if (separator === ' ') {
            value = value.trim();
        }
        let unit;
        switch (unitType) {
            case 16 /* INTEGER */:
            case 32 /* DECIMAL */:
                unit = '';
                break;
            case 2 /* PERCENT */:
                unit = '%';
                break;
            case 4 /* TIME */:
                unit = 'ms';
                break;
            case 8 /* ANGLE */:
                unit = 'deg';
                break;
            default:
                unit = 'px';
                unitType = 1 /* LENGTH */;
                break;
        }
        const result = [];
        for (let seg of separator ? value.split(separator) : [value]) {
            seg = seg.trim();
            if (seg) {
                const calc = splitEnclosing(seg, 'calc');
                const length = calc.length;
                if (length === 0) {
                    return '';
                }
                let partial = '';
                for (let i = 0, j = 0; i < length; ++i) {
                    let output = calc[i];
                    if (isCalc(output)) {
                        if (options) {
                            if (orderedSize && orderedSize[j] !== undefined) {
                                options.boundingSize = orderedSize[j++];
                            } else if (dimension) {
                                options.dimension = dimension[j++];
                                delete options.boundingSize;
                            } else if (orderedSize) {
                                delete options.boundingSize;
                            }
                        }
                        const k = calculateVar(element, output, options);
                        if (isNaN(k)) {
                            return '';
                        }
                        partial += k + unit;
                    } else {
                        partial += output;
                        if (dimension) {
                            output = output.trim();
                            if (
                                output &&
                                (!checkUnit ||
                                    (unitType === 1 /* LENGTH */ && (isLength(output, true) || output === 'auto')))
                            ) {
                                ++j;
                            }
                        }
                    }
                }
                result.push(partial);
            }
        }
        value =
            result.length === 1 ? result[0] : result.join(separator === ' ' ? ' ' : separator ? separator + ' ' : '');
        if (errorString) {
            let match;
            while ((match = errorString.exec(value))) {
                if (match[1] === undefined) {
                    return '';
                }
                const segment = match[0];
                let optional = segment;
                for (let i = match.length - 1; i >= 1; --i) {
                    optional = optional.replace(new RegExp(match[i] + '$'), '');
                }
                if (optional === segment) {
                    return '';
                }
                value = value.replace(segment, optional);
            }
        }
        return value;
    }
    function calculateVar(element, value, options = {}) {
        value = parseVar(element, value);
        if (value) {
            const { precision, supportPercent, unitType } = options;
            const boundingSize = !unitType || unitType === 1; /* LENGTH */
            if (value.includes('%')) {
                if (supportPercent === false || unitType === 16 /* INTEGER */) {
                    return NaN;
                } else if (boundingSize && options.boundingSize === undefined) {
                    const { dimension, boundingBox } = options;
                    if (dimension) {
                        if (boundingBox) {
                            options.boundingSize = boundingBox[dimension];
                        } else {
                            let offsetPadding = 0,
                                boundingElement;
                            if (options.parent === false) {
                                boundingElement = element;
                            } else {
                                boundingElement = element.parentElement;
                                if (boundingElement instanceof HTMLElement) {
                                    let style;
                                    if (hasCoords(getStyle(element).position)) {
                                        do {
                                            style = getStyle(boundingElement);
                                            if (boundingElement === document.body) {
                                                break;
                                            }
                                            if (style.position === 'static') {
                                                boundingElement = boundingElement.parentElement;
                                            } else {
                                                break;
                                            }
                                        } while (boundingElement);
                                    } else {
                                        style = getStyle(boundingElement);
                                    }
                                    offsetPadding =
                                        dimension === 'width' ? getContentBoxWidth(style) : getContentBoxHeight(style);
                                } else if (element instanceof SVGElement) {
                                    if (options.parent !== true) {
                                        boundingElement = element;
                                    }
                                } else {
                                    boundingElement = null;
                                }
                            }
                            if (boundingElement) {
                                options.boundingSize = Math.max(
                                    0,
                                    boundingElement.getBoundingClientRect()[dimension] - offsetPadding
                                );
                            }
                        }
                    }
                }
            } else if (supportPercent) {
                return NaN;
            }
            if (boundingSize && options.fontSize === undefined && hasEm(value)) {
                options.fontSize = getFontSize(element);
            }
            const result = calculate(value, options);
            if (precision !== undefined) {
                return precision === 0 ? Math.floor(result) : parseFloat(truncate(result, precision));
            } else if (options.roundValue) {
                return Math.round(result);
            }
            return result;
        }
        return NaN;
    }
    function getSrcSet(element, mimeType) {
        const result = [];
        const parentElement = element.parentElement;
        let { srcset, sizes } = element;
        if (parentElement && parentElement.tagName === 'PICTURE') {
            iterateArray(parentElement.children, item => {
                if (
                    item.tagName === 'SOURCE' &&
                    isString(item.srcset) &&
                    !(isString(item.media) && !checkMediaRule(item.media)) &&
                    (!mimeType ||
                        mimeType === '*' ||
                        !isString(item.type) ||
                        mimeType.has(item.type.trim().toLowerCase()))
                ) {
                    ({ srcset, sizes } = item);
                    return true;
                }
            });
        }
        if (srcset) {
            for (const value of srcset.trim().split(CHAR_SEPARATOR)) {
                const match = REGEXP_IMGSRCSET.exec(value);
                if (match) {
                    let width = 0,
                        pixelRatio = 0;
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
                    result.push({ src: resolvePath(match[1].split(CHAR_SPACE)[0]), pixelRatio, width });
                }
            }
        }
        const length = result.length;
        if (length === 0) {
            return;
        } else if (length > 1) {
            result.sort((a, b) => {
                const pxA = a.pixelRatio;
                const pxB = b.pixelRatio;
                if (pxA && pxB) {
                    if (pxA !== pxB) {
                        return pxA - pxB;
                    }
                } else {
                    const widthA = a.width;
                    const widthB = b.width;
                    if (widthA !== widthB && widthA && widthB) {
                        return widthA - widthB;
                    }
                }
                return 0;
            });
            if (isString(sizes)) {
                let width = NaN;
                for (const value of sizes.trim().split(CHAR_SEPARATOR)) {
                    let match = REGEXP_SOURCESIZES.exec(value);
                    if (match) {
                        const ruleA = match[1] ? checkMediaRule(match[1]) : null;
                        const ruleB = match[4] ? checkMediaRule(match[4]) : null;
                        switch (match[3]) {
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
                                if (ruleA !== null || ruleB) {
                                    continue;
                                }
                                break;
                            default:
                                if (ruleA === false || ruleB !== null) {
                                    continue;
                                }
                                break;
                        }
                        const unit = match[6];
                        if (unit) {
                            match = REGEXP_CALC.exec(unit);
                            if (match) {
                                width = calculate(
                                    match[1],
                                    match[1].includes('%')
                                        ? { boundingSize: getContentBoxDimension(element.parentElement).width }
                                        : undefined
                                );
                            } else if (isPercent(unit)) {
                                width = (parseFloat(unit) / 100) * getContentBoxDimension(element.parentElement).width;
                            } else if (isLength(unit)) {
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
                        if (
                            imageWidth > 0 &&
                            imageWidth <= resolution &&
                            (index === -1 || result[index].width < imageWidth)
                        ) {
                            index = i;
                        }
                    }
                    if (index === 0) {
                        const item = result[0];
                        item.pixelRatio = 1;
                        item.actualWidth = width;
                    } else if (index > 0) {
                        const selected = result.splice(index, 1)[0];
                        selected.pixelRatio = 1;
                        selected.actualWidth = width;
                        result.unshift(selected);
                    }
                    for (let i = 1; i < length; ++i) {
                        const item = result[i];
                        if (item.pixelRatio === 0) {
                            item.pixelRatio = item.width / width;
                        }
                    }
                }
            }
        }
        return result;
    }
    function extractURL(value) {
        const match = CSS.URL.exec(value);
        if (match) {
            return trimBoth(match[1], '"');
        }
    }
    function resolveURL(value) {
        const url = extractURL(value);
        if (url) {
            return resolvePath(url);
        }
    }
    function insertStyleSheetRule(value, index = 0, shadowRoot) {
        const style = document.createElement('style');
        if (isUserAgent(2 /* SAFARI */)) {
            style.appendChild(document.createTextNode(''));
        }
        (shadowRoot || document.head).appendChild(style);
        const sheet = style.sheet;
        if (sheet && typeof sheet.insertRule === 'function') {
            try {
                sheet.insertRule(value, index);
            } catch (_a) {
                return null;
            }
        }
        return style;
    }
    function calculate(value, options) {
        value = value.trim();
        let length = value.length;
        if (length === 0) {
            return NaN;
        } else if (value[0] !== '(' || value[length - 1] !== ')') {
            value = `(${value})`;
            length += 2;
        }
        const opening = [];
        const closing = [];
        let opened = 0;
        for (let i = 0; i < length; ++i) {
            switch (value[i]) {
                case '(':
                    ++opened;
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
            do {
                for (let i = 0; i < closing.length; ++i) {
                    let valid,
                        j = closing[i] - 1;
                    for (; j >= 0; j--) {
                        if (opening[j]) {
                            opening[j] = false;
                            valid = true;
                            break;
                        } else if (closing.includes(j)) {
                            break;
                        }
                    }
                    if (valid) {
                        let boundingSize, min, max, unitType, fontSize;
                        if (options) {
                            ({ boundingSize, min, max, unitType, fontSize } = options);
                        }
                        let found, operand, operator;
                        const seg = [];
                        const evaluate = [];
                        const operation = value.substring(j + 1, closing[i]).split(REGEXP_CALCOPERATION);
                        for (let k = 0, q = operation.length; k < q; ++k) {
                            const partial = operation[k].trim();
                            switch (partial) {
                                case '+':
                                case '-':
                                case '*':
                                case '/':
                                    evaluate.push(partial);
                                    operator = partial;
                                    break;
                                default: {
                                    const match = REGEXP_CALCUNIT.exec(partial);
                                    if (match) {
                                        switch (unitType) {
                                            case 16 /* INTEGER */:
                                            case 32 /* DECIMAL */:
                                                break;
                                            default:
                                                if (!checkCalculateNumber(operand, operator)) {
                                                    return NaN;
                                                }
                                                break;
                                        }
                                        const unit = equated[parseInt(match[1])];
                                        seg.push(unit);
                                        operand = unit.toString();
                                        found = true;
                                    } else {
                                        switch (unitType) {
                                            case 2 /* PERCENT */:
                                                if (isNumber(partial)) {
                                                    if (!checkCalculateOperator(operand, operator)) {
                                                        return NaN;
                                                    }
                                                    seg.push(parseFloat(partial));
                                                } else if (isPercent(partial)) {
                                                    if (!checkCalculateNumber(operand, operator)) {
                                                        return NaN;
                                                    }
                                                    seg.push(parseFloat(partial));
                                                    found = true;
                                                } else {
                                                    return NaN;
                                                }
                                                break;
                                            case 4 /* TIME */:
                                                if (isNumber(partial)) {
                                                    if (!checkCalculateOperator(operand, operator)) {
                                                        return NaN;
                                                    }
                                                    seg.push(parseFloat(partial));
                                                } else if (isTime(partial)) {
                                                    if (!checkCalculateNumber(operand, operator)) {
                                                        return NaN;
                                                    }
                                                    seg.push(parseTime(partial) * 1000);
                                                    found = true;
                                                } else {
                                                    return NaN;
                                                }
                                                break;
                                            case 8 /* ANGLE */:
                                                if (isNumber(partial)) {
                                                    if (!checkCalculateOperator(operand, operator)) {
                                                        return NaN;
                                                    }
                                                    seg.push(parseFloat(partial));
                                                } else if (isAngle(partial)) {
                                                    if (!checkCalculateNumber(operand, operator)) {
                                                        return NaN;
                                                    }
                                                    const angle = parseAngle(partial);
                                                    if (!isNaN(angle)) {
                                                        seg.push();
                                                        found = true;
                                                    } else {
                                                        return NaN;
                                                    }
                                                } else {
                                                    return NaN;
                                                }
                                                break;
                                            case 16 /* INTEGER */:
                                                if (/^\s*-?\d+\s*$/.test(partial)) {
                                                    seg.push(parseInt(partial));
                                                    found = true;
                                                } else {
                                                    return NaN;
                                                }
                                                break;
                                            case 32 /* DECIMAL */:
                                                if (isNumber(partial)) {
                                                    seg.push(parseFloat(partial));
                                                    found = true;
                                                } else if (
                                                    isPercent(partial) &&
                                                    boundingSize !== undefined &&
                                                    !isNaN(boundingSize)
                                                ) {
                                                    seg.push((parseFloat(partial) / 100) * boundingSize);
                                                } else {
                                                    return NaN;
                                                }
                                                break;
                                            default:
                                                if (isNumber(partial)) {
                                                    if (!checkCalculateOperator(operand, operator)) {
                                                        return NaN;
                                                    }
                                                    seg.push(parseFloat(partial));
                                                } else if (isLength(partial)) {
                                                    if (!checkCalculateNumber(operand, operator)) {
                                                        return NaN;
                                                    }
                                                    seg.push(parseUnit(partial, { fontSize }));
                                                    found = true;
                                                } else if (
                                                    isPercent(partial) &&
                                                    boundingSize !== undefined &&
                                                    !isNaN(boundingSize)
                                                ) {
                                                    if (!checkCalculateNumber(operand, operator)) {
                                                        return NaN;
                                                    }
                                                    seg.push((parseFloat(partial) / 100) * boundingSize);
                                                    found = true;
                                                } else {
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
                        for (let k = 0; k < evaluate.length; ++k) {
                            if (evaluate[k] === '/') {
                                if (Math.abs(seg[k + 1]) !== 0) {
                                    seg.splice(k, 2, seg[k] / seg[k + 1]);
                                    evaluate.splice(k--, 1);
                                } else {
                                    return NaN;
                                }
                            }
                        }
                        for (let k = 0; k < evaluate.length; ++k) {
                            if (evaluate[k] === '*') {
                                seg.splice(k, 2, seg[k] * seg[k + 1]);
                                evaluate.splice(k--, 1);
                            }
                        }
                        for (let k = 0; k < evaluate.length; ++k) {
                            seg.splice(k, 2, seg[k] + seg[k + 1] * (evaluate[k] === '-' ? -1 : 1));
                            evaluate.splice(k--, 1);
                        }
                        if (seg.length !== 1) {
                            return NaN;
                        }
                        if (closing.length === 1) {
                            const result = seg[0];
                            return (min !== undefined && result < min) || (max !== undefined && result > max)
                                ? NaN
                                : truncateFraction(result);
                        }
                        equated[index] = seg[0];
                        const hash = `{${index++}}`;
                        const remaining = closing[i] + 1;
                        value =
                            value.substring(0, j) +
                            hash +
                            ' '.repeat(remaining - (j + hash.length)) +
                            value.substring(remaining);
                        closing.splice(i--, 1);
                    }
                }
            } while (true);
        }
        return NaN;
    }
    function parseUnit(value, options) {
        const match = REGEXP_LENGTH.exec(value);
        if (match) {
            let result = parseFloat(match[1]);
            switch (match[2]) {
                case 'px':
                    return result;
                case 'ex':
                    result /= 2;
                case 'em':
                case 'ch':
                    if (options && options.fontSize !== undefined) {
                        return result * options.fontSize;
                    }
                case 'rem':
                    return result * (options && options.fixedWidth ? 13 : DOCUMENT_FONTSIZE);
                case 'pc':
                    result *= 12;
                case 'pt':
                    return (result * 4) / 3;
                case 'Q':
                    result /= 4;
                case 'mm':
                    result /= 10;
                case 'cm':
                    result /= 2.54;
                case 'in':
                    return result * getDeviceDPI();
                case 'vw':
                    return (result * getInnerDimension(true, options)) / 100;
                case 'vh':
                    return (result * getInnerDimension(false, options)) / 100;
                case 'vmin':
                    return (
                        (result * Math.min(getInnerDimension(true, options), getInnerDimension(false, options))) / 100
                    );
                case 'vmax':
                    return (
                        (result * Math.max(getInnerDimension(true, options), getInnerDimension(false, options))) / 100
                    );
            }
        }
        return 0;
    }
    function convertUnit(value, unit, options) {
        let result = parseUnit('1' + unit, options);
        if (result !== 0) {
            if (typeof value === 'string') {
                value = parseUnit(value, options);
            }
            result = value / result;
            if (options && options.precision !== undefined) {
                return truncate(result, options.precision) + unit;
            }
        }
        return result + unit;
    }
    function parseTransform(value, options) {
        var _a, _b, _c;
        let accumulate, fontSize, boundingBox;
        if (options) {
            ({ accumulate, fontSize, boundingBox } = options);
        }
        const result = [];
        let match;
        while ((match = REGEXP_TRANSFORM.exec(value))) {
            const method = match[1];
            if (method.startsWith('translate')) {
                const translate = TRANSFORM.TRANSLATE.exec(match[0]);
                if (translate) {
                    const tX = translate[2];
                    let x = 0,
                        y = 0,
                        z = 0,
                        group = 'translate';
                    switch (method) {
                        case 'translate':
                        case 'translate3d': {
                            if (isPercent(tX)) {
                                if (boundingBox) {
                                    x = (parseFloat(tX) / 100) * boundingBox.width;
                                }
                            } else {
                                x = parseUnit(tX, { fontSize });
                            }
                            const tY = translate[3];
                            if (tY) {
                                if (isPercent(tY)) {
                                    if (boundingBox) {
                                        y = (parseFloat(tY) / 100) * boundingBox.height;
                                    }
                                } else {
                                    y = parseUnit(tY, { fontSize });
                                }
                            }
                            if (method === 'translate3d') {
                                const tZ = translate[4];
                                if (tZ && !isPercent(tZ)) {
                                    z = parseUnit(tZ, { fontSize });
                                    group += '3d';
                                } else {
                                    continue;
                                }
                            }
                            break;
                        }
                        case 'translateX':
                            if (isPercent(tX)) {
                                if (boundingBox) {
                                    x = (parseFloat(tX) / 100) * boundingBox.width;
                                }
                            } else {
                                x = parseUnit(tX, { fontSize });
                            }
                            break;
                        case 'translateY':
                            if (isPercent(tX)) {
                                if (boundingBox) {
                                    y = (parseFloat(tX) / 100) * boundingBox.height;
                                }
                            } else {
                                y = parseUnit(tX, { fontSize });
                            }
                            break;
                        case 'translateZ':
                            z = parseUnit(tX, { fontSize });
                            break;
                    }
                    if (accumulate) {
                        const values =
                            (_a = result.find(item => item.group === group)) === null || _a === void 0
                                ? void 0
                                : _a.values;
                        if (values) {
                            values[0] += x;
                            values[1] += y;
                            values[2] += z;
                            continue;
                        }
                    }
                    result.push({ group, method, values: [x, y, z] });
                }
            } else if (method.startsWith('rotate')) {
                const rotate = TRANSFORM.ROTATE.exec(match[0]);
                if (rotate) {
                    const angle = convertAngle(rotate[5], rotate[6]);
                    if (!isNaN(angle)) {
                        let x = 0,
                            y = 0,
                            z = 0,
                            group = 'rotate';
                        switch (method) {
                            case 'rotate':
                                x = angle;
                                y = angle;
                                break;
                            case 'rotateX':
                                x = angle;
                                break;
                            case 'rotateY':
                                y = angle;
                                break;
                            case 'rotateZ':
                                z = angle;
                                break;
                            case 'rotate3d':
                                x = parseFloat(rotate[2]);
                                y = parseFloat(rotate[3]);
                                z = parseFloat(rotate[4]);
                                if (isNaN(x) || isNaN(y) || isNaN(z)) {
                                    continue;
                                }
                                group += '3d';
                                break;
                        }
                        if (accumulate) {
                            const data = result.find(item => item.group === group);
                            if (data) {
                                const values = data.values;
                                values[0] += x;
                                values[1] += y;
                                values[2] += z;
                                if (data.angle !== undefined) {
                                    data.angle += angle;
                                }
                                continue;
                            }
                        }
                        result.push({
                            group,
                            method,
                            values: [x, y, z],
                            angle: method === 'rotate3d' ? angle : undefined,
                        });
                    }
                }
            } else if (method.startsWith('scale')) {
                const scale = TRANSFORM.SCALE.exec(match[0]);
                if (scale) {
                    let x = 1,
                        y = 1,
                        z = 1,
                        group = 'scale';
                    switch (method) {
                        case 'scale':
                        case 'scale3d':
                            x = parseFloat(scale[2]);
                            y = scale[3] ? parseFloat(scale[3]) : x;
                            if (method === 'scale3d') {
                                if (scale[4]) {
                                    z = parseFloat(scale[4]);
                                    group += '3d';
                                } else {
                                    continue;
                                }
                            }
                            break;
                        case 'scaleX':
                            x = parseFloat(scale[2]);
                            break;
                        case 'scaleY':
                            y = parseFloat(scale[2]);
                            break;
                        case 'scaleZ':
                            z = parseFloat(scale[2]);
                            break;
                    }
                    if (accumulate) {
                        const values =
                            (_b = result.find(item => item.group === group)) === null || _b === void 0
                                ? void 0
                                : _b.values;
                        if (values) {
                            values[0] *= x;
                            values[1] *= y;
                            values[2] *= z;
                            continue;
                        }
                    }
                    result.push({ group, method, values: [x, y, z] });
                }
            } else if (method.startsWith('skew')) {
                const skew = TRANSFORM.SKEW.exec(match[0]);
                if (skew) {
                    const angle = convertAngle(skew[2], skew[3]);
                    if (!isNaN(angle)) {
                        let x = 0,
                            y = 0;
                        switch (method) {
                            case 'skew':
                                x = angle;
                                if (skew[4] && skew[5]) {
                                    y = convertAngle(skew[4], skew[5], 0);
                                }
                                break;
                            case 'skewX':
                                x = angle;
                                break;
                            case 'skewY':
                                y = angle;
                                break;
                        }
                        if (accumulate) {
                            const values =
                                (_c = result.find(item => item.group === 'skew')) === null || _c === void 0
                                    ? void 0
                                    : _c.values;
                            if (values) {
                                values[0] += x;
                                values[1] += y;
                                continue;
                            }
                        }
                        result.push({ group: 'skew', method, values: [x, y] });
                    }
                }
            } else if (method.startsWith('matrix')) {
                const subMatch = TRANSFORM.MATRIX.exec(match[0]);
                if (subMatch) {
                    let length;
                    if (method === 'matrix') {
                        if (subMatch[8]) {
                            continue;
                        }
                        length = 6;
                    } else {
                        if (!subMatch[17]) {
                            continue;
                        }
                        length = 16;
                    }
                    const values = new Array(length);
                    for (let i = 0; i < length; ++i) {
                        values[i] = parseFloat(subMatch[i + 2]);
                    }
                    result.push({ group: method, method, values });
                }
            }
        }
        REGEXP_TRANSFORM.lastIndex = 0;
        return result;
    }
    function parseAngle(value, fallback = NaN) {
        const match = REGEXP_ANGLE.exec(value);
        return match ? convertAngle(match[1], match[2]) : fallback;
    }
    function convertAngle(value, unit = 'deg', fallback = NaN) {
        let result = convertFloat(value);
        if (isNaN(result)) {
            return fallback;
        }
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
    function parseTime(value) {
        const match = REGEXP_TIME.exec(value);
        if (match) {
            let result = parseFloat(match[1]);
            if (match[2] === 'ms') {
                result /= 1000;
            }
            return result;
        }
        return 0;
    }
    function parseResolution(value) {
        const match = REGEXP_RESOLUTION.exec(value);
        if (match) {
            let result = parseFloat(match[1]);
            switch (match[2]) {
                case 'dpcm':
                    result *= 2.54 / 96;
                    break;
                case 'dpi':
                    result /= 96;
                    break;
            }
            return result;
        }
        return 0;
    }
    function formatPX(value) {
        return Math.round(value) + 'px';
    }
    function formatPercent(value, round) {
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
        return !percent ? REGEXP_LENGTH.test(value) : REGEXP_LENGTHPERCENTAGE.test(value);
    }
    function isCalc(value) {
        return REGEXP_CALC.test(value);
    }
    function isCustomProperty(value) {
        return REGEXP_CUSTOMPROPERTY.test(value);
    }
    function isAngle(value) {
        return REGEXP_ANGLE.test(value);
    }
    function isTime(value) {
        return REGEXP_TIME.test(value);
    }
    function isPercent(value, digits) {
        return !digits ? value[value.length - 1] === '%' : REGEXP_PERCENT.test(value);
    }
    function hasEm(value) {
        return REGEXP_EMBASED.test(value);
    }
    function hasCalc(value) {
        return REGEXP_CALCWITHIN.test(value);
    }
    function hasCoords(value) {
        return value === 'absolute' || value === 'fixed';
    }

    var css = /*#__PURE__*/ Object.freeze({
        __proto__: null,
        CSS_PROPERTIES: CSS_PROPERTIES,
        PROXY_INLINESTYLE: PROXY_INLINESTYLE,
        ELEMENT_BLOCK: ELEMENT_BLOCK,
        getPropertiesAsTraits: getPropertiesAsTraits,
        getStyle: getStyle,
        updateDocumentFont: updateDocumentFont,
        getRemSize: getRemSize,
        getFontSize: getFontSize,
        hasComputedStyle: hasComputedStyle,
        parseSelectorText: parseSelectorText,
        getSpecificity: getSpecificity,
        checkWritingMode: checkWritingMode,
        calculateStyle: calculateStyle,
        checkStyleValue: checkStyleValue,
        checkFontSizeValue: checkFontSizeValue,
        getKeyframesRules: getKeyframesRules,
        parseKeyframes: parseKeyframes,
        checkMediaRule: checkMediaRule,
        parseVar: parseVar,
        calculateVarAsString: calculateVarAsString,
        calculateVar: calculateVar,
        getSrcSet: getSrcSet,
        extractURL: extractURL,
        resolveURL: resolveURL,
        insertStyleSheetRule: insertStyleSheetRule,
        calculate: calculate,
        parseUnit: parseUnit,
        convertUnit: convertUnit,
        parseTransform: parseTransform,
        parseAngle: parseAngle,
        convertAngle: convertAngle,
        parseTime: parseTime,
        parseResolution: parseResolution,
        formatPX: formatPX,
        formatPercent: formatPercent,
        isLength: isLength,
        isCalc: isCalc,
        isCustomProperty: isCustomProperty,
        isAngle: isAngle,
        isTime: isTime,
        isPercent: isPercent,
        hasEm: hasEm,
        hasCalc: hasCalc,
        hasCoords: hasCoords,
    });

    function newBoxRectDimension() {
        return {
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            width: 0,
            height: 0,
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
            height: rect.height,
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
    function getRangeClientRect(element) {
        let hidden;
        if (element.childElementCount) {
            iterateArray(element.children, item => {
                const style = getStyle(item);
                if (style.visibility !== 'visible' && hasCoords(style.position)) {
                    const display = style.display;
                    if (display !== 'none') {
                        item.style.display = 'none';
                        (hidden || (hidden = [])).push([item, display]);
                    }
                }
            });
        }
        const domRect = [];
        const range = document.createRange();
        range.selectNodeContents(element);
        const clientRects = range.getClientRects();
        for (let i = 0, length = clientRects.length; i < length; ++i) {
            const item = clientRects.item(i);
            if (Math.round(item.width) && !withinRange(item.left, item.right, 0.5)) {
                domRect.push(item);
            }
        }
        let bounds = null,
            length = domRect.length;
        if (length) {
            let numberOfLines = 1,
                overflow = false;
            bounds = assignRect(domRect[0]);
            for (let i = 1; i < length; ++i) {
                const { left, right, top, bottom, width } = domRect[i];
                if (left < bounds.left) {
                    bounds.left = left;
                } else if (left > bounds.right) {
                    overflow = true;
                }
                if (right > bounds.right) {
                    bounds.right = right;
                }
                if (top < bounds.top) {
                    bounds.top = top;
                } else if (Math.ceil(top) >= domRect[i - 1].bottom || Math.floor(right - left) > width) {
                    ++numberOfLines;
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
        if (hidden) {
            length = hidden.length;
            for (let i = 0; i < length; ++i) {
                const [item, display] = hidden[i];
                item.style.display = display;
            }
        }
        return bounds;
    }
    function getParentElement(element) {
        const parentElement = element.parentElement;
        if (parentElement) {
            return parentElement;
        }
        const parentNode = element.parentNode;
        return parentNode && parentNode instanceof ShadowRoot ? parentNode.host : null;
    }
    function removeElementsByClassName(className) {
        const elements = Array.from(document.getElementsByClassName(className));
        for (let i = 0, length = elements.length; i < length; ++i) {
            const element = elements[i];
            const parentElement = element.parentElement;
            if (parentElement) {
                parentElement.removeChild(element);
            }
        }
    }
    function getElementsBetweenSiblings(elementStart, elementEnd) {
        const parentNode = elementEnd.parentNode;
        const result = [];
        if (parentNode && (!elementStart || parentNode === elementStart.parentNode)) {
            let startIndex = elementStart ? -1 : 0,
                endIndex = -1;
            iterateArray(parentNode.childNodes, (element, index) => {
                if (element === elementEnd) {
                    endIndex = index;
                    if (startIndex !== -1) {
                        return true;
                    }
                } else if (element === elementStart) {
                    startIndex = index;
                    if (endIndex !== -1) {
                        return true;
                    }
                }
            });
            if (startIndex !== -1 && endIndex !== -1) {
                iterateArray(
                    parentNode.childNodes,
                    element => {
                        const nodeName = element.nodeName;
                        if (nodeName[0] !== '#' || nodeName === '#text') {
                            result.push(element);
                        }
                    },
                    Math.min(startIndex, endIndex),
                    Math.max(startIndex, endIndex) + 1
                );
            }
        }
        return result;
    }
    function createElement(tagName, options) {
        const { parent, attrs, style } = options;
        const element = document.createElement(tagName);
        if (style) {
            const cssStyle = element.style;
            for (const attr in style) {
                if (attr.includes('-')) {
                    cssStyle.setProperty(attr, style[attr]);
                } else if (attr in cssStyle) {
                    cssStyle[attr] = style[attr];
                }
            }
        }
        if (attrs) {
            for (const attr in attrs) {
                if (attr in element) {
                    element[attr] = attrs[attr];
                }
            }
        }
        if (parent) {
            parent.appendChild(element);
        }
        return element;
    }
    function getTextMetrics(value, fontSize, fontFamily) {
        const context = document.createElement('canvas').getContext('2d');
        if (context) {
            context.font = fontSize + 'px' + (fontFamily ? ' ' + fontFamily : '');
            return context.measureText(value);
        }
        return { width: 0 };
    }
    function getNamedItem(element, attr) {
        var _a;
        return (
            ((_a = element.attributes.getNamedItem(attr)) === null || _a === void 0 ? void 0 : _a.value.trim()) || ''
        );
    }

    var dom = /*#__PURE__*/ Object.freeze({
        __proto__: null,
        newBoxRectDimension: newBoxRectDimension,
        withinViewport: withinViewport,
        assignRect: assignRect,
        getRangeClientRect: getRangeClientRect,
        getParentElement: getParentElement,
        removeElementsByClassName: removeElementsByClassName,
        getElementsBetweenSiblings: getElementsBetweenSiblings,
        createElement: createElement,
        getTextMetrics: getTextMetrics,
        getNamedItem: getNamedItem,
    });

    const FRAMEWORK_NOT_INSTALLED = 'Framework not installed.';
    const SERVER_REQUIRED = 'Server required. See README for instructions.';
    const DIRECTORY_NOT_PROVIDED = 'Directory not provided.';
    const UNABLE_TO_FINALIZE_DOCUMENT = 'Unable to finalize document.';
    const INVALID_ASSET_REQUEST = 'Invalid asset request.';
    const OPERATION_NOT_SUPPORTED = 'Operation not supported.';
    const DOCUMENT_ROOT_NOT_FOUND = 'Document root not found.';
    const DOCUMENT_IS_CLOSED = 'Document is closed. Reset and rerun?';
    const CSS_CANNOT_BE_PARSED =
        'CSS cannot be parsed inside <link> tags when loading files directly from your hard drive or from external websites. Either use a local web server, embed your CSS into a <style> tag, or you can try using a different browser. See README for instructions.';
    function reject(value) {
        return Promise.reject(new Error(value));
    }

    var error = /*#__PURE__*/ Object.freeze({
        __proto__: null,
        FRAMEWORK_NOT_INSTALLED: FRAMEWORK_NOT_INSTALLED,
        SERVER_REQUIRED: SERVER_REQUIRED,
        DIRECTORY_NOT_PROVIDED: DIRECTORY_NOT_PROVIDED,
        UNABLE_TO_FINALIZE_DOCUMENT: UNABLE_TO_FINALIZE_DOCUMENT,
        INVALID_ASSET_REQUEST: INVALID_ASSET_REQUEST,
        OPERATION_NOT_SUPPORTED: OPERATION_NOT_SUPPORTED,
        DOCUMENT_ROOT_NOT_FOUND: DOCUMENT_ROOT_NOT_FOUND,
        DOCUMENT_IS_CLOSED: DOCUMENT_IS_CLOSED,
        CSS_CANNOT_BE_PARSED: CSS_CANNOT_BE_PARSED,
        reject: reject,
    });

    class Iterator {
        constructor(children) {
            this.children = children;
            this._index = -1;
            this._iterating = 0;
            this._length = children.length;
        }
        next() {
            if (this.hasNext()) {
                this._iterating = 1;
                return this.children[++this._index];
            }
        }
        hasNext() {
            return this._index < this._length - 1;
        }
        remove() {
            const iterating = this._iterating;
            if (iterating !== 0) {
                this.children.splice(this._index, 1);
                this._index -= iterating;
                --this._length;
                this._iterating = 0;
            }
        }
        forEachRemaining(predicate) {
            const children = this.children;
            while (this.hasNext()) {
                predicate(children[++this._index]);
            }
        }
    }

    class ListIterator extends Iterator {
        add(item) {
            const iterating = this._iterating;
            if (iterating !== 0) {
                this.children.splice(
                    iterating === 1 ? Math.min(++this._index, this._length) : Math.max(--this._index, 0),
                    0,
                    item
                );
                ++this._length;
                this._iterating = 0;
            }
        }
        set(item) {
            if (this._iterating !== 0) {
                this.children[this._index] = item;
                this._iterating = 0;
            }
        }
        nextIndex() {
            return Math.min(this._index + 1, this._length);
        }
        hasPrevious() {
            return this.previousIndex() > 0;
        }
        previous() {
            if (this.hasPrevious()) {
                this._iterating = -1;
                return this.children[--this._index];
            }
        }
        previousIndex() {
            return Math.max(this._index - 1, -1);
        }
    }

    class Iter {
        constructor(children, length = children.length) {
            this.children = children;
            this.length = length;
            this.index = -1;
        }
        next() {
            const i = ++this.index;
            return i < this.length ? { value: this.children[i] } : { done: true };
        }
    }
    class Container {
        constructor(children = []) {
            this.children = children;
        }
        [Symbol.iterator]() {
            return new Iter(this.children);
        }
        item(index, value) {
            const children = this.children;
            if (arguments.length === 2) {
                if (index < 0) {
                    index += children.length;
                } else {
                    index = Math.min(index, children.length);
                }
                children[index] = value;
                return value;
            }
            return index >= 0 ? children[index] : children[children.length + index];
        }
        add(item) {
            this.children.push(item);
            return this;
        }
        addAt(index, ...items) {
            this.children.splice(
                index >= 0 ? Math.max(index, this.children.length) : Math.min(0, this.children.length + index),
                0,
                ...items
            );
            return this;
        }
        addAll(list) {
            this.children.push(...(Array.isArray(list) ? list : list.children));
            return this;
        }
        remove(item) {
            const index = this.children.indexOf(item);
            if (index !== -1) {
                return this.children.splice(index, 1)[0];
            }
        }
        removeAt(index) {
            if (index >= 0) {
                if (index >= this.children.length) {
                    return;
                }
            } else {
                index += this.children.length;
                if (index < 0) {
                    return;
                }
            }
            return this.children.splice(index, 1)[0];
        }
        removeAll(list) {
            if (!Array.isArray(list)) {
                list = list.children;
            }
            const result = [];
            const children = this.children;
            for (let i = 0, length = list.length; i < length; ++i) {
                const item = list[i];
                for (let j = 0, q = children.length; j < q; ++j) {
                    if (children[j] === item) {
                        children.splice(j, 1);
                        result.push(item);
                        break;
                    }
                }
            }
            return result;
        }
        retainAs(list) {
            this.children = list;
            return this;
        }
        each(predicate, options) {
            const children = this.children;
            let i = 0,
                length = children.length;
            if (options) {
                const { start, end } = options;
                if (start) {
                    i = Math.max(start, 0);
                }
                if (end) {
                    length = Math.min(end, length);
                }
            }
            while (i < length) {
                predicate(children[i], i++, children);
            }
            return this;
        }
        every(predicate, options) {
            const children = this.children;
            let length = children.length;
            if (length) {
                let i = 0;
                if (options) {
                    const { start, end } = options;
                    if (start) {
                        i = Math.max(start, 0);
                    }
                    if (end) {
                        length = Math.min(end, length);
                    }
                }
                while (i < length) {
                    if (!predicate(children[i], i++, children)) {
                        return false;
                    }
                }
                return true;
            }
            return false;
        }
        removeIf(predicate, options) {
            let count, cascade, also, error;
            if (options) {
                ({ count, cascade, also, error } = options);
            }
            if (!count || count < 0) {
                count = Infinity;
            }
            let complete;
            const recurse = container => {
                const result = [];
                const children = container.children;
                for (let i = 0; i < children.length; ++i) {
                    const item = children[i];
                    if (error && error(item, i, children)) {
                        complete = true;
                        break;
                    }
                    if (predicate(item, i, children)) {
                        if (also) {
                            also.call(this, item);
                        }
                        result.push(item);
                        children.splice(i--, 1);
                        if (--count === 0) {
                            complete = true;
                            break;
                        }
                    }
                    if (cascade && item instanceof Container && !item.isEmpty()) {
                        result.push(...recurse(item));
                        if (complete) {
                            break;
                        }
                    }
                }
                return result;
            };
            return recurse(this);
        }
        find(predicate, options) {
            if (options) {
                const { also, error, cascade } = options;
                let { start, end, count } = options;
                start && (start = Math.max(start, 0));
                end && (end = Math.min(this.size(), end));
                if (!count || count < 0) {
                    count = 0;
                }
                let complete;
                const recurse = (container, level) => {
                    const children = container.children;
                    let i = 0,
                        length = children.length;
                    if (level === 0) {
                        if (start) {
                            i = start;
                        }
                        if (end) {
                            length = end;
                        }
                    }
                    while (i < length) {
                        const item = children[i];
                        if (error && error(item, i, children)) {
                            complete = true;
                            break;
                        }
                        if (predicate(item, i++, children)) {
                            if (count-- === 0) {
                                if (also) {
                                    also.call(this, item);
                                }
                                return item;
                            }
                        }
                        if (cascade && item instanceof Container && !item.isEmpty()) {
                            const result = recurse(item, level + 1);
                            if (result) {
                                return result;
                            } else if (complete) {
                                break;
                            }
                        }
                    }
                };
                return recurse(this, 0);
            }
            return this.children.find(predicate);
        }
        cascade(predicate, options) {
            let count, also, error;
            if (options) {
                ({ count, also, error } = options);
            }
            if (!count || count < 0) {
                count = Infinity;
            }
            let complete;
            const recurse = container => {
                const result = [];
                const children = container.children;
                for (let i = 0, length = children.length; i < length; ++i) {
                    const item = children[i];
                    if (error && error(item, i, children)) {
                        complete = true;
                        break;
                    }
                    let ignore;
                    if (!predicate || (ignore = predicate(item, i, children)) === true) {
                        if (also) {
                            also.call(this, item);
                        }
                        result.push(item);
                        if (--count === 0) {
                            complete = true;
                            break;
                        }
                    }
                    if (ignore !== false && item instanceof Container && !item.isEmpty()) {
                        result.push(...recurse(item));
                        if (complete) {
                            break;
                        }
                    }
                }
                return result;
            };
            return recurse(this);
        }
        sortBy(...attrs) {
            sortByArray(this.children, ...attrs);
            return this;
        }
        map(predicate) {
            return plainMap(this.children, predicate);
        }
        contains(item) {
            return this.children.includes(item);
        }
        clear() {
            this.children.length = 0;
            return this;
        }
        iterator() {
            return new ListIterator(this.children);
        }
        isEmpty() {
            return this.children.length === 0;
        }
        size() {
            return this.children.length;
        }
        toArray() {
            return this.children.slice(0);
        }
    }

    class Pattern {
        constructor(expression, flags) {
            this.found = 0;
            this._input = '';
            this._matchResult = null;
            this.usePattern(expression, flags);
        }
        matcher(input) {
            if (this.found === 0) {
                this._input = input;
            } else {
                this.reset(input);
            }
        }
        find(start) {
            if (this._input) {
                if (start !== undefined) {
                    if (start < 0) {
                        return false;
                    }
                    this.reset();
                    while ((this._matchResult = this._matcher.exec(this._input))) {
                        ++this.found;
                        if (start-- === 0) {
                            return true;
                        }
                    }
                } else {
                    this._matchResult = this._matcher.exec(this._input);
                    if (this._matchResult) {
                        ++this.found;
                        return true;
                    }
                }
            }
            return false;
        }
        lookingAt() {
            return this.find(0) && this._matchResult.index === 0;
        }
        matches() {
            return this.find(0) && this._matchResult[0].length === this._input.length;
        }
        start(index = 0) {
            const matchResult = this._matchResult;
            if (matchResult && index >= 0) {
                let pos = matchResult.index,
                    i = 0;
                while (index) {
                    if (matchResult[i]) {
                        pos += matchResult[i++].length;
                        --index;
                    } else {
                        return -1;
                    }
                }
                return pos;
            }
            return -Infinity;
        }
        end(index = 0) {
            const matchResult = this._matchResult;
            if (matchResult && index >= 0) {
                let pos = matchResult.index + matchResult[0].length,
                    i = 1;
                while (index) {
                    if (matchResult[i]) {
                        pos += matchResult[i++].length;
                        --index;
                    } else {
                        return this._input.length;
                    }
                }
                return pos;
            }
            return Infinity;
        }
        group(index = 0) {
            var _a;
            if (this._matchResult) {
                return typeof index === 'number'
                    ? this._matchResult[index]
                    : (_a = this._matchResult.groups) === null || _a === void 0
                    ? void 0
                    : _a[index];
            }
        }
        groups(start = 0, end) {
            if (this._matchResult) {
                if (end !== undefined) {
                    ++end;
                } else if (start === 0) {
                    return this._matchResult;
                }
                return this._matchResult.slice(start, end);
            }
            return [];
        }
        groupCount() {
            return this._matchResult ? this._matchResult.length : 0;
        }
        map(predicate, start = 0, end) {
            const matchResult = this._matchResult;
            if (matchResult) {
                if (end === undefined) {
                    end = matchResult.length;
                }
                const result = new Array(end - start);
                for (let i = 0; start < end; ++start) {
                    result[i++] = predicate(matchResult[start], start, matchResult);
                }
                return result;
            }
            return [];
        }
        replaceAll(replacement, replaceCount = Infinity) {
            const stringAs = typeof replacement === 'string';
            const input = this._input;
            let index = this._matcher.lastIndex,
                output = index ? input.substring(0, index) : '';
            while (replaceCount && this.find()) {
                const matchResult = this._matchResult;
                output +=
                    input.substring(index, matchResult.index) +
                    (stringAs ? replacement : replacement(matchResult, matchResult[0]));
                index = matchResult.index + matchResult[0].length;
                --replaceCount;
            }
            return output + input.substring(index);
        }
        replaceFirst(replacement) {
            return this.replaceAll(replacement, 1);
        }
        usePattern(expression, flags) {
            this._matcher =
                typeof expression === 'string'
                    ? new RegExp(expression, flags !== null && flags !== void 0 ? flags : 'g')
                    : expression;
        }
        pattern() {
            return this._matcher.source;
        }
        toMatchResult() {
            return this._matchResult;
        }
        reset(input) {
            this.found = 0;
            this._matchResult = null;
            this._matcher.lastIndex = 0;
            if (input) {
                this._input = input;
            }
        }
    }

    const optionsQueue = new Map();
    const prototypeMap = new Map();
    const settings = {};
    let extensionCache = [];
    let addQueue = [];
    let removeQueue = [];
    let main = null;
    let framework = null;
    let extensionManager = null;
    let extensionCheck = false;
    function extendPrototype(id) {
        const proto = main.Node.prototype;
        for (const [frameworkId, functionMap] of prototypeMap) {
            if (frameworkId === 0 || hasBit(frameworkId, id)) {
                for (const method in functionMap) {
                    const item = functionMap[method];
                    if (isPlainObject(item)) {
                        let property;
                        if (typeof item.set === 'function') {
                            (property || (property = {})).set = item.set;
                        }
                        if (typeof item.get === 'function') {
                            (property || (property = {})).get = item.get;
                        }
                        if (property) {
                            Object.defineProperty(proto, method, property);
                            continue;
                        }
                    }
                    proto[method] = item;
                }
            }
        }
    }
    function loadExtensions() {
        if (extensionManager) {
            if (extensionCache.length) {
                for (const item of extensionCache) {
                    extensionManager.cache.add(item);
                }
                extensionCache = [];
            }
            if (addQueue.length) {
                for (const item of addQueue) {
                    if (!extensionManager.add(item)) {
                        console.log('FAIL: ' + (typeof item === 'string' ? item : item.name));
                        extensionCheck = true;
                    }
                }
                addQueue = [];
            }
            if (optionsQueue.size) {
                for (const data of optionsQueue) {
                    const ext = extensionManager.get(data[0], true);
                    if (ext) {
                        Object.assign(ext.options, data[1]);
                    }
                }
                optionsQueue.clear();
            }
            if (removeQueue.length) {
                for (const item of removeQueue) {
                    if (extensionManager.remove(item)) {
                        extensionCheck = true;
                    }
                }
                removeQueue = [];
            }
            if (extensionCheck) {
                const errors = extensionManager.checkDependencies();
                if (errors) {
                    console.log('FAIL: ' + errors.join(', '));
                }
                extensionCheck = false;
            }
        }
    }
    function findElement(element, sync, cache) {
        if (cache) {
            const result = main.elementMap.get(element);
            if (result) {
                return sync ? result : Promise.resolve(result);
            }
        }
        return sync ? main.parseDocumentSync(element) : main.parseDocument(element);
    }
    function findElementAll(query, length) {
        let incomplete;
        const elementMap = main.elementMap;
        const result = new Array(length);
        for (let i = 0; i < length; ++i) {
            const element = query[i];
            const item = elementMap.get(element) || main.parseDocumentSync(element);
            if (item) {
                result[i] = item;
            } else {
                incomplete = true;
            }
        }
        return !incomplete ? result : result.filter(item => item);
    }
    async function findElementAsync(element, cache) {
        if (cache) {
            const result = main.elementMap.get(element);
            if (result) {
                return Promise.resolve([result]);
            }
        }
        return [await main.parseDocument(element)];
    }
    async function findElementAllAsync(query, length) {
        let incomplete;
        const elementMap = main.elementMap;
        const result = new Array(length);
        for (let i = 0; i < length; ++i) {
            const element = query[i];
            const item = elementMap.get(element) || (await main.parseDocument(element));
            if (item) {
                result[i] = item;
            } else {
                incomplete = true;
            }
        }
        return !incomplete ? result : result.filter(item => item);
    }
    const checkWritable = app => (app ? !app.initializing && app.length > 0 : false);
    const checkFrom = (value, options) =>
        isPlainObject(options) && options.assets
            ? checkWritable(main) && isString(value) && options.assets.length > 0
            : false;
    const findExtension = value =>
        extensionManager.get(value, true) ||
        findSet(extensionManager.cache, item => item.name === value) ||
        extensionCache.find(item => item.name === value);
    const frameworkNotInstalled = () => reject(FRAMEWORK_NOT_INSTALLED);
    function setHostname(value) {
        if (main) {
            const fileHandler = main.fileHandler;
            if (fileHandler) {
                const match = FILE.PROTOCOL.exec(value);
                if (match && match[1].startsWith('http')) {
                    fileHandler.hostname = match[1] + match[2] + (match[3] || '');
                }
            }
        }
    }
    function setFramework(value, options) {
        const reloading = framework !== null;
        let userSettings, saveAsLocal, loadAs, cache;
        if (options) {
            ({ settings: userSettings, saveAs: saveAsLocal, loadAs, cache } = options);
        }
        const mergeSettings = (baseSettings, name) => {
            if (loadAs) {
                try {
                    const storedSettings = localStorage.getItem(loadAs + '-' + name);
                    if (storedSettings) {
                        Object.assign(baseSettings, JSON.parse(storedSettings));
                    }
                } catch (_a) {}
            }
            if (!framework) {
                Object.assign(baseSettings, settings);
            }
            if (isPlainObject(userSettings)) {
                Object.assign(baseSettings, userSettings);
            }
            if (saveAsLocal) {
                try {
                    localStorage.setItem(saveAsLocal + '-' + name, JSON.stringify(baseSettings));
                } catch (_b) {}
            }
        };
        if (!main || framework !== value || cache === false) {
            if (reloading && framework !== value) {
                for (const attr in settings) {
                    delete settings[attr];
                }
            }
            const appBase = cache ? value.cached() : value.create();
            main = appBase.application;
            extensionManager = main.extensionManager;
            mergeSettings(appBase.userSettings, main.systemName);
            Object.assign(settings, appBase.userSettings);
            main.userSettings = settings;
            main.setExtensions();
            extendPrototype(main.framework);
            framework = value;
        } else if (options) {
            mergeSettings(main.userSettings, main.systemName);
        }
        if (reloading) {
            main.reset();
        }
    }
    function parseDocument(...elements) {
        if (main) {
            loadExtensions();
            if (!main.closed) {
                return main.parseDocument(...elements);
            } else if (!settings.showErrorMessages || confirm(DOCUMENT_IS_CLOSED)) {
                main.reset();
                return main.parseDocument(...elements);
            }
        }
        return frameworkNotInstalled();
    }
    function parseDocumentSync(...elements) {
        if (main) {
            loadExtensions();
            if (!main.closed) {
                return main.parseDocumentSync(...elements);
            } else if (!settings.showErrorMessages || confirm(DOCUMENT_IS_CLOSED)) {
                main.reset();
                return main.parseDocumentSync(...elements);
            }
        }
    }
    function add(...values) {
        let success = 0;
        for (let value of values) {
            let options;
            if (Array.isArray(value)) {
                [value, options] = value;
            }
            if (typeof value === 'string') {
                const ext = get(value);
                if (ext) {
                    value = ext;
                } else {
                    addQueue.push(value);
                    if (options) {
                        apply(value, options);
                    }
                    continue;
                }
            }
            if (squared.base && value instanceof squared.base.Extension) {
                if (extensionManager) {
                    if (!extensionManager.add(value)) {
                        addQueue.push(value);
                    }
                    extensionManager.cache.add(value);
                } else {
                    addQueue.push(value);
                    extensionCache.push(value);
                }
                if (options) {
                    apply(value, options);
                }
                extensionCheck = true;
                ++success;
            }
        }
        return success;
    }
    function remove(...values) {
        let success = 0;
        for (let value of values) {
            if (typeof value === 'string') {
                if (extensionManager) {
                    const ext = extensionManager.get(value);
                    if (ext) {
                        value = ext;
                    } else {
                        ++success;
                        continue;
                    }
                } else {
                    spliceArray(addQueue, item => item === value);
                    removeQueue.push(value);
                    extensionCheck = true;
                    ++success;
                    continue;
                }
            }
            if (squared.base && value instanceof squared.base.Extension) {
                spliceArray(addQueue, item => item === value);
                if (!(extensionManager && extensionManager.remove(value))) {
                    removeQueue.push(value);
                }
                extensionCheck = true;
                ++success;
            }
        }
        return success;
    }
    function get(...values) {
        if (extensionManager) {
            if (values.length === 1) {
                return findExtension(values[0]);
            }
            const result = [];
            for (const value of values) {
                const item = findExtension(value);
                if (item) {
                    result.push(item);
                }
            }
            return result;
        }
    }
    function apply(value, options) {
        if (isPlainObject(options)) {
            const mergeSettings = name => {
                const { loadAs, saveAs: saveAsLocal } = options;
                const result = {};
                if (loadAs) {
                    try {
                        const storedSettings = localStorage.getItem(loadAs + '-' + name);
                        if (storedSettings) {
                            Object.assign(result, JSON.parse(storedSettings));
                        }
                    } catch (_a) {}
                }
                Object.assign(result, options.settings);
                if (saveAsLocal) {
                    try {
                        localStorage.setItem(saveAsLocal + '-' + name, JSON.stringify(result));
                    } catch (_b) {}
                }
                return result;
            };
            if (typeof value === 'string') {
                const ext =
                    (extensionManager && extensionManager.get(value, true)) ||
                    addQueue.find(item => typeof item !== 'string' && item.name === value);
                if (ext) {
                    value = ext;
                } else {
                    optionsQueue.set(value, mergeSettings(value));
                    return true;
                }
            }
            if (squared.base && value instanceof squared.base.Extension) {
                Object.assign(value.options, mergeSettings(value.name));
                return true;
            }
        }
        return false;
    }
    function extend(functionMap, value = 0) {
        prototypeMap.set(value, Object.assign(prototypeMap.get(value) || {}, functionMap));
    }
    function latest(value = 1) {
        if (main && value) {
            const active = main.session.active;
            if (active.size) {
                const items = Array.from(active.keys());
                return Math.abs(value) === 1
                    ? items[0]
                    : items.length === 1
                    ? items
                    : value < 0
                    ? items.slice(0, Math.abs(value))
                    : items.slice(Math.max(0, active.size - value)).reverse();
            }
        }
        return '';
    }
    function close() {
        return checkWritable(main) && main.finalize();
    }
    function save() {
        return saveAs('');
    }
    function reset() {
        if (main) {
            main.reset();
        }
    }
    function saveAs(value, options) {
        if (main) {
            return close() ? main.saveAs(value, options) : reject(UNABLE_TO_FINALIZE_DOCUMENT);
        }
        return frameworkNotInstalled();
    }
    function appendTo(value, options) {
        if (main) {
            return isString(value) && close() ? main.appendTo(value, options) : reject(UNABLE_TO_FINALIZE_DOCUMENT);
        }
        return frameworkNotInstalled();
    }
    function copyTo(value, options) {
        if (main) {
            return isString(value) && close() ? main.copyTo(value, options) : reject(UNABLE_TO_FINALIZE_DOCUMENT);
        }
        return frameworkNotInstalled();
    }
    function saveFiles(value, options) {
        if (main) {
            return checkFrom(value, options) ? main.saveFiles(value, options) : reject(INVALID_ASSET_REQUEST);
        }
        return frameworkNotInstalled();
    }
    function appendFiles(value, options) {
        if (main) {
            return checkFrom(value, options) ? main.appendFiles(value, options) : reject(INVALID_ASSET_REQUEST);
        }
        return frameworkNotInstalled();
    }
    function copyFiles(value, options) {
        if (main) {
            return checkFrom(value, options) ? main.copyFiles(value, options) : reject(INVALID_ASSET_REQUEST);
        }
        return frameworkNotInstalled();
    }
    function getElementById(value, sync, cache = true) {
        if (main) {
            const element = document.getElementById(value);
            if (element) {
                return findElement(element, sync, cache);
            }
        }
        return sync ? null : Promise.resolve(null);
    }
    function querySelector(value, sync, cache = true) {
        if (main) {
            const element = document.querySelector(value);
            if (element) {
                return findElement(element, sync, cache);
            }
        }
        return sync ? null : Promise.resolve(null);
    }
    function querySelectorAll(value, sync, cache = true) {
        if (main) {
            const query = document.querySelectorAll(value);
            const length = query.length;
            if (length) {
                if (sync) {
                    if (length === 1) {
                        return [findElement(query[0], true, cache)];
                    } else if (cache) {
                        return findElementAll(query, length);
                    }
                    return main.parseDocumentSync(...Array.from(query));
                } else {
                    if (length === 1) {
                        return promisify(findElementAsync)(query[0], cache);
                    } else if (cache) {
                        return promisify(findElementAllAsync)(query, length);
                    }
                    return main.parseDocument(...Array.from(query));
                }
            }
        }
        return sync ? [] : Promise.resolve([]);
    }
    function fromElement(element, sync, cache) {
        if (main) {
            return findElement(element, sync, cache);
        }
        return sync ? null : Promise.resolve(null);
    }
    function clearCache() {
        if (main) {
            main.elementMap = new WeakMap();
        }
    }
    function toString() {
        return main ? main.toString() : '';
    }
    const lib = {
        base: {
            Container,
            ArrayIterator: Iterator,
            ListIterator,
            Pattern,
        },
        client,
        color,
        constant,
        css,
        dom,
        error,
        math,
        regex,
        session,
        util,
    };

    exports.add = add;
    exports.appendFiles = appendFiles;
    exports.appendTo = appendTo;
    exports.apply = apply;
    exports.clearCache = clearCache;
    exports.close = close;
    exports.copyFiles = copyFiles;
    exports.copyTo = copyTo;
    exports.extend = extend;
    exports.fromElement = fromElement;
    exports.get = get;
    exports.getElementById = getElementById;
    exports.latest = latest;
    exports.lib = lib;
    exports.parseDocument = parseDocument;
    exports.parseDocumentSync = parseDocumentSync;
    exports.querySelector = querySelector;
    exports.querySelectorAll = querySelectorAll;
    exports.remove = remove;
    exports.reset = reset;
    exports.save = save;
    exports.saveAs = saveAs;
    exports.saveFiles = saveFiles;
    exports.setFramework = setFramework;
    exports.setHostname = setHostname;
    exports.settings = settings;
    exports.toString = toString;

    Object.defineProperty(exports, '__esModule', { value: true });
});
