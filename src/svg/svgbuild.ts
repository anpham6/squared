import INSTANCE_TYPE = squared.svg.constant.INSTANCE_TYPE;

import type Svg from './svg';
import type SvgAnimate from './svganimate';
import type SvgAnimateMotion from './svganimatemotion';
import type SvgAnimateTransform from './svganimatetransform';
import type SvgAnimation from './svganimation';
import type SvgElement from './svgelement';
import type SvgG from './svgg';
import type SvgImage from './svgimage';
import type SvgPattern from './svgpattern';
import type SvgShape from './svgshape';
import type SvgShapePattern from './svgshapepattern';
import type SvgUseG from './svguseg';
import type SvgUseShape from './svguseshape';
import type SvgUseShapePattern from './svguseshapepattern';
import type SvgUseSymbol from './svgusesymbol';

import { MATRIX, SVG, TRANSFORM, createPath, truncateString } from './lib/util';

type SvgContainer = squared.svg.SvgContainer;
type SvgGroup = squared.svg.SvgGroup;
type SvgUse = squared.svg.SvgUse;
type SvgView = squared.svg.SvgView;

const { STRING } = squared.lib.regex;

const { isAngle, parseAngle } = squared.lib.css;
const { getNamedItem } = squared.lib.dom;
const { absoluteAngle, offsetAngleY, relativeAngle, truncate, truncateFraction } = squared.lib.math;
const { hasBit, isArray, splitPair, splitPairEnd, splitSome } = squared.lib.util;

const REGEXP_DECIMAL = new RegExp(STRING.DECIMAL_SIGNED, 'g');
const REGEXP_PATHCOMMAND = /([A-Za-z])([^A-Za-z]+)?/g;

export default class SvgBuild implements squared.svg.SvgBuild {
    public static isUse(object: SvgElement): object is SvgUse {
        return hasBit(object.instanceType, INSTANCE_TYPE.SVG_USE);
    }

    public static isContainer(object: SvgElement): object is SvgGroup {
        return hasBit(object.instanceType, INSTANCE_TYPE.SVG_CONTAINER);
    }

    public static isElement(object: SvgElement): object is SvgElement {
        return hasBit(object.instanceType, INSTANCE_TYPE.SVG_ELEMENT);
    }

    public static isShape(object: SvgElement): object is SvgShape {
        return hasBit(object.instanceType, INSTANCE_TYPE.SVG_SHAPE);
    }

    public static isAnimate(object: SvgAnimation): object is SvgAnimate {
        return hasBit(object.instanceType, INSTANCE_TYPE.SVG_ANIMATE);
    }

    public static isAnimateTransform(object: SvgAnimation): object is SvgAnimateTransform {
        return hasBit(object.instanceType, INSTANCE_TYPE.SVG_ANIMATE_TRANSFORM);
    }

    public static asSvg(object: SvgElement): object is Svg {
        return object.instanceType === INSTANCE_TYPE.SVG;
    }

    public static asG(object: SvgElement): object is SvgG {
        return object.instanceType === INSTANCE_TYPE.SVG_G;
    }

    public static asPattern(object: SvgElement): object is SvgPattern {
        return object.instanceType === INSTANCE_TYPE.SVG_PATTERN;
    }

    public static asShapePattern(object: SvgElement): object is SvgShapePattern {
        return object.instanceType === INSTANCE_TYPE.SVG_SHAPE_PATTERN;
    }

    public static asImage(object: SvgElement): object is SvgImage {
        return object.instanceType === INSTANCE_TYPE.SVG_IMAGE;
    }

    public static asUseG(object: SvgElement): object is SvgUseG {
        return object.instanceType === INSTANCE_TYPE.SVG_USE_G;
    }

    public static asUseSymbol(object: SvgElement): object is SvgUseSymbol {
        return object.instanceType === INSTANCE_TYPE.SVG_USE_SYMBOL;
    }

    public static asUseShape(object: SvgElement): object is SvgUseShape {
        return object.instanceType === INSTANCE_TYPE.SVG_USE_SHAPE;
    }

