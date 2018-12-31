import { SvgPathCommand, SvgTransform } from './types/svg';

import { applyMatrixX, applyMatrixY, createTransform, getRadiusY } from './lib/util';

import $color = squared.lib.color;
import $dom = squared.lib.dom;

const NAME_GRAPHICS: ObjectMap<number> = {};

export default class SvgBuild implements squared.svg.SvgBuild {
    public static setName(element: SVGGraphicsElement) {
        let result = '';
        let tagName: string | undefined;
        if (element.id) {
            if (NAME_GRAPHICS[element.id] === undefined) {
                result = element.id;
            }
            tagName = element.id;
        }
        else {
            tagName = element.tagName;
        }
        if (NAME_GRAPHICS[tagName] === undefined) {
            NAME_GRAPHICS[tagName] = 0;
        }
        return result !== '' ? result : `${tagName}_${++NAME_GRAPHICS[tagName]}`;
    }

    public static toTransformList(transform: SVGTransformList) {
        const result: SvgTransform[] = [];
        for (let i = 0; i < transform.numberOfItems; i++) {
            const item = transform.getItem(i);
            result.push(createTransform(item.type, item.matrix, item.angle));
        }
        return result;
    }

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
                        if (item.origin.x) {
                            x1 += origin.x;
                        }
                        if (item.origin.y) {
                            y2 += origin.y;
                        }
                        break;
                    case SVGTransform.SVG_TRANSFORM_SKEWX:
                        if (item.origin.y) {
                            y1 -= origin.y;
                        }
                        break;
                    case SVGTransform.SVG_TRANSFORM_SKEWY:
                        if (item.origin.x) {
                            x2 -= origin.x;
                        }
                        break;
                    case SVGTransform.SVG_TRANSFORM_ROTATE:
                        if (item.origin.x) {
                            x2 -= origin.x;
                            x3 = origin.x + getRadiusY(item.angle, origin.x);
                        }
                        if (item.origin.y) {
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

    public static toPointList(points: SVGPointList) {
        const result: Point[] = [];
        for (let j = 0; j < points.numberOfItems; j++) {
            const pt = points.getItem(j);
            result.push({ x: pt.x, y: pt.y });
        }
        return result;
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
            const coordinates = this.toCoordinateList(command[2]);
            const previous = result[result.length - 1] as SvgPathCommand | undefined;
            const previousCommand = previous ? previous.command.toUpperCase() : '';
            const previousPoint = previous ? previous.points[previous.points.length - 1] : undefined;
            let radiusX: number | undefined;
            let radiusY: number | undefined;
            let xAxisRotation: number | undefined;
            let largeArcFlag: number | undefined;
            let sweepFlag: number | undefined;
            switch (command[1].toUpperCase()) {
                case 'M':
                case 'L':
                    if (coordinates.length >= 2) {
                        coordinates.length = 2;
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
                        coordinates.push(...result[0].coordinates);
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

    public static createColorStops(element: SVGGradientElement) {
        const result: ColorStop[] = [];
        for (const stop of Array.from(element.getElementsByTagName('stop'))) {
            const color = $color.parseRGBA($dom.cssAttribute(stop, 'stop-color'), $dom.cssAttribute(stop, 'stop-opacity'));
            if (color && color.visible) {
                result.push({
                    color: color.valueRGBA,
                    offset: $dom.cssAttribute(stop, 'offset'),
                    opacity: color.alpha
                });
            }
        }
        return result;
    }

    public static fromCoordinateList(values: number[]) {
        const result: Point[] = [];
        for (let i = 0; i < values.length; i += 2) {
            result.push({ x: values[i], y: values[i + 1] });
        }
        return result.length % 2 === 0 ? result : [];
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