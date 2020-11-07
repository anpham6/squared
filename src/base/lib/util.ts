const HEX = '0123456789abcdef';
const ALPHA = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const NUMERALS = [
    '', 'C', 'CC', 'CCC', 'CD', 'D', 'DC', 'DCC', 'DCCC', 'CM',
    '', 'X', 'XX', 'XXX', 'XL', 'L', 'LX', 'LXX', 'LXXX', 'XC',
    '', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX'
];

export function fromMimeType(value: string) {
    const [type, name] = value.split('/');
    switch (type) {
        case 'image':
            switch (name) {
                case 'apng':
                case 'avif':
                case 'bmp':
                case 'heic':
                case 'heif':
                case 'png':
                case 'webp':
                    return name;
                case 'vnd.wap.wbmp':
                    return 'wbmp';
                case 'jpeg':
                    return 'jpg';
                case 'svg+xml':
                    return 'svg';
                case 'tiff':
                    return 'tif';
                case 'x-ms-bmp':
                    return 'bmp';
                case 'x-icon':
                    return 'ico';
            }
            break;
        case 'audio':
            switch (name) {
                case 'aac':
                case 'flac':
                case 'gif':
                case 'gsm':
                case 'ogg':
                case 'wav':
                case 'webm':
                    return name;
                case 'midi':
                    return 'mid';
                case 'mpeg':
                    return 'mp3';
                case 'x-realaudio':
                    return 'ra';
                case 'wave':
                case 'x-wav':
                case 'x-pn-wav':
                    return 'wav';
            }
            break;
        case 'video':
            switch (name) {
                case 'h264':
                case 'jpeg2000':
                case 'mp4':
                case 'mpeg':
                case 'webm':
                    return name;
                case '3gpp':
                    return '3gp';
                case '3gpp2':
                    return '3g2';
                case 'ogg':
                    return 'ogv';
                case 'mp2t':
                    return 'ts';
                case 'quicktime':
                    return 'mov';
                case 'x-ms-asf':
                    return 'asf';
                case 'x-flv':
                    return 'flv';
                case 'x-m4v':
                    return 'm4v';
                case 'x-matroska':
                    return 'mkv';
                case 'x-mng':
                    return 'mng';
                case 'x-ms-wmv':
                    return 'wmv';
                case 'x-msvideo':
                    return 'avi';
            }
            break;
        case 'text':
            switch (name) {
                case 'css':
                case 'csv':
                case 'html':
                case 'sgml':
                case 'vtt':
                case 'xml':
                    return name;
                case 'calendar':
                    return 'ics';
                case 'javascript':
                    return 'js';
                case 'markdown':
                    return 'md';
                case 'mathml':
                    return 'mml';
                case 'plain':
                    return 'txt';
                case 'vnd.sun.j2me.app-descriptor':
                    return 'jad';
                case 'vnd.wap.wml':
                    return 'wml';
                case 'x-component':
                    return 'htc';
                case 'yaml':
                    return 'yml';
            }
            break;
        case 'font':
            switch (name) {
                case 'otf':
                case 'ttf':
                case 'woff':
                case 'woff2':
                    return name;
                case 'sfnt':
                    return 'ttf';
            }
            break;
        case 'application':
            switch (value) {
                case 'json':
                case 'pdf':
                case 'rtf':
                case 'zip':
                    return name;
                case 'atom+xml':
                    return 'atom';
                case 'epub+zip':
                    return 'epub';
                case 'java-archive':
                    return 'jar';
                case 'ld+json':
                    return 'jsonld';
                case 'msword':
                    return 'doc';
                case 'postscript':
                    return 'ps';
                case 'octet-stream':
                    return 'bin';
                case 'ogg':
                    return 'ogx';
                case 'rss+xml':
                    return 'rss';
                case 'vnd.amazon.ebook':
                    return 'azw';
                case 'vnd.apple.installer+xml':
                    return 'mpkg';
                case 'vnd.mozilla.xul+xml':
                    return 'xul';
                case 'vnd.ms-excel':
                    return 'xls';
                case 'vnd.ms-fontobject':
                    return 'eot';
                case 'vnd.ms-powerpoint':
                    return 'ppt';
                case 'vnd.oasis.opendocument.graphics':
                    return 'odg';
                case 'vnd.oasis.opendocument.presentation':
                    return 'odp';
                case 'vnd.oasis.opendocument.spreadsheet':
                    return 'ods';
                case 'vnd.oasis.opendocument.text':
                    return 'odt';
                case 'vnd.openxmlformats-officedocument.presentationml.presentation':
                    return 'pptx';
                case 'vnd.openxmlformats-officedocument.spreadsheetml.sheet':
                    return 'xlsx';
                case 'vnd.openxmlformats-officedocument.wordprocessingml.document':
                    return 'docx';
                case 'vnd.visio':
                    return 'vsd';
                case 'x-7z-compressed':
                    return '7z';
                case 'x-abiword':
                    return 'abw';
                case 'x-bzip':
                    return 'bz';
                case 'x-bzip2':
                    return 'bz2';
                case 'x-csh':
                    return 'csh';
                case 'x-freearc':
                    return 'arc';
                case 'x-perl':
                    return 'pl';
                case 'x-rar-compressed':
                    return 'rar';
                case 'x-sh':
                    return 'sh';
                case 'x-shockwave-flash':
                    return 'swf';
                case 'x-tar':
                    return 'tar';
                case 'xhtml+xml':
                    return 'xhtml';
            }
            break;
    }
    return '';
}

