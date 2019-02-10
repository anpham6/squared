import { SvgPathCommand, SvgPoint, SvgTransform } from './@types/object';

import { INSTANCE_TYPE } from './lib/constant';
import { MATRIX, TRANSFORM, getRadiusY, truncateDecimal } from './lib/util';

type Svg = squared.svg.Svg;
type SvgAnimate = squared.svg.SvgAnimate;
type SvgAnimateMotion = squared.svg.SvgAnimateMotion;
type SvgAnimateTransform = squared.svg.SvgAnimateTransform;
type SvgAnimation = squared.svg.SvgAnimation;
type SvgElement = squared.svg.SvgElement;
type SvgG = squared.svg.SvgG;
type SvgGroup = squared.svg.SvgGroup;
type SvgImage = squared.svg.SvgImage;
type SvgPattern = squared.svg.SvgPattern;
type SvgShape = squared.svg.SvgShape;
type SvgShapePattern = squared.svg.SvgShapePattern;
type SvgUse = squared.svg.SvgUse;
type SvgUsePattern = squared.svg.SvgUsePattern;
type SvgUseSymbol = squared.svg.SvgUseSymbol;

const $util = squared.lib.util;

const NAME_GRAPHICS = new Map<string, number>();

export default class SvgBuild implements squared.svg.SvgBuild {
    public static isContainer(object: SvgElement): object is SvgGroup {
        return $util.hasBit(object.instanceType, INSTANCE_TYPE.SVG_CONTAINER);
    }

    public static isElement(object: SvgElement): object is SvgElement {
        return $util.hasBit(object.instanceType, INSTANCE_TYPE.SVG_ELEMENT);
    }

    public static isShape(object: SvgElement): object is SvgShape {
        return $util.hasBit(object.instanceType, INSTANCE_TYPE.SVG_SHAPE);
    }

    public static isAnimate(object: SvgAnimation): object is SvgAnimate {
        return $util.hasBit(object.instanceType, INSTANCE_TYPE.SVG_ANIMATE);
    }

    public static asSvg(object: SvgElement): object is Svg {
        return object.instanceType === INSTANCE_TYPE.SVG;
    }

    public static asG(object: SvgElement): object is SvgG {
        return object.instanceType === INSTANCE_TYPE.SVG_G;
    }

    public static asUseSymbol(object: SvgElement): object is SvgUseSymbol {
        return object.instanceType === INSTANCE_TYPE.SVG_USE_SYMBOL;
    }

    public static asPattern(object: SvgElement): object is SvgPattern {
        return object.instanceType === INSTANCE_TYPE.SVG_PATTERN;
    }

    public static isShapePattern(object: SvgElement): object is SvgShapePattern {
        return object.instanceType === INSTANCE_TYPE.SVG_SHAPE_PATTERN;
    }

    public static asUsePattern(object: SvgElement): object is SvgUsePattern {
        return object.instanceType === INSTANCE_TYPE.SVG_USE_PATTERN;
    }

    public static asImage(object: SvgElement): object is SvgImage {
        return object.instanceType === INSTANCE_TYPE.SVG_IMAGE;
    }

    public static asUse(object: SvgElement): object is SvgUse {
        return object.instanceType === INSTANCE_TYPE.SVG_USE;
    }

    public static asSet(object: SvgAnimation) {
        return object.instanceType === INSTANCE_TYPE.SVG_ANIMATION;
    }

    public static asAnimate(object: SvgAnimation): object is SvgAnimate {
        return object.instanceType === INSTANCE_TYPE.SVG_ANIMATE;
    }

    public static asAnimateTransform(object: SvgAnimation): object is SvgAnimateTransform {
        return object.instanceType === INSTANCE_TYPE.SVG_ANIMATE_TRANSFORM;
    }

    public static asAnimateMotion(object: SvgAnimation): object is SvgAnimateMotion {
        return object.instanceType === INSTANCE_TYPE.SVG_ANIMATE_MOTION;
    }

    public static setName(element?: SVGElement) {
        if (element) {
            let result = '';
            let tagName: string | undefined;
            if ($util.isString(element.id)) {
                const id = $util.convertWord(element.id, true);
                if (!NAME_GRAPHICS.has(id)) {
                    result = id;
                }
                tagName = id;
            }
            else {
                tagName = element.tagName;
            }
            let index = NAME_GRAPHICS.get(tagName) || 0;
            if (result !== '') {
                NAME_GRAPHICS.set(result, index);
                return result;
            }
            else {
                NAME_GRAPHICS.set(tagName, ++index);
                return `${tagName}_${index}`;
            }
        }
        else {
            NAME_GRAPHICS.clear();
            return '';
        }
    }

