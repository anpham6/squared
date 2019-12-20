import { CHAR } from './regex';

const REGEX_DECIMALNOTATION = /^(-?\d+\.\d+)e(-?\d+)$/;
const REGEX_TRUNCATE = /^(-?\d+)\.(\d*?)(0{5,}|9{5,})\d*$/;
const REGEX_TRUNCATECACHE = {};

function convertDecimalNotation(value: number) {
    const match = REGEX_DECIMALNOTATION.exec(value.toString());
    if (match) {
        return parseInt(match[2]) > 0 ? Number.MAX_SAFE_INTEGER.toString() : '0';
    }
    return value.toString();
}

export function minArray(list: number[]): number {
    return Math.min.apply(null, list);
}

export function maxArray(list: number[]): number {
    return Math.max.apply(null, list);
}

export function isEqual(valueA: number, valueB: number, precision = 5) {
    const length = Math.floor(valueA).toString().length;
    return valueA.toPrecision(length + precision) === valueB.toPrecision(length + precision);
}

export function moreEqual(valueA: number, valueB: number, precision = 5) {
    return valueA > valueB || isEqual(valueA, valueB, precision);
}

export function lessEqual(valueA: number, valueB: number, precision = 5) {
    return valueA < valueB || isEqual(valueA, valueB, precision);
}

export function truncate(value: number | string, precision = 3) {
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

export function truncateFraction(value: number) {
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

export function truncateTrailingZero(value: string) {
    const match = CHAR.TRAILINGZERO.exec(value);
    return match ? value.substring(0, value.length - match[match[1] ? 2 : 0].length) : value;
}

export function truncateString(value: string, precision = 3) {
    let pattern = REGEX_TRUNCATECACHE[precision];
    if (pattern === undefined) {
        pattern = new RegExp(`(-?\\d+\\.\\d{${precision}})(\\d)\\d*`, 'g');
        REGEX_TRUNCATECACHE[precision] = pattern;
    }
    else {
        pattern.lastIndex = 0;
    }
    let output = value;
    let match: RegExpExecArray | null;
    while ((match = pattern.exec(value)) !== null) {
        if (parseInt(match[2]) >= 5) {
            match[1] = truncateFraction((parseFloat(match[1]) + 1 / Math.pow(10, precision))).toString();
        }
        output = output.replace(match[0], truncateTrailingZero(match[1]));
    }
    return output;
}

export function convertRadian(value: number) {
    return value * Math.PI / 180;
}

export function triangulate(a: number, b: number, clen: number) {
    const c = 180 - a - b;
    return [
        (clen / Math.sin(convertRadian(c))) * Math.sin(convertRadian(a)),
        (clen / Math.sin(convertRadian(c))) * Math.sin(convertRadian(b))
    ];
}

export function absoluteAngle(start: Point, end: Point) {
    const x = end.x - start.x;
    const y = end.y - start.y;
    return Math.atan2(y, x) * 180 / Math.PI;
}

export function relativeAngle(start: Point, end: Point, orientation = 90) {
    let value = absoluteAngle(start, end) + orientation;
    if (value < 0) {
        value += 360;
    }
    return value;
}

export function offsetAngleX(angle: number, value: number) {
    return value * Math.sin(convertRadian(angle));
}

export function offsetAngleY(angle: number, value: number) {
    return value * Math.cos(convertRadian(angle)) * -1;
}

export function clampRange(value: number, min = 0, max = 1) {
    if (value < min) {
        value = min;
    }
    else if (value > max) {
        value = max;
    }
    return value;
}

export function nextMultiple(values: number[], minimum = 0, offset?: number[]) {
    const length = values.length;
    if (length > 1) {
        const increment = minArray(values);
        if (offset?.length === length) {
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