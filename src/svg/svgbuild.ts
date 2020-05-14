import { INSTANCE_TYPE } from './lib/constant';
import { MATRIX, SVG, TRANSFORM, createPath } from './lib/util';

type Svg = squared.svg.Svg;
type SvgAnimate = squared.svg.SvgAnimate;
type SvgAnimateMotion = squared.svg.SvgAnimateMotion;
type SvgAnimateTransform = squared.svg.SvgAnimateTransform;
type SvgAnimation = squared.svg.SvgAnimation;
type SvgContainer = squared.svg.SvgContainer;
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
type SvgView = squared.svg.SvgView;

const { isAngle, parseAngle } = squared.lib.css;
const { getNamedItem } = squared.lib.dom;
const { absoluteAngle, offsetAngleY, relativeAngle, truncate, truncateFraction, truncateString } = squared.lib.math;
const { STRING } = squared.lib.regex;
const { convertWord, hasBit, isArray, isString, plainMap } = squared.lib.util;

const REGEX_DECIMAL = new RegExp(STRING.DECIMAL, 'g');
const REGEX_COMMAND = /([A-Za-z])([^A-Za-z]+)?/g;
const NAME_GRAPHICS = new Map<string, number>();

export default class SvgBuild implements squared.svg.SvgBuild {
    public static isContainer = (object: SvgElement): object is SvgGroup => hasBit(object.instanceType, INSTANCE_TYPE.SVG_CONTAINER);
    public static isElement = (object: SvgElement): object is SvgElement => hasBit(object.instanceType, INSTANCE_TYPE.SVG_ELEMENT);
    public static isShape = (object: SvgElement): object is SvgShape => hasBit(object.instanceType, INSTANCE_TYPE.SVG_SHAPE);
    public static isAnimate = (object: SvgAnimation): object is SvgAnimate => hasBit(object.instanceType, INSTANCE_TYPE.SVG_ANIMATE);
    public static isAnimateTransform = (object: SvgAnimation): object is SvgAnimateTransform => hasBit(object.instanceType, INSTANCE_TYPE.SVG_ANIMATE_TRANSFORM);
    public static asSvg = (object: SvgElement): object is Svg => object.instanceType === INSTANCE_TYPE.SVG;
    public static asG = (object: SvgElement): object is SvgG => object.instanceType === INSTANCE_TYPE.SVG_G;
    public static asPattern = (object: SvgElement): object is SvgPattern => object.instanceType === INSTANCE_TYPE.SVG_PATTERN;
    public static asShapePattern = (object: SvgElement): object is SvgShapePattern => object.instanceType === INSTANCE_TYPE.SVG_SHAPE_PATTERN;
    public static asUsePattern = (object: SvgElement): object is SvgUsePattern => object.instanceType === INSTANCE_TYPE.SVG_USE_PATTERN;
    public static asImage = (object: SvgElement): object is SvgImage => object.instanceType === INSTANCE_TYPE.SVG_IMAGE;
    public static asUse = (object: SvgElement): object is SvgUse => object.instanceType === INSTANCE_TYPE.SVG_USE;
    public static asUseSymbol = (object: SvgElement): object is SvgUseSymbol => object.instanceType === INSTANCE_TYPE.SVG_USE_SYMBOL;
    public static asSet = (object: SvgAnimation) => object.instanceType === INSTANCE_TYPE.SVG_ANIMATION;
    public static asAnimate = (object: SvgAnimation): object is SvgAnimate => object.instanceType === INSTANCE_TYPE.SVG_ANIMATE;
    public static asAnimateTransform = (object: SvgAnimation): object is SvgAnimateTransform => object.instanceType === INSTANCE_TYPE.SVG_ANIMATE_TRANSFORM;
    public static asAnimateMotion = (object: SvgAnimation): object is SvgAnimateMotion => object.instanceType === INSTANCE_TYPE.SVG_ANIMATE_MOTION;
    public static drawCircle = (cx: number, cy: number, r: number, precision?: number) => SvgBuild.drawEllipse(cx, cy, r, r, precision);
    public static drawPolygon = (values: Point[] | DOMPoint[], precision?: number) => values.length ? SvgBuild.drawPolyline(values, precision) + 'Z' : '';

    public static drawLine(x1: number, y1: number, x2 = 0, y2 = 0, precision?: number) {
        if (precision) {
            x1 = truncate(x1, precision) as any;
            y1 = truncate(y1, precision) as any;
            x2 = truncate(x2, precision) as any;
            y2 = truncate(y2, precision) as any;
        }
        return `M${x1},${y1} L${x2},${y2}`;
    }

