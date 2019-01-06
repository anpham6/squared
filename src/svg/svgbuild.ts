import { SvgPathCommand, SvgPoint, SvgTransform } from './@types/object';

import { applyMatrixX, applyMatrixY, getRadiusY, getRotateOrigin } from './lib/util';

const $util = squared.lib.util;

export default class SvgBuild implements squared.svg.SvgBuild {
    public static applyTransforms(transform: SvgTransform[], values: SvgPoint[], origin?: SvgPoint, center?: SvgPoint) {
        const result = SvgBuild.toPointList(values);
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
            const m = item.matrix;
            if (center) {
                switch (item.type) {
                    case SVGTransform.SVG_TRANSFORM_SCALE:
                        center.x *= m.a;
                        center.y *= m.d;
                        break;
                    case SVGTransform.SVG_TRANSFORM_ROTATE:
                        if (item.angle !== 0) {
                            center.angle = (center.angle || 0) + item.angle;
                        }
                        break;
                    case SVGTransform.SVG_TRANSFORM_TRANSLATE:
                        center.x += m.e;
                        center.y += m.f;
                        break;
                }
            }
            for (const pt of result) {
                const x = pt.x;
                pt.x = applyMatrixX(m, x + x1, pt.y + y1) + x3;
                pt.y = applyMatrixY(m, x + x2, pt.y + y2) + y3;
                if (pt.rx !== undefined && pt.ry !== undefined) {
                    const rx = pt.rx;
                    switch (item.type) {
                        case SVGTransform.SVG_TRANSFORM_SCALE:
                            pt.rx = applyMatrixX(m, rx + x1, pt.ry + y1);
                            pt.ry = applyMatrixY(m, rx + x2, pt.ry + y2);
                            break;
                    }
                }
            }
        }
        return result;
    }

    public static partitionTransforms(element: SVGGraphicsElement, transform: SvgTransform[], fromPath = false): [SvgTransform[][], SvgTransform[]] {
        const host: SvgTransform[][] = [];
        const client: SvgTransform[] = [];
        if (transform.length) {
            const rotateOrigin = transform[0].css ? [] : getRotateOrigin(element);
            rotateOrigin.reverse();
            const partition = transform.slice().reverse();
            const typeIndex = new Set<number>();
            let rx = 1;
            let ry = 1;
            if (fromPath && element instanceof SVGEllipseElement) {
                rx = element.rx.baseVal.value;
                ry = element.ry.baseVal.value;
            }
            let current: SvgTransform[] = [];
            for (let i = 0; i < partition.length; i++) {
                const item = partition[i];
                let prerotate = fromPath && host.length === 0 && current.length === 0;
                if (!prerotate && typeIndex.has(item.type)) {
                    current.reverse();
                    host.push(current);
                    current = [item];
                    typeIndex.clear();
                }
                else {
                    switch (item.type) {
                        case SVGTransform.SVG_TRANSFORM_TRANSLATE:
                            if (prerotate) {
                                client.push(item);
                            }
                            else {
                                current.push(item);
                            }
                            break;
                        case SVGTransform.SVG_TRANSFORM_SCALE:
                            if (prerotate) {
                                client.push(item);
                            }
                            else {
                                current.push(item);
                            }
                            break;
                        case SVGTransform.SVG_TRANSFORM_MATRIX:
                            if (prerotate && item.matrix.b === 0 && item.matrix.c === 0) {
                                client.push(item);
                            }
                            else {
                                current.push(item);
                                prerotate = false;
                            }
                            break;
                        case SVGTransform.SVG_TRANSFORM_ROTATE:
                            if (rotateOrigin.length) {
                                const origin = rotateOrigin.shift() as SvgPoint;
                                if (origin.angle === item.angle) {
                                    item.origin = origin;
                                }
                            }
                            if (prerotate && rx === ry && (i === 0 || client[client.length - 1].type === SVGTransform.SVG_TRANSFORM_ROTATE)) {
                                client.push(item);
                            }
                            else {
                                if (!prerotate) {
                                    current.reverse();
                                    host.push(current);
                                    current = [];
                                    typeIndex.clear();
                                }
                                current.push(item);
                                continue;
                            }
                            break;
                        case SVGTransform.SVG_TRANSFORM_SKEWX:
                        case SVGTransform.SVG_TRANSFORM_SKEWY:
                            current.push(item);
                            prerotate = false;
                            break;
                    }
                }
                if (!prerotate) {
                    typeIndex.add(item.type);
                }
            }
            if (current.length) {
                current.reverse();
                host.push(current);
            }
        }
        return [host, client];
    }

    public static getPathCenter(values: SvgPoint[]): SvgPoint {
        const pointsX = values.map(pt => pt.x);
        const pointsY = values.map(pt => pt.y);
        return {
            x: ($util.minArray(pointsX) + $util.maxArray(pointsX)) / 2,
            y: ($util.minArray(pointsY) + $util.maxArray(pointsY)) / 2
        };
    }

    public static toCoordinateList(value: string) {
        const result: number[] = [];
        const pattern = /-?[\d.]+/g;
        let digit: RegExpExecArray | null;
        while ((digit = pattern.exec(value)) !== null) {
            const digitValue = parseFloat(digit[0]);
            if (!isNaN(digitValue)) {
                result.push(digitValue);
            }
        }
        return result;
    }

    public static toPointList(values: SVGPointList | SvgPoint[]) {
        const result: SvgPoint[] = [];
        if (values instanceof SVGPointList) {
            for (let j = 0; j < values.numberOfItems; j++) {
                const pt = values.getItem(j);
                result.push({ x: pt.x, y: pt.y });
            }
        }
        else {
            for (const pt of values as SvgPoint[]) {
                const item: SvgPoint = { x: pt.x, y: pt.y };
                if (pt.rx !== undefined && pt.ry !== undefined) {
                    item.rx = pt.rx;
                    item.ry = pt.ry;
                }
                result.push(item);
            }
        }
        return result;
    }

    public static toAbsolutePointList(values: SvgPathCommand[]) {
        const result: SvgPoint[] = [];
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
                const pt: SvgPoint = { x, y };
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
            const coordinates = SvgBuild.toCoordinateList(command[2]);
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
                const points: SvgPoint[] = [];
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

    public static fromPointsValue(value: string) {
        const result: SvgPoint[] = [];
        value.trim().split(/\s+/).forEach(point => {
            const [x, y] = point.split(',').map(pt => parseFloat(pt));
            result.push({ x, y });
        });
        return result;
    }

    public static fromNumberList(values: number[]) {
        const result: SvgPoint[] = [];
        for (let i = 0; i < values.length; i += 2) {
            result.push({ x: values[i], y: values[i + 1] });
        }
        return result.length % 2 === 0 ? result : [];
    }

    public static fromAbsolutePointList(values: SvgPathCommand[], points: SvgPoint[]) {
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
                        const pt = <SvgPoint> absolute.shift();
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

    public static fromPathCommandList(values: SvgPathCommand[]) {
        let result = '';
        for (const item of values) {
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