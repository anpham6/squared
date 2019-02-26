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

export function distanceFromX(value: number, angle: number) {
    return value * Math.sin(convertRadian(angle));
}

export function distanceFromY(value: number, angle: number) {
    return value * Math.cos(convertRadian(angle)) * -1;
}

export function truncateString(value: string, precision = 3) {
    let result = value;
    const pattern = new RegExp(`(\\d+\\.\\d{${precision}})\\d+`, 'g');
    let match: RegExpExecArray | null;
    while ((match = pattern.exec(value)) !== null) {
        result = result.replace(match[0], match[1]);
    }
    return result;
}

export function truncateRange(value: number, precision = 3) {
    if (value === 0 || value === 1) {
        return value.toString();
    }
    else {
        return value.toPrecision(precision).replace(/\.?0+$/, '');
    }
}

export function truncatePrecision(value: number) {
    const match = /^\d+\.(\d+?)(0{5,}|9{5,})\d*$/.exec(value.toString());
    if (match) {
        return parseFloat(value.toPrecision(match[1].length));
    }
    return value;
}

export function convertRadian(value: number) {
    return value * Math.PI / 180;
}

export function getAngle(start: Point, end: Point) {
    const y = end.y - start.y;
    const value = Math.atan2(y, end.x - start.x) * 180 / Math.PI;
    if (value < 0) {
        return 270 + (y < 0 ? value : Math.abs(value)) % 360;
    }
    else {
        return (value + 90) % 360;
    }
}

export function getLeastCommonMultiple(values: number[], offset?: number[]) {
    if (values.length > 1) {
        const increment = minArray(values);
        let minimum = 0;
        if (offset) {
            if (offset.length === values.length) {
                for (let i = 0; i < offset.length; i++) {
                    minimum = Math.max(minimum, offset[i] + values[i]);
                }
            }
            else {
                offset = undefined;
            }
        }
        if (offset === undefined) {
            minimum = Math.max(minimum, increment);
        }
        let result = minimum;
        let valid = false;
        while (!valid) {
            for (let i = 0; i < values.length; i++) {
                const total = result - (offset ? offset[i] : 0);
                if (total % values[i] === 0) {
                    valid = true;
                }
                else {
                    valid = false;
                    result += increment;
                    break;
                }
            }
        }
        return result;
    }
    return values[0];
}