    public static drawRect(width: number, height: number, x = 0, y = 0, precision?: number) {
        if (precision) {
            width = truncate(x + width, precision) as any;
            height = truncate(y + height, precision) as any;
            x = truncate(x, precision) as any;
            y = truncate(y, precision) as any;
        }
        else {
            width += x;
            height += y;
        }
        return `M${x},${y} ${width},${y} ${width},${height} ${x},${height} Z`;
    }

    public static drawEllipse(cx: number, cy: number, rx: number, ry?: number, precision?: number) {
        if (ry === undefined) {
            ry = rx;
        }
        let radius = rx * 2;
        if (precision) {
            cx = truncate(cx - rx, precision) as any;
            cy = truncate(cy, precision) as any;
            rx = truncate(rx, precision) as any;
            ry = truncate(ry, precision) as any;
            radius = truncate(radius, precision) as any;
        }
        else {
            cx -= rx;
        }
        return `M${cx},${cy} a${rx},${ry},0,0,1,${radius},0 a${rx},${ry},0,0,1,-${radius},0`;
    }

    public static drawPolyline(values: Point[] | DOMPoint[], precision?: number) {
        let result = 'M';
        if (precision) {
            for (const value of values) {
                result += ` ${truncate(value.x, precision)},${truncate(value.y, precision)}`;
            }
        }
        else {
            for (const value of values) {
                result += ` ${value.x},${value.y}`;
            }
        }
        return result;
    }

    public static drawPath(values: SvgPathCommand[], precision?: number) {
        let result = '';
        for (const value of values) {
            result += (result !== '' ? ' ' : '') + value.key;
            switch (value.key.toUpperCase()) {
                case 'M':
                case 'L':
                case 'C':
                case 'S':
                case 'Q':
                case 'T':
                    result += value.coordinates.join(',');
                    break;
                case 'H':
                    result += value.coordinates[0];
                    break;
                case 'V':
                    result += value.coordinates[1];
                    break;
                case 'A':
                    result += `${value.radiusX},${value.radiusY},${value.xAxisRotation},${value.largeArcFlag},${value.sweepFlag},${value.coordinates.join(',')}`;
                    break;
            }
        }
        return precision ? truncateString(result, precision) : result;
    }

    public static drawRefit(element: SVGGraphicsElement, parent?: SvgContainer, precision?: number) {
        let value: string;
        if (SVG.path(element)) {
            value = getNamedItem(element, 'd');
            if (parent?.requireRefit) {
                const commands = SvgBuild.getPathCommands(value);
                if (commands.length) {
                    const points = SvgBuild.getPathPoints(commands);
                    if (points.length) {
                        parent.refitPoints(points);
                        value = SvgBuild.drawPath(SvgBuild.syncPathPoints(commands, points), precision);
                    }
                }
            }
        }
        else if (SVG.line(element)) {
            const points: SvgPoint[] = [
                { x: element.x1.baseVal.value, y: element.y1.baseVal.value },
                { x: element.x2.baseVal.value, y: element.y2.baseVal.value }
            ];
            if (parent?.requireRefit) {
                parent.refitPoints(points);
            }
            value = SvgBuild.drawPolyline(points, precision);
        }
        else if (SVG.circle(element) || SVG.ellipse(element)) {
            let rx: number;
            let ry: number;
            if (SVG.ellipse(element)) {
                rx = element.rx.baseVal.value;
                ry = element.ry.baseVal.value;
            }
            else {
                rx = element.r.baseVal.value;
                ry = rx;
            }
            const points: SvgPoint[] = [{ x: element.cx.baseVal.value, y: element.cy.baseVal.value, rx, ry }];
            if (parent?.requireRefit) {
                parent.refitPoints(points);
            }
            const pt = points[0] as Required<SvgPoint>;
            value = SvgBuild.drawEllipse(pt.x, pt.y, pt.rx, pt.ry, precision);
        }
        else if (SVG.rect(element)) {
            let x = element.x.baseVal.value, y = element.y.baseVal.value;
            let width = element.width.baseVal.value, height = element.height.baseVal.value;
            if (parent?.requireRefit) {
                x = parent.refitX(x);
                y = parent.refitY(y);
                width = parent.refitSize(width);
                height = parent.refitSize(height);
            }
            value = SvgBuild.drawRect(width, height, x, y, precision);
        }
        else if (SVG.polygon(element) || SVG.polyline(element)) {
            const points = SvgBuild.clonePoints(element.points);
            if (parent?.requireRefit) {
                parent.refitPoints(points);
            }
            value = SVG.polygon(element) ? SvgBuild.drawPolygon(points, precision) : SvgBuild.drawPolyline(points, precision);
        }
        else {
            value = '';
        }
        return value;
    }