export function appendSeparator(preceding = '', value = '', separator = '/') {
    preceding = preceding.trim();
    value = value.trim();
    switch (separator) {
        case '\\':
            preceding &&= preceding.replace(/\//g, '\\');
            value &&= value.replace(/\//g, '\\');
            break;
        case '/':
            preceding &&= preceding.replace(/\\/g, '/');
            value &&= value.replace(/\\/g, '/');
            break;
    }
    return preceding + (preceding && value && !preceding.endsWith(separator) && !value.startsWith(separator) ? separator : '') + value;
}

export function randomUUID(separator = '-') {
    let result = '';
    for (const length of [8, 4, 4, 4, 12]) {
        if (result) {
            result += separator;
        }
        for (let i = 0; i < length; ++i) {
            result += HEX[Math.floor(Math.random() * 16)];
        }
    }
    return result;
}

export function upperCaseString(value: string) {
    const pattern = /\b([a-z])/g;
    let result: Undef<string[]>,
        match: Null<RegExpMatchArray>;
    while (match = pattern.exec(value)) {
        (result ||= value.split(''))[match.index!] = match[1][0].toUpperCase();
    }
    return result ? result.join('') : value;
}

export function lowerCaseString(value: string) {
    const entities: string[] = [];
    const pattern = /&#?[A-Za-z\d]+?;/g;
    let match: Null<RegExpMatchArray>;
    while (match = pattern.exec(value)) {
        entities.push(match[0]);
    }
    if (entities.length) {
        let result = '';
        const segments = value.split(pattern);
        for (let i = 0, length = segments.length; i < length; ++i) {
            result += segments[i].toLowerCase() + (entities[i] || '');
        }
        return result;
    }
    return value.toLowerCase();
}

export function convertListStyle(name: string, value: number, valueAsDefault?: boolean) {
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

export function convertAlpha(value: number) {
    if (value >= 0) {
        let result = '';
        const length = ALPHA.length;
        while (value >= length) {
            const base = Math.floor(value / length);
            if (base > 1 && base <= length) {
                result += ALPHA[base - 1];
                value -= base * length;
            }
            else if (base) {
                result += 'Z';
                value -= Math.pow(length, 2);
                result += convertAlpha(value);
                return result;
            }
            const index = value % length;
            result += ALPHA[index];
            value -= index + length;
        }
        return ALPHA[value] + result;
    }
    return value.toString();
}

export function convertRoman(value: number) {
    const digits = value.toString().split('');
    let result = '',
        i = 3;
    while (i--) {
        result = (NUMERALS[+digits.pop()! + (i * 10)] || '') + result;
    }
    return 'M'.repeat(+digits.join('')) + result;
}