    public static drawLine(x1: number, y1: number, x2 = 0, y2 = 0) {
        return `M${x1},${y1} L${x2},${y2}`;
    }

    public static drawRect(width: number, height: number, x = 0, y = 0) {
        return `M${x},${y} ${x + width},${y} ${x + width},${y + height} ${x},${y + height} Z`;
    }

    public static drawCircle(cx: number, cy: number, r: number) {
        return SvgBuild.drawEllipse(cx, cy, r);
    }

    public static drawEllipse(cx: number, cy: number, rx: number, ry?: number, truncate = false) {
        if (ry === undefined) {
            ry = rx;
        }
        return `M${truncate ? truncateDecimal(cx - rx) : cx - rx},${truncate ? truncateDecimal(cy) : cy} a${rx},${ry},0,1,0,${rx * 2},0 a${rx},${ry},0,1,0,-${rx * 2},0`;
    }

    public static drawPolygon(points: Point[] | DOMPoint[], truncate = false) {
        const value = SvgBuild.drawPolyline(points, truncate);
        return value !== '' ? `${value} Z` : '';
    }

    public static drawPolyline(points: Point[] | DOMPoint[], truncate = false) {
        return points.length ? `M${(<Point[]> points).map(pt => `${truncate ? truncateDecimal(pt.x) : pt.x},${truncate ? truncateDecimal(pt.y) : pt.y}`).join(' ')}` : '';
    }

