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
type SvgUseG = squared.svg.SvgUseG;
type SvgUseShape = squared.svg.SvgUseShape;
type SvgUseShapePattern = squared.svg.SvgUseShapePattern;
type SvgUseSymbol = squared.svg.SvgUseSymbol;
type SvgView = squared.svg.SvgView;

const { isAngle, parseAngle } = squared.lib.css;
const { getNamedItem } = squared.lib.dom;
const { absoluteAngle, offsetAngleY, relativeAngle, truncate, truncateFraction, truncateString } = squared.lib.math;
const { STRING } = squared.lib.regex;
const { convertWord, hasBit, isArray, plainMap } = squared.lib.util;

const REGEXP_DECIMAL = new RegExp(STRING.DECIMAL, 'g');
const NAME_GRAPHICS = new Map<string, number>();

export default class SvgBuild implements squared.svg.SvgBuild {
    public static isUse = (object: SvgElement): object is SvgUse => hasBit(object.instanceType, INSTANCE_TYPE.SVG_USE);
    public static isContainer = (object: SvgElement): object is SvgGroup => hasBit(object.instanceType, INSTANCE_TYPE.SVG_CONTAINER);
    public static isElement = (object: SvgElement): object is SvgElement => hasBit(object.instanceType, INSTANCE_TYPE.SVG_ELEMENT);
    public static isShape = (object: SvgElement): object is SvgShape => hasBit(object.instanceType, INSTANCE_TYPE.SVG_SHAPE);
    public static isAnimate = (object: SvgAnimation): object is SvgAnimate => hasBit(object.instanceType, INSTANCE_TYPE.SVG_ANIMATE);
    public static isAnimateTransform = (object: SvgAnimation): object is SvgAnimateTransform => hasBit(object.instanceType, INSTANCE_TYPE.SVG_ANIMATE_TRANSFORM);
    public static asSvg = (object: SvgElement): object is Svg => object.instanceType === INSTANCE_TYPE.SVG;
    public static asG = (object: SvgElement): object is SvgG => object.instanceType === INSTANCE_TYPE.SVG_G;
    public static asPattern = (object: SvgElement): object is SvgPattern => object.instanceType === INSTANCE_TYPE.SVG_PATTERN;
    public static asShapePattern = (object: SvgElement): object is SvgShapePattern => object.instanceType === INSTANCE_TYPE.SVG_SHAPE_PATTERN;
    public static asImage = (object: SvgElement): object is SvgImage => object.instanceType === INSTANCE_TYPE.SVG_IMAGE;
    public static asUseG = (object: SvgElement): object is SvgUseG => object.instanceType === INSTANCE_TYPE.SVG_USE_G;
    public static asUseSymbol = (object: SvgElement): object is SvgUseSymbol => object.instanceType === INSTANCE_TYPE.SVG_USE_SYMBOL;
    public static asUseShape = (object: SvgElement): object is SvgUseShape => object.instanceType === INSTANCE_TYPE.SVG_USE_SHAPE;
    public static asUseShapePattern = (object: SvgElement): object is SvgUseShapePattern => object.instanceType === INSTANCE_TYPE.SVG_USE_SHAPE_PATTERN;
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
        const length = values.length;
        let i = 0;
        if (precision) {
            while (i < length) {
                const { x, y } = values[i++];
                result += ` ${truncate(x, precision)},${truncate(y, precision)}`;
            }
        }
        else {
            while (i < length) {
                const { x, y } = values[i++];
                result += ` ${x},${y}`;
            }
        }
        return result;
    }

    public static drawPath(values: SvgPathCommand[], precision?: number) {
        let result = '';
        const length = values.length;
        let i = 0;
        while (i < length) {
            const value = values[i++];
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
            let rx: number,
                ry: number;
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
            let x = element.x.baseVal.value,
                y = element.y.baseVal.value,
                width = element.width.baseVal.value,
                height = element.height.baseVal.value;
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

    public static transformRefit(value: string, options?: SvgTransformRefitOptions) {
        let transforms: Undef<SvgTransform[]>,
            parent: Undef<SvgView>,
            container: Undef<SvgContainer>,
            precision: Undef<number>;
        if (options) {
            ({ transforms, parent, container, precision } = options);
        }
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
            let rotating = false,
                rotateFixed = 0,
                rotateInitial = 0,
                rotatePrevious = 0,
                overflow = 0,
                center: Undef<SvgPoint>,
                key = -1;
            if (isAngle(rotation)) {
                rotateFixed = parseAngle(rotation, 0);
            }
            else {
                for (const item of SvgBuild.getPathCommands(value)) {
                    switch (item.key.toUpperCase()) {
                        case 'M':
                        case 'L':
                        case 'H':
                        case 'V':
                        case 'Z': {
                            const values = item.value;
                            for (let i = 0; i < values.length; ++i) {
                                keyPoints.push(values[i]);
                                rotatingPoints.push(false);
                            }
                            break;
                        }
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
                    rotateInitial = parseAngle(rotation.split(' ').pop() as string, 0);
                }
            }
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
        const result: SvgPathCommand[] = [];
        const pattern = /([A-Za-z])([^A-Za-z]+)?/g;
        let first = true,
            match: Null<RegExpExecArray>;
        while (match = pattern.exec(value.trim())) {
            let key = match[1];
            if (first && key.toUpperCase() !== 'M') {
                break;
            }
            const coordinates = SvgBuild.parseCoordinates((match[2] || '').trim());
            const items: number[][] = [];
            let length = coordinates.length,
                previousCommand: Undef<string>,
                previousPoint: Undef<Point>;
            if (!first) {
                const previous = result[result.length - 1];
                previousCommand = previous.key.toUpperCase();
                previousPoint = previous.end;
            }
            switch (key.toUpperCase()) {
                case 'M':
                    if (first) {
                        key = 'M';
                    }
                case 'L':
                    if (length >= 2) {
                        length -= length % 2;
                        items.push(coordinates);
                    }
                    break;
                case 'H':
                    if (previousPoint && length) {
                        let i = 0;
                        while (i < length) {
                            items.push([coordinates[i++], key === 'h' ? 0 : previousPoint.y]);
                        }
                    }
                    break;
                case 'V':
                    if (previousPoint && length) {
                        let i = 0;
                        while (i < length) {
                            items.push([key === 'v' ? 0 : previousPoint.x, coordinates[i++]]);
                        }
                    }
                    break;
                case 'Z':
                    if (!first) {
                        items.push(result[0].coordinates.slice(0, 2));
                        key = 'Z';
                    }
                    break;
                case 'C':
                    if (length >= 6) {
                        length -= length % 6;
                        for (let i = 0; i < length; i += 6) {
                            const points = coordinates.slice(i, i + 6);
                            items.push(points);
                        }
                    }
                    break;
                case 'S':
                    if (length >= 4 && (previousCommand === 'C' || previousCommand === 'S')) {
                        length -= length % 4;
                        for (let i = 0; i < length; i += 4) {
                            const points = coordinates.slice(i, i + 4);
                            items.push(points);
                        }
                    }
                    break;
                case 'Q':
                    if (length >= 4) {
                        length -= length % 4;
                        for (let i = 0; i < length; i += 4) {
                            const points = coordinates.slice(i, i + 4);
                            items.push(points);
                        }
                    }
                    break;
                case 'T':
                    if (length >= 2 && (previousCommand === 'Q' || previousCommand === 'T')) {
                        length -= length % 2;
                        for (let i = 0; i < length; i += 2) {
                            const points = coordinates.slice(i, i + 2);
                            items.push(points);
                        }
                    }
                    break;
                case 'A':
                    if (length >= 7) {
                        length -= length % 7;
                        for (let i = 0; i < length; i += 7) {
                            const points = coordinates.slice(i, i + 7);
                            items.push(points);
                        }
                    }
                    break;
                default:
                    continue;
            }
            for (const item of items) {
                const lowerKey = key.toLowerCase();
                const commandA = lowerKey === 'a' ? item.splice(0, 5) : undefined;
                const relative = key === lowerKey;
                const itemCount = item.length;
                const points: SvgPoint[] = new Array(itemCount / 2);
                for (let i = 0, j = 0; i < itemCount; i += 2) {
                    let x = item[i],
                        y = item[i + 1];
                    if (relative && previousPoint) {
                        x += previousPoint.x;
                        y += previousPoint.y;
                    }
                    points[j++] = { x, y };
                }
                const data: SvgPathCommand = {
                    key,
                    value: points,
                    start: points[0],
                    end: points[points.length - 1],
                    relative,
                    coordinates: item
                };
                if (commandA) {
                    data.radiusX = commandA[0];
                    data.radiusY = commandA[1];
                    data.xAxisRotation = commandA[2];
                    data.largeArcFlag = commandA[3];
                    data.sweepFlag = commandA[4];
                }
                result.push(data);
                previousPoint = data.end;
                first = false;
            }
        }
        return result;
    }

    public static getPathPoints(values: SvgPathCommand[]) {
        const result: SvgPoint[] = [];
        let x = 0,
            y = 0;
        const length = values.length;
        let i = 0, j: number;
        while (i < length) {
            const value = values[i++];
            const { key, relative, coordinates } = value;
            const q = coordinates.length;
            j = 0;
            while (j < q) {
                if (relative) {
                    x += coordinates[j++];
                    y += coordinates[j++];
                }
                else {
                    x = coordinates[j++];
                    y = coordinates[j++];
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
                const { key, coordinates, value } = item;
                if (item.relative) {
                    if (location) {
                        if (transformed && (key === 'H' || key === 'V')) {
                            const pt = points.shift();
                            if (pt) {
                                coordinates[0] = pt.x;
                                coordinates[1] = pt.y;
                                value[0] = pt;
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
                                    if (key === 'a' && pt.rx !== undefined && pt.ry !== undefined) {
                                        item.radiusX = pt.rx;
                                        item.radiusY = pt.ry;
                                    }
                                    value[k++] = pt;
                                    location = pt;
                                }
                                else {
                                    break invalid;
                                }
                            }
                            item.key = key.toLowerCase();
                        }
                    }
                    else {
                        break;
                    }
                }
                else {
                    switch (key.toUpperCase()) {
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
                }
                location = value[value.length - 1];
                item.start = value[0];
                item.end = location;
            }
        }
        return values;
    }

    public static filterTransforms(transforms: SvgTransform[], exclude?: number[]) {
        const result: SvgTransform[] = [];
        for (let i = 0; i < transforms.length; ++i) {
            const item = transforms[i];
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
            let x1 = 0,
                y1 = 0,
                x2 = 0,
                y2 = 0;
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
            for (let i = 0; i < result.length; ++i) {
                const pt = result[i];
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

    public static minMaxPoints(values: SvgPoint[], radius = false): BoxRect {
        let { x: minX, y: minY } = values[0];
        let maxX = minX,
            maxY = minY;
        const length = values.length;
        for (let i = 1; i < length; ++i) {
            const { x, y } = values[i];
            if (radius && i > 0) {
                const { rx, ry } = values[i];
                if (rx !== undefined && ry !== undefined) {
                    const { x: x1, y: y1 } = values[i - 1];
                    let x2 = (x + x1) / 2,
                        y2 = (y + y1) / 2;
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
        return { top: minY, right: maxX, bottom: maxY, left: minX };
    }

    public static centerPoints(...values: SvgPoint[]): SvgPoint {
        const result = this.minMaxPoints(values);
        return { x: (result.left + result.right) / 2, y: (result.top + result.bottom) / 2 };
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
        REGEXP_DECIMAL.lastIndex = 0;
        const result: number[] = [];
        let match: Null<RegExpExecArray>;
        while (match = REGEXP_DECIMAL.exec(value)) {
            const coord = parseFloat(match[0]);
            if (!isNaN(coord)) {
                result.push(coord);
            }
        }
        return result;
    }

    public static getBoxRect(values: string[]) {
        let points: SvgPoint[] = [];
        const length = values.length;
        let i = 0;
        while (i < length) {
            points = points.concat(SvgBuild.getPathPoints(SvgBuild.getPathCommands(values[i++])));
        }
        return this.minMaxPoints(points, true);
    }

    public static setName(element: SVGElement) {
        let value: Undef<string>,
            tagName: Undef<string>;
        let id = element.id.trim();
        if (id !== '') {
            id = convertWord(id, true);
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

    public static resetNameCache() {
        NAME_GRAPHICS.clear();
    }
}