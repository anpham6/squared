export function minArray(list: number[]): number {
    if (list.length) {
        return Math.min.apply(null, list);
    }
    return Number.POSITIVE_INFINITY;
}

export function maxArray(list: number[]): number {
    if (list.length) {
        return Math.max.apply(null, list);
    }
    return Number.NEGATIVE_INFINITY;
}

export function isEqual(valueA: number, valueB: number, precision = 8) {
    return valueA.toPrecision(precision) === valueB.toPrecision(precision);
}

export function moreEqual(valueA: number, valueB: number, precision = 8) {
    return valueA > valueB || isEqual(valueA, valueB, precision);
}

export function lessEqual(valueA: number, valueB: number, precision = 8) {
    return valueA < valueB || isEqual(valueA, valueB, precision);
}

export function truncate(value: number, precision = 3) {
    if (value === Math.floor(value)) {
        return value.toString();
    }
    else {
        if (value > 1) {
            precision += 1;
            let i = 1;
            while (value / Math.pow(10, i++) >= 1) {
                precision += 1;
            }
        }
        return value.toPrecision(precision).replace(/\.?0+$/, '');
    }
}

export function truncateFraction(value: number) {
    if (value !== Math.floor(value)) {
        const match = /^(\d+)\.(\d*?)(0{5,}|9{5,})\d*$/.exec(value.toString());
        if (match) {
            return match[2] === '' ? Math.round(value) : parseFloat(value.toPrecision((match[1] !== '0' ? match[1].length : 0) + match[2].length));
        }
    }
    return value;
}

export function truncateString(value: string, precision = 3) {
    const pattern = new RegExp(`(\\d+\\.\\d{${precision}})(\\d)\\d*`, 'g');
    let match: RegExpExecArray | null;
    let output = value;
    while ((match = pattern.exec(value)) !== null) {
        if (parseInt(match[2]) >= 5) {
            match[1] = truncateFraction((parseFloat(match[1]) + 1 / Math.pow(10, precision))).toString();
        }
        output = output.replace(match[0], match[1]);
    }
    return output;
}

export function convertRadian(value: number) {
    return value * Math.PI / 180;
}

export function triangulateASA(a: number, b: number, clen: number) {
    const c = 180 - a - b;
    return [
        (clen / Math.sin(convertRadian(c))) * Math.sin(convertRadian(a)),
        (clen / Math.sin(convertRadian(c))) * Math.sin(convertRadian(b))
    ];
}

export function offsetAngle(start: Point, end: Point) {
    const x = end.x - start.x;
    const y = end.y - start.y;
    let value = (Math.atan2(y, x) * 180 / Math.PI) + 90;
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

export function nextMultiple(values: number[], offset?: number[], minimum = 0) {
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