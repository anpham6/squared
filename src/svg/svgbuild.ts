import { SvgPathCommand, SvgTransform } from './types/object';

import { applyMatrixX, applyMatrixY, getRadiusY, parseNumberList } from './lib/util';

export default class SvgBuild implements squared.svg.SvgBuild {
    public static applyTransforms(transform: SvgTransform[], points: Point[] | PointR[], origin?: Point) {
        const result: PointR[] = [];
        for (const pt of points as PointR[]) {
            const item: PointR = { x: pt.x, y: pt.y };
            if (pt.rx !== undefined && pt.ry !== undefined) {
                item.rx = pt.rx;
                item.ry = pt.ry;
            }
            result.push(item);
        }
        const items = transform.slice().reverse();
        for (const item of items) {
            let x1 = 0;
            let y1 = 0;
            let x2 = 0;
            let y2 = 0;
            let x3 = 0;
            let y3 = 0;
            if (origin) {
                switch (item.type) {
                    case SVGTransform.SVG_TRANSFORM_SCALE:
                        if (item.method.x) {
                            x1 += origin.x;
                        }
                        if (item.method.y) {
                            y2 += origin.y;
                        }
                        break;
                    case SVGTransform.SVG_TRANSFORM_SKEWX:
                        if (item.method.y) {
                            y1 -= origin.y;
                        }
                        break;
                    case SVGTransform.SVG_TRANSFORM_SKEWY:
                        if (item.method.x) {
                            x2 -= origin.x;
                        }
                        break;
                    case SVGTransform.SVG_TRANSFORM_ROTATE:
                        if (item.method.x) {
                            x2 -= origin.x;
                            x3 = origin.x + getRadiusY(item.angle, origin.x);
                        }
                        if (item.method.y) {
                            y1 -= origin.y;
                            y3 = origin.y + getRadiusY(item.angle, origin.y);
                        }
                        break;
                }
            }
            for (const pt of result) {
                const x = pt.x;
                pt.x = applyMatrixX(item.matrix, x + x1, pt.y + y1) + x3;
                pt.y = applyMatrixY(item.matrix, x + x2, pt.y + y2) + y3;
                if (pt.rx !== undefined && pt.ry !== undefined && item.type === SVGTransform.SVG_TRANSFORM_SCALE) {
                    const rx = pt.rx;
                    pt.rx = applyMatrixX(item.matrix, rx + x1, pt.ry + y1);
                    pt.ry = applyMatrixY(item.matrix, rx + x2, pt.ry + y2);
                }
            }
        }
        return result;
    }

    public static canTransformSkew(values: SvgPathCommand[]) {
        return !values.some(item => {
            switch (item.command.toUpperCase()) {
                case 'A':
                case 'C':
                case 'S':
                case 'Q':
                case 'T':
                    return true;
            }
            return false;
        });
    }

    public static toPointList(points: SVGPointList) {
        const result: Point[] = [];
        for (let j = 0; j < points.numberOfItems; j++) {
            const pt = points.getItem(j);
            result.push({ x: pt.x, y: pt.y });
        }
        return result;
    }

    public static toAbsolutePointList(values: SvgPathCommand[]) {
        const result: PointR[] = [];
        let x = 0;
        let y = 0;
        for (let i = 0; i < values.length; i++) {
            const item = values[i];
            for (let j = 0; j < item.coordinates.length; j += 2) {
                if (item.relative) {
                    x += item.coordinates[j];
                    y += item.coordinates[j + 1];
                }
                else {
                    x = item.coordinates[j];
                    y = item.coordinates[j + 1];
                }
                const pt: PointR = { x, y };
                if (item.command.toUpperCase() === 'A') {
                    pt.rx = item.radiusX;
                    pt.ry = item.radiusY;
                }
                result.push(pt);
            }
            if (item.relative) {
                switch (item.command) {
                    case 'h':
                    case 'v':
                        const previous = values[i - 1];
                        if (previous && previous.command === 'M') {
                            previous.coordinates.push(...item.coordinates);
                            values.splice(i, 1);
                            i--;
                        }
                        item.command = 'M';
                        break;
                    default:
                        item.command = item.command.toUpperCase();
                        break;
                }
                item.relative = false;
            }
        }
        return result;
    }