    public static transformRefit(value: string, transforms?: SvgTransform[], parent?: SvgView, container?: SvgContainer, precision?: number) {
        const commands = SvgBuild.getPathCommands(value);
        if (commands.length) {
            let points = SvgBuild.getPathPoints(commands);
            if (points.length) {
                const transformed = isArray(transforms);
                if (transformed) {
                    points = SvgBuild.applyTransforms(transforms as SvgTransform[], points, parent && TRANSFORM.origin(parent.element));
                }
                if (container?.requireRefit) {
                    container.refitPoints(points);
                }
                value = SvgBuild.drawPath(SvgBuild.syncPathPoints(commands, points, transformed), precision);
            }
        }
        return value;
    }

    public static getOffsetPath(value: string, rotation = 'auto 0deg') {
        const element = (createPath(value) as unknown) as SVGGeometryElement;
        const totalLength = Math.ceil(element.getTotalLength());
        const result: SvgOffsetPath[] = [];
        if (totalLength) {
            const keyPoints: Point[] = [];
            const rotatingPoints: boolean[] = [];
            let rotateFixed = 0;
            let rotateInitial = 0;
            if (isAngle(rotation)) {
                rotateFixed = parseAngle(rotation);
            }
            else {
                for (const item of SvgBuild.getPathCommands(value)) {
                    switch (item.key.toUpperCase()) {
                        case 'M':
                        case 'L':
                        case 'H':
                        case 'V':
                        case 'Z':
                            for (const pt of item.value) {
                                keyPoints.push(pt);
                                rotatingPoints.push(false);
                            }
                            break;
                        case 'C':
                        case 'S':
                        case 'Q':
                        case 'T':
                        case 'A':
                            keyPoints.push(item.end);
                            rotatingPoints.push(true);
                            break;
                    }
                }
                if (rotation !== 'auto 0deg') {
                    rotateInitial = parseAngle(rotation.split(' ').pop() as string);
                }
            }
            let rotating = false;
            let rotatePrevious = 0;
            let overflow = 0;
            let center: Undef<SvgPoint>;
            let key = -1;
            while (++key <= totalLength) {
                const nextPoint = element.getPointAtLength(key);
                if (keyPoints.length) {
                    const index = keyPoints.findIndex((pt: Point) => {
                        const x = pt.x.toString();
                        const y = pt.y.toString();
                        return x === nextPoint.x.toPrecision(x.length - (x.includes('.') ? 1 : 0)) && y === nextPoint.y.toPrecision(y.length - (y.includes('.') ? 1 : 0));
                    });
                    if (index !== -1) {
                        const endPoint = keyPoints[index + 1];
                        if (endPoint) {
                            rotating = rotatingPoints[index + 1];
                            if (rotating) {
                                center = SvgBuild.centerPoints(keyPoints[index], endPoint);
                                rotateFixed = 0;
                            }
                            else {
                                center = undefined;
                                rotateFixed = truncateFraction(absoluteAngle(nextPoint, endPoint));
                            }
                        }
                        else {
                            center = undefined;
                        }
                        overflow = 0;
                        keyPoints.splice(0, index + 1);
                        rotatingPoints.splice(0, index + 1);
                    }
                }
                let rotate: number;
                if (rotating) {
                    rotate = center ? truncateFraction(relativeAngle(center, nextPoint)) : 0;
                    if (rotatePrevious > 0 && rotatePrevious % 360 === 0 && Math.floor(rotate) === 0) {
                        overflow = rotatePrevious;
                    }
                    rotate += overflow;
                }
                else {
                    rotate = rotateFixed;
                }
                rotate += rotateInitial;
                result.push({ key, value: nextPoint, rotate });
                rotatePrevious = Math.ceil(rotate);
            }
        }
        return result;
    }