    public static drawPath(values: SvgPathCommand[]) {
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

    public static getPathCommands(value: string) {
        const result: SvgPathCommand[] = [];
        const pattern = /([A-Za-z])([^A-Za-z]+)?/g;
        let match: RegExpExecArray | null;
        value = value.trim();
        while ((match = pattern.exec(value)) !== null) {
            if (result.length === 0 && match[1].toUpperCase() !== 'M') {
                break;
            }
            match[2] = (match[2] || '').trim();
            const coordinates = SvgBuild.toNumberList(match[2]);
            const previous = result[result.length - 1] as SvgPathCommand | undefined;
            const previousCommand = previous ? previous.command.toUpperCase() : '';
            let previousPoint = previous ? previous.points[previous.points.length - 1] : undefined;
            let radiusX: number | undefined;
            let radiusY: number | undefined;
            let xAxisRotation: number | undefined;
            let largeArcFlag: number | undefined;
            let sweepFlag: number | undefined;
            switch (match[1].toUpperCase()) {
                case 'M':
                    if (result.length === 0) {
                        match[1] = 'M';
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
                        coordinates[1] = match[1] === 'h' ? 0 : previousPoint.y;
                        coordinates.length = 2;
                        break;
                    }
                    else {
                        continue;
                    }
                case 'V':
                    if (previousPoint && coordinates.length) {
                        const y = coordinates[0];
                        coordinates[0] = match[1] === 'v' ? 0 : previousPoint.x;
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
                        match[1] = 'Z';
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
                const relative = /[a-z]/.test(match[1]);
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
                    command: match[1],
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

    public static getPathPoints(values: SvgPathCommand[], includeRadius = false) {
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
                    if (includeRadius) {
                        if (item.coordinates[j] >= 0) {
                            pt.y -= item.radiusY as number;
                        }
                        else {
                            pt.y += item.radiusY as number;
                        }
                    }
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
                            values.splice(i--, 1);
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

    public static setPathPoints(values: SvgPathCommand[], points: SvgPoint[]) {
        const absolute = points.slice(0);
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

    public static filterTransforms(transforms: SvgTransform[], exclude?: number[]) {
        const result: SvgTransform[] = [];
        for (const item of transforms) {
            if (exclude === undefined || !exclude.includes(item.type)) {
                switch (item.type) {
                    case SVGTransform.SVG_TRANSFORM_ROTATE:
                    case SVGTransform.SVG_TRANSFORM_SKEWX:
                    case SVGTransform.SVG_TRANSFORM_SKEWY:
                        if (item.angle === 0) {
                            continue;
                        }
                        break;
                    case SVGTransform.SVG_TRANSFORM_SCALE:
                        if (item.matrix.a === 1 && item.matrix.d === 1) {
                            continue;
                        }
                        break;
                    case SVGTransform.SVG_TRANSFORM_TRANSLATE:
                        if (item.matrix.e === 0 && item.matrix.f === 0) {
                            continue;
                        }
                        break;
                }
                result.push(item);
            }
        }
        return result;
    }

    public static applyTransforms(transforms: SvgTransform[], values: SvgPoint[], origin?: SvgPoint, center?: SvgPoint) {
        transforms = transforms.slice(0).reverse();
        const result = SvgBuild.clonePoints(values);
        for (const item of transforms) {
            const m = item.matrix;
            let x1 = 0;
            let y1 = 0;
            let x2 = 0;
            let y2 = 0;
            if (origin) {
                switch (item.type) {
                    case SVGTransform.SVG_TRANSFORM_SCALE:
                        if (item.method.x) {
                            x2 = origin.x * (1 - m.a);
                        }
                        if (item.method.y) {
                            y2 = origin.y * (1 - m.d);
                        }
                        break;
                    case SVGTransform.SVG_TRANSFORM_SKEWX:
                        if (item.method.y) {
                            y1 -= origin.y;
                        }
                        break;
                    case SVGTransform.SVG_TRANSFORM_SKEWY:
                        if (item.method.x) {
                            x1 -= origin.x;
                        }
                        break;
                    case SVGTransform.SVG_TRANSFORM_ROTATE:
                        if (item.method.x) {
                            x1 -= origin.x;
                            x2 = origin.x + getRadiusY(item.angle, origin.x);
                        }
                        if (item.method.y) {
                            y1 -= origin.y;
                            y2 = origin.y + getRadiusY(item.angle, origin.y);
                        }
                        break;
                }
            }
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
                pt.x = MATRIX.applyX(m, x, pt.y + y1) + x2;
                pt.y = MATRIX.applyY(m, x + x1, pt.y) + y2;
                if (item.type === SVGTransform.SVG_TRANSFORM_SCALE && pt.rx !== undefined && pt.ry !== undefined) {
                    const rx = pt.rx;
                    pt.rx = MATRIX.applyX(m, rx, pt.ry + y1);
                    pt.ry = MATRIX.applyY(m, rx + x1, pt.ry);
                }
            }
        }
        return result;
    }

    public static convertTransforms(transform: SVGTransformList) {
        const result: SvgTransform[] = [];
        for (let i = 0; i < transform.numberOfItems; i++) {
            const item = transform.getItem(i);
            result.push(TRANSFORM.create(item.type, item.matrix, item.angle));
        }
        return result;
    }

    public static clonePoints(values: SvgPoint[] | SVGPointList) {
        const result: SvgPoint[] = [];
        if (Array.isArray(values)) {
            for (const pt of values) {
                const item: SvgPoint = { x: pt.x, y: pt.y };
                if (pt.rx !== undefined && pt.ry !== undefined) {
                    item.rx = pt.rx;
                    item.ry = pt.ry;
                }
                result.push(item);
            }
        }
        else {
            for (let j = 0; j < values.numberOfItems; j++) {
                const pt = values.getItem(j);
                result.push({ x: pt.x, y: pt.y });
            }
        }
        return result;
    }

    public static convertNumbers(values: number[]) {
        const result: Point[] = [];
        for (let i = 0; i < values.length; i += 2) {
            result.push({
                x: values[i],
                y: values[i + 1]
            });
        }
        return result.length % 2 === 0 ? result : [];
    }

    public static toNumberList(value: string) {
        const result: number[] = [];
        const pattern = /-?[\d.]+/g;
        let match: RegExpExecArray | null;
        while ((match = pattern.exec(value)) !== null) {
            const digit = parseFloat(match[0]);
            if (!isNaN(digit)) {
                result.push(digit);
            }
        }
        return result;
    }

    public static toPointList(value: string) {
        const result: Point[] = [];
        for (const coords of value.trim().split(/\s+/)) {
            const [x, y] = coords.split(',').map(pt => parseFloat(pt));
            result.push({ x, y });
        }
        return result;
    }

    public static toBoxRect(values: string[]): BoxRect {
        let top = Number.MAX_VALUE;
        let right = -Number.MAX_VALUE;
        let bottom = -Number.MAX_VALUE;
        let left = Number.MAX_VALUE;
        for (const value of values) {
            const points = SvgBuild.getPathPoints(SvgBuild.getPathCommands(value), true);
            for (const pt of points) {
                if (pt.y < top) {
                    top = pt.y;
                }
                else if (pt.y > bottom) {
                    bottom = pt.y;
                }
                if (pt.x < left) {
                    left = pt.x;
                }
                else if (pt.x > right) {
                    right = pt.x;
                }
            }
        }
        return { top, right, bottom, left };
    }
}