    public static asUseShapePattern(object: SvgElement): object is SvgUseShapePattern {
        return object.instanceType === INSTANCE_TYPE.SVG_USE_SHAPE_PATTERN;
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

    public static drawCircle(cx: number, cy: number, r: number, precision?: number) {
        return SvgBuild.drawEllipse(cx, cy, r, r, precision);
    }

    public static drawPolygon(values: Point[] | DOMPoint[], precision?: number) {
        return values.length > 0 ? SvgBuild.drawPolyline(values, precision) + 'Z' : '';
    }

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
        return `M${x},${y} ${width},${y} ${width},${height} ${x},${height}Z`;
    }

    public static drawEllipse(cx: number, cy: number, rx: number, ry?: number, precision?: number) {
        if (ry === undefined) {
            ry = rx;
        }
        let radius = rx * 2;
        cx -= rx;
        if (precision) {
            cx = truncate(cx, precision) as any;
            cy = truncate(cy, precision) as any;
            rx = truncate(rx, precision) as any;
            ry = truncate(ry, precision) as any;
            radius = truncate(radius, precision) as any;
        }
        return `M${cx},${cy} a${rx},${ry!},0,0,1,${radius},0 a${rx},${ry!},0,0,1,-${radius},0`;
    }

    public static drawPolyline(values: Point[] | DOMPoint[], precision?: number) {
        let result = 'M';
        const length = values.length;
        if (precision) {
            for (let i = 0; i < length; ++i) {
                const { x, y } = values[i];
                result += ' ' + truncate(x, precision) + ',' + truncate(y, precision);
            }
        }
        else {
            for (let i = 0; i < length; ++i) {
                const { x, y } = values[i];
                result += ' ' + x + ',' + y;
            }
        }
        return result;
    }