    public static getPathCommands(value: string) {
        REGEX_COMMAND.lastIndex = 0;
        const result: SvgPathCommand[] = [];
        let first = true;
        let match: Null<RegExpExecArray>;
        while ((match = REGEX_COMMAND.exec(value.trim())) !== null) {
            let key = match[1];
            if (first && key.toUpperCase() !== 'M') {
                break;
            }
            const coordinates = SvgBuild.parseCoordinates((match[2] || '').trim());
            let previousCommand: Undef<string>;
            let previousPoint: Undef<Point>;
            if (!first) {
                const previous = result[result.length - 1];
                previousCommand = previous.key.toUpperCase();
                previousPoint = previous.end;
            }
            let radiusX: Undef<number>;
            let radiusY: Undef<number>;
            let xAxisRotation: Undef<number>;
            let largeArcFlag: Undef<number>;
            let sweepFlag: Undef<number>;
            switch (key.toUpperCase()) {
                case 'M':
                    if (first) {
                        key = 'M';
                    }
                case 'L':
                    if (coordinates.length >= 2) {
                        if (coordinates.length % 2 !== 0) {
                            --coordinates.length;
                        }
                        break;
                    }
                    else {
                        continue;
                    }
                case 'H':
                    if (previousPoint && coordinates.length) {
                        coordinates[1] = key === 'h' ? 0 : previousPoint.y;
                        coordinates.length = 2;
                        break;
                    }
                    else {
                        continue;
                    }
                case 'V':
                    if (previousPoint && coordinates.length) {
                        const y = coordinates[0];
                        coordinates[0] = key === 'v' ? 0 : previousPoint.x;
                        coordinates[1] = y;
                        coordinates.length = 2;
                        break;
                    }
                    else {
                        continue;
                    }
                case 'Z':
                    if (!first) {
                        const coordinatesData = result[0].coordinates;
                        coordinates[0] = coordinatesData[0];
                        coordinates[1] = coordinatesData[1];
                        coordinates.length = 2;
                        key = 'Z';
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
            const length = coordinates.length;
            if (length >= 2) {
                const relative = key === key.toLowerCase();
                const points: SvgPoint[] = [];
                let i = 0;
                while (i < length) {
                    let x = coordinates[i++], y = coordinates[i++];
                    if (relative && previousPoint) {
                        x += previousPoint.x;
                        y += previousPoint.y;
                    }
                    points.push({ x, y });
                }
                result.push({
                    key,
                    value: points,
                    start: points[0],
                    end: points[points.length - 1],
                    relative,
                    coordinates,
                    radiusX,
                    radiusY,
                    xAxisRotation,
                    largeArcFlag,
                    sweepFlag
                });
                first = false;
            }
        }
        return result;
    }

    public static getPathPoints(values: SvgPathCommand[]) {
        const result: SvgPoint[] = [];
        let x = 0, y = 0;
        for (const value of values) {
            const { key, relative, coordinates } = value;
            const length = coordinates.length;
            let i = 0;
            while (i < length) {
                if (relative) {
                    x += coordinates[i++];
                    y += coordinates[i++];
                }
                else {
                    x = coordinates[i++];
                    y = coordinates[i++];
                }
                const pt: SvgPoint = { x, y };
                if (key.toUpperCase() === 'A') {
                    pt.rx = value.radiusX;
                    pt.ry = value.radiusY;
                }
                result.push(pt);
            }
            if (relative) {
                value.key = key.toUpperCase();
            }
        }
        return result;
    }

    public static syncPathPoints(values: SvgPathCommand[], points: SvgPoint[], transformed = false) {
        invalid: {
            let location: Undef<Point>;
            const length = values.length;
            let i = 0;
            while (i < length) {
                const item = values[i++];
                const coordinates = item.coordinates;
                if (item.relative) {
                    if (location) {
                        if (transformed && (item.key === 'H' || item.key === 'V')) {
                            const pt = points.shift();
                            if (pt) {
                                coordinates[0] = pt.x;
                                coordinates[1] = pt.y;
                                item.value[0] = pt;
                                item.start = pt;
                                item.end = pt;
                                item.key = 'L';
                                item.relative = false;
                            }
                            else {
                                break invalid;
                            }
                        }
                        else {
                            const q = coordinates.length;
                            let j = 0, k = 0;
                            while (j < q) {
                                const pt = points.shift();
                                if (pt) {
                                    coordinates[j++] = pt.x - location.x;
                                    coordinates[j++] = pt.y - location.y;
                                    if (item.key === 'a' && pt.rx !== undefined && pt.ry !== undefined) {
                                        item.radiusX = pt.rx;
                                        item.radiusY = pt.ry;
                                    }
                                    item.value[k++] = pt;
                                }
                                else {
                                    break invalid;
                                }
                            }
                            item.key = item.key.toLowerCase();
                        }
                        location = item.end;
                    }
                    else {
                        break;
                    }
                }
                else {
                    switch (item.key.toUpperCase()) {
                        case 'M':
                        case 'L':
                        case 'H':
                        case 'V':
                        case 'C':
                        case 'S':
                        case 'Q':
                        case 'T':
                        case 'Z': {
                            const q = coordinates.length;
                            let j = 0, k = 0;
                            while (j < q) {
                                const pt = points.shift();
                                if (pt) {
                                    coordinates[j++] = pt.x;
                                    coordinates[j++] = pt.y;
                                    item.value[k++] = pt;
                                }
                                else {
                                    values = [];
                                    break invalid;
                                }
                            }
                            break;
                        }
                        case 'A': {
                            const pt = points.shift();
                            if (pt) {
                                coordinates[0] = pt.x;
                                coordinates[1] = pt.y;
                                item.radiusX = pt.rx;
                                item.radiusY = pt.ry;
                                item.value[0] = pt;
                            }
                            else {
                                values = [];
                                break invalid;
                            }
                            break;
                        }
                    }
                    if (!item.relative) {
                        location = item.end;
                    }
                }
            }
        }
        return values;
    }

    public static filterTransforms(transforms: SvgTransform[], exclude?: number[]) {
        const result: SvgTransform[] = [];
        for (const item of transforms) {
            const type = item.type;
            if (!exclude || !exclude.includes(type)) {
                switch (type) {
                    case SVGTransform.SVG_TRANSFORM_ROTATE:
                    case SVGTransform.SVG_TRANSFORM_SKEWX:
                    case SVGTransform.SVG_TRANSFORM_SKEWY:
                        if (item.angle === 0) {
                            continue;
                        }
                        break;
                    case SVGTransform.SVG_TRANSFORM_SCALE: {
                        const m = item.matrix;
                        if (m.a === 1 && m.d === 1) {
                            continue;
                        }
                        break;
                    }
                    case SVGTransform.SVG_TRANSFORM_TRANSLATE: {
                        const m = item.matrix;
                        if (m.e === 0 && m.f === 0) {
                            continue;
                        }
                        break;
                    }
                }
                result.push(item);
            }
        }
        return result;
    }

    public static applyTransforms(transforms: SvgTransform[], values: SvgPoint[], origin?: SvgPoint) {
        const result = SvgBuild.clonePoints(values);
        for (const item of transforms.slice(0).reverse()) {
            const m = item.matrix;
            let x1 = 0, y1 = 0;
            let x2 = 0, y2 = 0;
            if (origin) {
                const { x, y } = origin;
                const method = item.method;
                switch (item.type) {
                    case SVGTransform.SVG_TRANSFORM_SCALE:
                        if (method.x) {
                            x2 = x * (1 - m.a);
                        }
                        if (method.y) {
                            y2 = y * (1 - m.d);
                        }
                        break;
                    case SVGTransform.SVG_TRANSFORM_SKEWX:
                        if (method.y) {
                            y1 -= y;
                        }
                        break;
                    case SVGTransform.SVG_TRANSFORM_SKEWY:
                        if (method.x) {
                            x1 -= x;
                        }
                        break;
                    case SVGTransform.SVG_TRANSFORM_ROTATE:
                        if (method.x) {
                            x1 -= x;
                            x2 = x + offsetAngleY(item.angle, x);
                        }
                        if (method.y) {
                            y1 -= y;
                            y2 = y + offsetAngleY(item.angle, y);
                        }
                        break;
                }
            }
            for (const pt of result) {
                const { x, y } = pt;
                pt.x = MATRIX.applyX(m, x, y + y1) + x2;
                pt.y = MATRIX.applyY(m, x + x1, y) + y2;
                if (item.type === SVGTransform.SVG_TRANSFORM_SCALE) {
                    const { rx, ry } = pt;
                    if (rx !== undefined && ry !== undefined) {
                        pt.rx = MATRIX.applyX(m, rx, ry + y1);
                        pt.ry = MATRIX.applyY(m, rx + x1, ry);
                    }
                }
            }
        }
        return result;
    }

    public static convertTransforms(transform: SVGTransformList) {
        const length = transform.numberOfItems;
        const result: SvgTransform[] = new Array(length);
        let i = 0;
        while (i < length) {
            const { type, matrix, angle } = transform.getItem(i);
            result[i++] = TRANSFORM.create(type, matrix, angle);
        }
        return result;
    }

    public static clonePoints(values: SvgPoint[] | SVGPointList) {
        if (Array.isArray(values)) {
            const length = values.length;
            const result: SvgPoint[] = new Array(length);
            let i = 0;
            while (i < length) {
                const { x, y, rx, ry } = values[i];
                const item: SvgPoint = { x, y };
                if (rx !== undefined && ry !== undefined) {
                    item.rx = rx;
                    item.ry = ry;
                }
                result[i++] = item;
            }
            return result;
        }
        else {
            const length = values.numberOfItems;
            const result: SvgPoint[] = new Array(length);
            let i = 0;
            while (i < length) {
                const { x, y } = values.getItem(i);
                result[i++] = { x, y };
            }
            return result;
        }
    }

    public static minMaxPoints(values: SvgPoint[], radius = false): [number, number, number, number] {
        let { x: minX, y: minY } = values[0];
        let maxX = minX, maxY = minY;
        const length = values.length;
        for (let i = 1; i < length; ++i) {
            const { x, y } = values[i];
            if (radius && i > 0) {
                const { rx, ry } = values[i];
                if (rx !== undefined && ry !== undefined) {
                    const { x: x1, y: y1 } = values[i - 1];
                    let x2 = (x + x1) / 2, y2 = (y + y1) / 2;
                    if (x > x1) {
                        y2 -= ry;
                    }
                    else if (x < x1) {
                        y2 += ry;
                    }
                    if (y < y1) {
                        x2 += rx;
                    }
                    else if (y > x1) {
                        x2 -= rx;
                    }
                    minX = Math.min(x2, minX);
                    maxX = Math.max(x2, maxX);
                    minY = Math.min(y2, minY);
                    maxY = Math.max(y2, maxY);
                }
            }
            if (x < minX) {
                minX = x;
            }
            else if (x > maxX) {
                maxX = x;
            }
            if (y < minY) {
                minY = y;
            }
            else if (y > maxY) {
                maxY = y;
            }
        }
        return [minX, minY, maxX, maxY];
    }

    public static centerPoints(...values: SvgPoint[]): SvgPoint {
        const result = this.minMaxPoints(values);
        return { x: (result[0] + result[2]) / 2, y: (result[1] + result[3]) / 2 };
    }

    public static convertPoints(values: number[]) {
        const length = values.length;
        if (length % 2 === 0) {
            const result: Point[] = new Array(length / 2);
            let i = 0, k = 0;
            while (i < length) {
                result[k++] = { x: values[i++], y: values[i++] };
            }
            return result;
        }
        return [];
    }

    public static parsePoints(value: string) {
        return plainMap(value.trim().split(/\s+/), coords => {
            const [x, y] = coords.split(',');
            return { x: parseFloat(x), y: parseFloat(y) };
        });
    }

    public static parseCoordinates(value: string) {
        REGEX_DECIMAL.lastIndex = 0;
        const result: number[] = [];
        let match: Null<RegExpExecArray>;
        while ((match = REGEX_DECIMAL.exec(value)) !== null) {
            const coord = parseFloat(match[0]);
            if (!isNaN(coord)) {
                result.push(coord);
            }
        }
        return result;
    }

    public static getBoxRect(values: string[]): BoxRect {
        let points: SvgPoint[] = [];
        for (const value of values) {
            points = points.concat(SvgBuild.getPathPoints(SvgBuild.getPathCommands(value)));
        }
        const [left, top, right, bottom] = this.minMaxPoints(points, true);
        return { top, right, bottom, left };
    }

    public static setName(element?: SVGElement) {
        if (element) {
            let value: Undef<string>;
            let tagName: Undef<string>;
            if (isString(element.id)) {
                const id = convertWord(element.id, true);
                if (!NAME_GRAPHICS.has(id)) {
                    value = id;
                }
                tagName = id;
            }
            else {
                tagName = element.tagName;
            }
            let index = NAME_GRAPHICS.get(tagName) || 0;
            if (value) {
                NAME_GRAPHICS.set(value, index);
                return value;
            }
            else {
                NAME_GRAPHICS.set(tagName, ++index);
                return tagName + '_' + index;
            }
        }
        else {
            NAME_GRAPHICS.clear();
            return '';
        }
    }
}