    public static toPathCommandList(value: string) {
        const result: SvgPathCommand[] = [];
        const patternCommand = /([A-Za-z])([^A-Za-z]+)?/g;
        let command: RegExpExecArray | null;
        value = value.trim();
        while ((command = patternCommand.exec(value)) !== null) {
            if (result.length === 0 && command[1].toUpperCase() !== 'M') {
                break;
            }
            command[2] = (command[2] || '').trim();
            const coordinates = parseNumberList(command[2]);
            const previous = result[result.length - 1] as SvgPathCommand | undefined;
            const previousCommand = previous ? previous.command.toUpperCase() : '';
            let previousPoint = previous ? previous.points[previous.points.length - 1] : undefined;
            let radiusX: number | undefined;
            let radiusY: number | undefined;
            let xAxisRotation: number | undefined;
            let largeArcFlag: number | undefined;
            let sweepFlag: number | undefined;
            switch (command[1].toUpperCase()) {
                case 'M':
                    if (result.length === 0) {
                        command[1] = 'M';
                    }
                case 'L':
                    if (coordinates.length >= 2) {
                        if (coordinates.length % 2 !== 0) {
                            coordinates.length--;
                        }
                        break;
                    }
                    else {
                        continue;
                    }
                case 'H':
                    if (previousPoint && coordinates.length) {
                        coordinates[1] = command[1] === 'h' ? 0 : previousPoint.y;
                        coordinates.length = 2;
                        break;
                    }
                    else {
                        continue;
                    }
                case 'V':
                    if (previousPoint && coordinates.length) {
                        const y = coordinates[0];
                        coordinates[0] = command[1] === 'v' ? 0 : previousPoint.x;
                        coordinates[1] = y;
                        coordinates.length = 2;
                        break;
                    }
                    else {
                        continue;
                    }
                case 'Z':
                    if (result.length) {
                        coordinates.push(...result[0].coordinates.slice(0, 2));
                        command[1] = 'Z';
                        break;
                    }
                    else {
                        continue;
                    }
                case 'C':
                    if (coordinates.length >= 6) {
                        coordinates.length = 6;
                        break;
                    }
                    else {
                        continue;
                    }
                case 'S':
                    if (coordinates.length >= 4 && (previousCommand === 'C' || previousCommand === 'S')) {
                        coordinates.length = 4;
                        break;
                    }
                    else {
                        continue;
                    }
                case 'Q':
                    if (coordinates.length >= 4) {
                        coordinates.length = 4;
                        break;
                    }
                    else {
                        continue;
                    }
                case 'T':
                    if (coordinates.length >= 2 && (previousCommand === 'Q' || previousCommand === 'T')) {
                        coordinates.length = 2;
                        break;
                    }
                    else {
                        continue;
                    }
                case 'A':
                    if (coordinates.length >= 7) {
                        [radiusX, radiusY, xAxisRotation, largeArcFlag, sweepFlag] = coordinates.splice(0, 5);
                        coordinates.length = 2;
                        break;
                    }
                    else {
                        continue;
                    }
                default:
                    continue;
            }
            if (coordinates.length > 1) {
                const points: Point[] = [];
                const relative = /[a-z]/.test(command[1]);
                for (let i = 0; i < coordinates.length; i += 2) {
                    let x = coordinates[i];
                    let y = coordinates[i + 1];
                    if (relative && previousPoint) {
                        x += previousPoint.x;
                        y += previousPoint.y;
                        previousPoint = { x, y };
                    }
                    points.push({ x, y });
                }
                result.push({
                    command: command[1],
                    relative,
                    coordinates,
                    points,
                    radiusX,
                    radiusY,
                    xAxisRotation,
                    largeArcFlag,
                    sweepFlag
                });
            }
        }
        return result;
    }

    public static fromNumberList(values: number[]) {
        const result: Point[] = [];
        for (let i = 0; i < values.length; i += 2) {
            result.push({ x: values[i], y: values[i + 1] });
        }
        return result.length % 2 === 0 ? result : [];
    }

    public static fromAbsolutePointList(values: SvgPathCommand[], points: Point[] | PointR[]) {
        const absolute = points.slice();
        invalidPoint: {
            for (const item of values) {
                switch (item.command.toUpperCase()) {
                    case 'M':
                    case 'L':
                    case 'H':
                    case 'V':
                    case 'C':
                    case 'S':
                    case 'Q':
                    case 'T': {
                        for (let i = 0; i < item.coordinates.length; i += 2) {
                            const pt = absolute.shift();
                            if (pt) {
                                item.coordinates[i] = pt.x;
                                item.coordinates[i + 1] = pt.y;
                            }
                            else {
                                values = [];
                                break invalidPoint;
                            }
                        }
                        break;
                    }
                    case 'A': {
                        const pt = <PointR> absolute.shift();
                        if (pt && pt.rx !== undefined && pt.ry !== undefined) {
                            item.coordinates[0] = pt.x;
                            item.coordinates[1] = pt.y;
                            item.radiusX = pt.rx;
                            item.radiusY = pt.ry;
                        }
                        else {
                            values = [];
                            break invalidPoint;
                        }
                        break;
                    }
                }
            }
        }
        return values;
    }

    public static fromPathCommandList(commands: SvgPathCommand[]) {
        let result = '';
        for (const item of commands) {
            result += (result !== '' ? ' ' : '') + item.command;
            switch (item.command.toUpperCase()) {
                case 'M':
                case 'L':
                case 'C':
                case 'S':
                case 'Q':
                case 'T':
                    result += item.coordinates.join(',');
                    break;
                case 'H':
                    result += item.coordinates[0];
                    break;
                case 'V':
                    result += item.coordinates[1];
                    break;
                case 'A':
                    result += `${item.radiusX},${item.radiusY},${item.xAxisRotation},${item.largeArcFlag},${item.sweepFlag},${item.coordinates.join(',')}`;
                    break;
            }
        }
        return result;
    }
}