    public static drawPath(values: SvgPathCommand[], precision?: number) {
        let result = '';
        for (let i = 0, length = values.length; i < length; ++i) {
            const value = values[i];
            result += i > 0 ? ' ' + value.key : value.key;
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
                    result += `${value.radiusX!},${value.radiusY!},${value.xAxisRotation!},${value.largeArcFlag!},${value.sweepFlag!},${value.coordinates.join(',')}`;
                    break;
            }
        }
        return precision ? truncateString(result, precision) : result;
    }

    public static drawRefit(element: SVGGraphicsElement, parent: Null<SvgContainer>, precision?: number) {
        let value: Undef<string>;
        if (SVG.path(element)) {
            value = getNamedItem(element, 'd');
            if (parent && parent.requireRefit) {
                const commands = SvgBuild.toPathCommands(value);
                if (commands.length) {
                    const points = SvgBuild.toPathPoints(commands);
                    if (points.length) {
                        parent.refitPoints(points);
                        value = SvgBuild.drawPath(SvgBuild.syncPath(commands, points), precision);
                    }
                }
            }
        }
        else if (SVG.line(element)) {
            const points: SvgPoint[] = [
                { x: element.x1.baseVal.value, y: element.y1.baseVal.value },
                { x: element.x2.baseVal.value, y: element.y2.baseVal.value }
            ];
            if (parent && parent.requireRefit) {
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
            if (parent && parent.requireRefit) {
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
            if (parent && parent.requireRefit) {
                x = parent.refitX(x);
                y = parent.refitY(y);
                width = parent.refitSize(width);
                height = parent.refitSize(height);
            }
            value = SvgBuild.drawRect(width, height, x, y, precision);
        }
        else if (SVG.polygon(element) || SVG.polyline(element)) {
            const points = SvgBuild.clonePoints(element.points);
            if (parent && parent.requireRefit) {
                parent.refitPoints(points);
            }
            value = SVG.polygon(element) ? SvgBuild.drawPolygon(points, precision) : SvgBuild.drawPolyline(points, precision);
        }
        return value || '';
    }

    public static transformRefit(value: string, options?: SvgTransformRefitOptions<SvgView, SvgContainer>) {
        let transforms: Optional<SvgTransform[]>,
            parent: Optional<SvgView>,
            container: Optional<SvgContainer>,
            precision: Undef<number>;
        if (options) {
            ({ transforms, parent, container, precision } = options);
        }
        const commands = SvgBuild.toPathCommands(value);
        if (commands.length) {
            let points = SvgBuild.toPathPoints(commands);
            if (points.length) {
                const transformed = isArray(transforms);
                if (transformed) {
                    points = SvgBuild.applyTransforms(transforms!, points, parent && TRANSFORM.origin(parent.element));
                }
                if (container && container.requireRefit) {
                    container.refitPoints(points);
                }
                value = SvgBuild.drawPath(SvgBuild.syncPath(commands, points, transformed), precision);
            }
        }
        return value;
    }

    public static toOffsetPath(value: string, rotation = 'auto 0deg') {
        const element = createPath(value);
        const totalLength = Math.ceil(element.getTotalLength());
        const result: SvgOffsetPath[] = [];
        if (totalLength) {
            const keyPoints: Point[] = [];
            const rotatingPoints: boolean[] = [];
            let rotateFixed = 0,
                rotateInitial = 0,
                rotatePrevious = 0,
                overflow = 0,
                center: Null<SvgPoint> = null,
                rotating: Undef<boolean>;
            if (isAngle(rotation)) {
                rotateFixed = parseAngle(rotation, 0);
            }
            else {
                for (const item of SvgBuild.toPathCommands(value)) {
                    switch (item.key.toUpperCase()) {
                        case 'M':
                        case 'L':
                        case 'H':
                        case 'V':
                        case 'Z':
                            keyPoints.push(...item.value);
                            rotatingPoints.push(...new Array(item.value.length).fill(false));
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
                    rotateInitial = parseAngle(splitPairEnd(rotation, ' '), 0);
                }
            }
            for (let key = 0; key < totalLength; ++key) {
                const nextPoint = element.getPointAtLength(key);
                if (keyPoints.length) {
                    const index = keyPoints.findIndex((pt: Point) => {
                        const x = pt.x.toString();
                        const y = pt.y.toString();
                        return x === nextPoint.x.toPrecision(x.length - (x.indexOf('.') !== -1 ? 1 : 0)) && y === nextPoint.y.toPrecision(y.length - (y.indexOf('.') !== -1 ? 1 : 0));
                    });
                    if (index !== -1) {
                        const endPoint = keyPoints[index + 1] as Undef<Point>;
                        if (endPoint) {
                            if (rotating = rotatingPoints[index + 1]) {
                                center = SvgBuild.centerOf(keyPoints[index], endPoint);
                                rotateFixed = 0;
                            }
                            else {
                                center = null;
                                rotateFixed = truncateFraction(absoluteAngle(nextPoint, endPoint));
                            }
                        }
                        else {
                            center = null;
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

    public static toPathCommands(value: string) {
        const result: SvgPathCommand[] = [];
        let n = 0,
            match: Null<RegExpExecArray>;
        while (match = REGEXP_PATHCOMMAND.exec(value)) {
            let key = match[1];
            if (n === 0 && key.toUpperCase() !== 'M') {
                break;
            }
            const coordinates = match[2] ? SvgBuild.parseCoordinates(match[2].trim()) : [];
            const items: number[][] = [];
            let length = coordinates.length,
                previousCommand: Undef<string>,
                previousPoint: Undef<Point>;
            if (n > 0) {
                const previous = result[n - 1];
                previousCommand = previous.key.toUpperCase();
                previousPoint = previous.end;
            }
            switch (key.toUpperCase()) {
                case 'M':
                    if (n === 0) {
                        key = 'M';
                    }
                case 'L':
                    if (length >= 2) {
                        length -= length % 2;
                        items.push(coordinates);
                    }
                    break;
                case 'H':
                    if (previousPoint) {
                        for (let i = 0; i < length; ++i) {
                            items.push([coordinates[i], key === 'h' ? 0 : previousPoint.y]);
                        }
                    }
                    break;
                case 'V':
                    if (previousPoint) {
                        for (let i = 0; i < length; ++i) {
                            items.push([key === 'v' ? 0 : previousPoint.x, coordinates[i]]);
                        }
                    }
                    break;
                case 'Z':
                    if (n > 0) {
                        items.push(result[0].coordinates.slice(0, 2));
                        key = 'Z';
                    }
                    break;
                case 'C':
                    if (length >= 6) {
                        length -= length % 6;
                        for (let i = 0; i < length; i += 6) {
                            items.push(coordinates.slice(i, i + 6));
                        }
                    }
                    break;
                case 'S':
                    if (length >= 4 && (previousCommand === 'C' || previousCommand === 'S')) {
                        length -= length % 4;
                        for (let i = 0; i < length; i += 4) {
                            items.push(coordinates.slice(i, i + 4));
                        }
                    }
                    break;
                case 'Q':
                    if (length >= 4) {
                        length -= length % 4;
                        for (let i = 0; i < length; i += 4) {
                            items.push(coordinates.slice(i, i + 4));
                        }
                    }
                    break;
                case 'T':
                    if (length >= 2 && (previousCommand === 'Q' || previousCommand === 'T')) {
                        length -= length % 2;
                        for (let i = 0; i < length; i += 2) {
                            items.push(coordinates.slice(i, i + 2));
                        }
                    }
                    break;
                case 'A':
                    if (length >= 7) {
                        length -= length % 7;
                        for (let i = 0; i < length; i += 7) {
                            items.push(coordinates.slice(i, i + 7));
                        }
                    }
                    break;
                default:
                    continue;
            }
            for (let i = 0, q = items.length; i < q; ++i) {
                const item = items[i];
                const lowerKey = key.toLowerCase();
                const commandA = lowerKey === 'a' ? item.splice(0, 5) : null;
                const relative = key === lowerKey;
                const itemCount = item.length;
                const points: SvgPoint[] = new Array(itemCount / 2);
                let k = 0;
                for (let j = 0; j < itemCount; j += 2) {
                    let x = item[j],
                        y = item[j + 1];
                    if (relative && previousPoint) {
                        x += previousPoint.x;
                        y += previousPoint.y;
                    }
                    points[k++] = { x, y };
                }
                const data: SvgPathCommand = {
                    key,
                    value: points,
                    start: points[0],
                    end: points[k - 1],
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
            }
            n = result.length;
        }
        REGEXP_PATHCOMMAND.lastIndex = 0;
        return result;
    }

    public static toPathPoints(values: SvgPathCommand[]) {
        const result: SvgPoint[] = [];
        let x = 0,
            y = 0;
        for (let i = 0, length = values.length; i < length; ++i) {
            const value = values[i];
            const { key, relative, coordinates } = value;
            for (let j = 0, q = coordinates.length; j < q; j += 2) {
                if (relative) {
                    x += coordinates[j];
                    y += coordinates[j + 1];
                }
                else {
                    x = coordinates[j];
                    y = coordinates[j + 1];
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

    public static syncPath(values: SvgPathCommand[], points: SvgPoint[], transformed?: boolean) {
        invalid: {
            let location: Undef<Point>;
            for (let i = 0, length = values.length; i < length; ++i) {
                const item = values[i];
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
                            for (let j = 0, k = 0; j < q; j += 2) {
                                const pt = points.shift();
                                if (pt) {
                                    coordinates[j] = pt.x - location.x;
                                    coordinates[j + 1] = pt.y - location.y;
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
                            for (let j = 0, k = 0; j < q; j += 2) {
                                const pt = points.shift();
                                if (pt) {
                                    coordinates[j] = pt.x;
                                    coordinates[j + 1] = pt.y;
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
        for (let i = 0, length = transforms.length; i < length; ++i) {
            const item = transforms[i];
            const type = item.type;
            if (!(exclude && exclude.includes(type))) {
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

    public static applyTransforms(transforms: SvgTransform[], values: SvgPoint[], origin?: Null<SvgPoint>) {
        const result = SvgBuild.clonePoints(values);
        const length = result.length;
        for (const item of transforms.slice(0).reverse()) {
            const m = item.matrix;
            let x1 = 0,
                y1 = 0,
                x2 = 0,
                y2 = 0;
            if (origin) {
                const { x, y } = origin;
                const { x: mX, y: mY } = item.method;
                switch (item.type) {
                    case SVGTransform.SVG_TRANSFORM_SCALE:
                        if (mX) {
                            x2 = x * (1 - m.a);
                        }
                        if (mY) {
                            y2 = y * (1 - m.d);
                        }
                        break;
                    case SVGTransform.SVG_TRANSFORM_SKEWX:
                        if (mX || mY) {
                            y1 -= y;
                        }
                        break;
                    case SVGTransform.SVG_TRANSFORM_SKEWY:
                        if (mX || mY) {
                            x1 -= x;
                        }
                        break;
                    case SVGTransform.SVG_TRANSFORM_ROTATE:
                        if (mX) {
                            x1 -= x;
                            x2 = x + offsetAngleY(item.angle, x);
                        }
                        if (mY) {
                            y1 -= y;
                            y2 = y + offsetAngleY(item.angle, y);
                        }
                        break;
                }
            }
            for (let i = 0; i < length; ++i) {
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
        for (let i = 0; i < length; ++i) {
            const { type, matrix, angle } = transform.getItem(i);
            result[i] = TRANSFORM.create(type, matrix, angle);
        }
        return result;
    }

    public static convertPoints(values: number[]) {
        const length = values.length;
        if (length % 2 === 0) {
            const result: Point[] = new Array(length / 2);
            for (let i = 0, j = 0; i < length; i += 2) {
                result[j++] = {
                    x: values[i],
                    y: values[i + 1]
                };
            }
            return result;
        }
        return [];
    }

    public static clonePoints(values: SvgPoint[] | SVGPointList) {
        if (Array.isArray(values)) {
            const length = values.length;
            const result: SvgPoint[] = new Array(length);
            for (let i = 0; i < length; ++i) {
                const { x, y, rx, ry } = values[i];
                const item: SvgPoint = { x, y };
                if (rx !== undefined && ry !== undefined) {
                    item.rx = rx;
                    item.ry = ry;
                }
                result[i] = item;
            }
            return result;
        }
        const length = values.numberOfItems;
        const result: SvgPoint[] = new Array(length);
        for (let i = 0; i < length; ++i) {
            const { x, y } = values.getItem(i);
            result[i] = { x, y };
        }
        return result;
    }

    public static minMaxOf(values: SvgPoint[], radius?: boolean): BoxRect {
        let { x: minX, y: minY } = values[0],
            maxX = minX,
            maxY = minY;
        for (let i = 1, length = values.length; i < length; ++i) {
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

    public static centerOf(...values: SvgPoint[]): SvgPoint {
        const result = this.minMaxOf(values);
        return { x: (result.left + result.right) / 2, y: (result.top + result.bottom) / 2 };
    }

    public static boxRectOf(values: string[]) {
        const points: SvgPoint[] = [];
        for (let i = 0, length = values.length; i < length; ++i) {
            points.push(...SvgBuild.toPathPoints(SvgBuild.toPathCommands(values[i])));
        }
        return this.minMaxOf(points, true);
    }

    public static parsePoints(value: string) {
        const result: Point[] = [];
        splitSome(value, coords => {
            const [x, y] = splitPair(coords, ',');
            result.push({ x: +x, y: +y });
        }, /\s+/g);
        return result;
    }

    public static parseCoordinates(value: string) {
        const result: number[] = [];
        let match: Null<RegExpExecArray>;
        while (match = REGEXP_DECIMAL.exec(value)) {
            const coord = +match[0];
            if (!isNaN(coord)) {
                result.push(coord);
            }
        }
        REGEXP_DECIMAL.lastIndex = 0;
        return result;
    }
}