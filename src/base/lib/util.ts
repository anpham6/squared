const HEX = '0123456789abcdef';
const ALPHA = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const NUMERALS = [
    '', 'C', 'CC', 'CCC', 'CD', 'D', 'DC', 'DCC', 'DCCC', 'CM',
    '', 'X', 'XX', 'XXX', 'XL', 'L', 'LX', 'LXX', 'LXXX', 'XC',
    '', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX'
];

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
        result = (NUMERALS[parseInt(digits.pop()!) + (i * 10)] || '') + result;
    }
    return 'M'.repeat(parseInt(digits.join(''))) + result;
}
