const REGEXP_TRUNCATECACHE = new Map<number, RegExp>();
const REGEXP_DECIMALNOTAION = /^(-?\d+\.\d+)e(-?\d+)$/;
const REGEXP_FRACTION = /^(-?\d+)\.(\d*?)(0{5,}|9{5,})\d*$/;
const REGEXP_TRAILINGZERO = /\.(\d*?)(0+)$/;

function convertDecimalNotation(value: number) {
    const match = REGEXP_DECIMALNOTAION.exec(value.toString());
    return match ? parseInt(match[2]) > 0 ? Number.MAX_SAFE_INTEGER.toString() : '0' : value.toString();
}

export function equal(a: number, b: number, precision = 5) {
    precision += Math.floor(a).toString().length;
    return a.toPrecision(precision) === b.toPrecision(precision);
}

export function moreEqual(a: number, b: number, precision = 5) {
    return a > b || equal(a, b, precision);
}

export function lessEqual(a: number, b: number, precision = 5) {
    return a < b || equal(a, b, precision);
}

export function truncate(value: NumString, precision = 3) {
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
    if (base !== 0) {
        precision += base.toString().length;
    }
    return truncateTrailingZero(value.toPrecision(precision));
}

export function truncateFraction(value: number) {
    if (value !== Math.floor(value)) {
        const match = REGEXP_FRACTION.exec(convertDecimalNotation(value));
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
    const match = REGEXP_TRAILINGZERO.exec(value);
    return match ? value.substring(0, value.length - match[match[1] ? 2 : 0].length) : value;
}

export function truncateString(value: string, precision = 3) {
    let pattern = REGEXP_TRUNCATECACHE.get(precision);
    if (!pattern) {
        pattern = new RegExp(`(-?\\d+\\.\\d{${precision}})(\\d)\\d*`, 'g');
        REGEXP_TRUNCATECACHE.set(precision, pattern);
    }
    let output = value,
        match: Null<RegExpExecArray>;
    while (match = pattern.exec(value)) {
        let trailing = match[1];
        if (parseInt(match[2]) >= 5) {
            trailing = truncateFraction(parseFloat(trailing) + 1 / Math.pow(10, precision)).toString();
        }
        output = output.replace(match[0], truncateTrailingZero(trailing));
    }
    pattern.lastIndex = 0;
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

export function clamp(value: number, min = 0, max = 1) {
    if (value < min) {
        value = min;
    }
    else if (value > max) {
        value = max;
    }
    return value;
}

export function multipleOf(values: number[], min = 0, offset?: Null<number[]>) {
    const length = values.length;
    if (length > 1) {
        const increment = Math.min(...values);
        if (offset && offset.length === length) {
            for (let i = 0; i < length; ++i) {
                min = Math.max(min, offset[i] + values[i]);
            }
        }
        else {
            offset = null;
            min = Math.max(min, increment);
        }
        let value = 0;
        while (value < min) {
            value += increment;
        }
        const start = offset && offset[0] || 0;
        let valid: Undef<boolean>;
        while (!valid) {
            const total = start + value;
            for (let i = 1; i < length; ++i) {
                const multiple = (offset ? offset[i] : 0) + values[i];
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

export function sin(value: number, accuracy = 11) {
    value = convertRadian(value);
    let result = value;
    for (let i = 3, j = 0; i <= accuracy; i += 2, ++j) {
        result += Math.pow(value, i) / factorial(i) * (j % 2 === 0 ? -1 : 1);
    }
    return result;
}

export function cos(value: number, accuracy = 10) {
    value = convertRadian(value);
    let result = 1;
    for (let i = 2, j = 0; i <= accuracy; i += 2, ++j) {
        result += Math.pow(value, i) / factorial(i) * (j % 2 === 0 ? -1 : 1);
    }
    return result;
}

export function tan(value: number, accuracy = 11) {
    return sin(value, accuracy) / cos(value, accuracy);
}

export function factorial(value: number) {
    let result = 2;
    for (let i = 3; i <= value; ++i) {
        result *= i;
    }
    return result;
}

export function hypotenuse(a: number, b: number) {
    return Math.sqrt(Math.pow(a, 2) + Math.pow(b, 2));
}
