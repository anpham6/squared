import { SvgOffsetPath, SvgPathCommand, SvgPoint, SvgTransform } from './@types/object';

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

const $dom = squared.lib.dom;
const $math = squared.lib.math;
const $regex = squared.lib.regex;
const $util = squared.lib.util;

const REGEXP_DECIMAL = new RegExp($regex.STRING.DECIMAL, 'g');
const REGEXP_COMMAND = /([A-Za-z])([^A-Za-z]+)?/g;

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

    public static asPattern(object: SvgElement): object is SvgPattern {
        return object.instanceType === INSTANCE_TYPE.SVG_PATTERN;
    }

    public static asShapePattern(object: SvgElement): object is SvgShapePattern {
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

    public static asUseSymbol(object: SvgElement): object is SvgUseSymbol {
        return object.instanceType === INSTANCE_TYPE.SVG_USE_SYMBOL;
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
            let value = '';
            let tagName: string | undefined;
            if ($util.isString(element.id)) {
                const id = $util.convertWord(element.id, true);
                if (!NAME_GRAPHICS.has(id)) {
                    value = id;
                }
                tagName = id;
            }
            else {
                tagName = element.tagName;
            }
            let index = NAME_GRAPHICS.get(tagName) || 0;
            if (value !== '') {
                NAME_GRAPHICS.set(value, index);
                return value;
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

    public static drawLine(x1: number, y1: number, x2 = 0, y2 = 0, precision?: number) {
        const result = `M${x1},${y1} L${x2},${y2}`;
        return precision ? $math.truncateString(result, precision) : result;
    }

    public static drawRect(width: number, height: number, x = 0, y = 0, precision?: number) {
        const result = `M${x},${y} ${x + width},${y} ${x + width},${y + height} ${x},${y + height} Z`;
        return precision ? $math.truncateString(result, precision) : result;
    }

    public static drawCircle(cx: number, cy: number, r: number, precision?: number) {
        return SvgBuild.drawEllipse(cx, cy, r, r, precision);
    }

    public static drawEllipse(cx: number, cy: number, rx: number, ry?: number, precision?: number) {
        if (ry === undefined) {
            ry = rx;
        }
        const result = `M${cx - rx},${cy} a${rx},${ry},0,0,1,${rx * 2},0 a${rx},${ry},0,0,1,-${rx * 2},0`;
        return precision ? $math.truncateString(result, precision) : result;
    }

    public static drawPolygon(values: Point[] | DOMPoint[], precision?: number) {
        return values.length ? `${SvgBuild.drawPolyline(values, precision)} Z` : '';
    }

    public static drawPolyline(values: Point[] | DOMPoint[], precision?: number) {
        let result = 'M';
        for (const value of values) {
            result += `${value.x},${value.y} `;
        }
        result = result.substring(0, result.length - 1);
        return precision ? $math.truncateString(result, precision) : result;
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
        return precision ? $math.truncateString(result, precision) : result;
    }

    public static drawRefit(element: SVGGraphicsElement, parent?: SvgContainer, precision?: number) {
        let value: string;
        if (SVG.path(element)) {
            value = $dom.getNamedItem(element, 'd');
            if (parent && parent.requireRefit()) {
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
            if (parent && parent.requireRefit()) {
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
            const points: SvgPoint[] = [
                { x: element.cx.baseVal.value, y: element.cy.baseVal.value, rx, ry }
            ];
            if (parent && parent.requireRefit()) {
                parent.refitPoints(points);
            }
            const pt = <Required<SvgPoint>> points[0];
            value = SvgBuild.drawEllipse(pt.x, pt.y, pt.rx, pt.ry, precision);
        }
        else if (SVG.rect(element)) {
            let x = element.x.baseVal.value;
            let y = element.y.baseVal.value;
            let width = element.width.baseVal.value;
            let height = element.height.baseVal.value;
            if (parent && parent.requireRefit()) {
                x = parent.refitX(x);
                y = parent.refitY(y);
                width = parent.refitSize(width);
                height = parent.refitSize(height);
            }
            value = SvgBuild.drawRect(width, height, x, y, precision);
        }
        else if (SVG.polygon(element) || SVG.polyline(element)) {
            const points = SvgBuild.clonePoints(element.points);
            if (parent && parent.requireRefit()) {
                parent.refitPoints(points);
            }
            value = SVG.polygon(element) ? SvgBuild.drawPolygon(points, precision) : SvgBuild.drawPolyline(points, precision);
        }
        else {
            value = '';
        }
        return value;
    }

    public static transformRefit(value: string, transforms?: SvgTransform[], companion?: SvgShape, precision?: number) {
        const commands = SvgBuild.getPathCommands(value);
        if (commands.length) {
            let points = SvgBuild.getPathPoints(commands);
            if (points.length) {
                const transformed = transforms && transforms.length > 0;
                if (transformed) {
                    points = SvgBuild.applyTransforms(<SvgTransform[]> transforms, points, companion && TRANSFORM.origin(companion.element));
                }
                if (companion && companion.parent && companion.parent.requireRefit()) {
                    companion.parent.refitPoints(points);
                }
                value = SvgBuild.drawPath(SvgBuild.syncPathPoints(commands, points, transformed), precision);
            }
        }
        return value;
    }

    public static getOffsetPath(value: string, rotation = 'auto') {
        const element = <SVGGeometryElement> (createPath(value) as unknown);
        const totalLength = Math.ceil(element.getTotalLength());
        const result: SvgOffsetPath[] = [];
        if (totalLength > 0) {
            const keyPoints: Point[] = [];
            const rotatingPoints: boolean[] = [];
            let rotateFixed = 0;
            let rotateInitial = 0;
            if ($util.isNumber(rotation)) {
                rotateFixed = parseFloat(rotation);
            }
            else if (rotation === 'auto' || rotation.endsWith('reverse')) {
                const commands = SvgBuild.getPathCommands(value);
                for (const item of commands) {
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
                if (rotation.endsWith('reverse')) {
                    rotateInitial = 180;
                }
            }
            let rotating = false;
            let rotatePrevious = 0;
            let overflow = 0;
            let center: SvgPoint | undefined;
            for (let key = 0; key <= totalLength; key++) {
                const nextPoint = element.getPointAtLength(key);
                if (keyPoints.length) {
                    const index = keyPoints.findIndex(pt => {
                        const x = pt.x.toString();
                        const y = pt.y.toString();
                        return x === nextPoint.x.toPrecision(x.length - (x.indexOf('.') !== -1 ? 1 : 0)) && y === nextPoint.y.toPrecision(y.length - (y.indexOf('.') !== -1 ? 1 : 0));
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
                                rotateFixed = $math.truncateFraction($math.absoluteAngle(nextPoint, endPoint));
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
                    rotate = center ? $math.truncateFraction($math.relativeAngle(center, nextPoint)) : 0;
                    if (rotatePrevious > 0 && rotatePrevious % 360 === 0 && Math.floor(rotate) === 0) {
                        overflow = rotatePrevious;
                    }
                    rotate += overflow;
                }
                else {
                    rotate = rotateFixed;
                }
                rotate += rotateInitial;
                result.push({
                    key,
                    value: nextPoint,
                    rotate
                });
                rotatePrevious = Math.ceil(rotate);
            }
        }
        return result;
    }

    public static getPathCommands(value: string) {
        const result: SvgPathCommand[] = [];
        let match: RegExpExecArray | null;
        value = value.trim();
        while ((match = REGEXP_COMMAND.exec(value)) !== null) {
            if (result.length === 0 && match[1].toUpperCase() !== 'M') {
                break;
            }
            const coordinates = SvgBuild.parseCoordinates((match[2] || '').trim());
            let previousCommand: string | undefined;
            let previousPoint: Point | undefined;
            if (result.length) {
                const previous = result[result.length - 1];
                previousCommand = previous.key.toUpperCase();
                previousPoint = previous.end;
            }
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
                        coordinates[0] = result[0].coordinates[0];
                        coordinates[1] = result[0].coordinates[1];
                        coordinates.length = 2;
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
                        radiusX = coordinates[0];
                        radiusY = coordinates[1];
                        xAxisRotation = coordinates[2];
                        largeArcFlag = coordinates[3];
                        sweepFlag = coordinates[4];
                        coordinates[0] = coordinates[5];
                        coordinates[1] = coordinates[6];
                        coordinates.length = 2;
                        break;
                    }
                    else {
                        continue;
                    }
                default:
                    continue;
            }
            if (coordinates.length >= 2) {
                const relative = match[1] === match[1].toLowerCase();
                const points: SvgPoint[] = [];
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
                    key: match[1],
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
            }
        }
        return result;
    }

    public static getPathPoints(values: SvgPathCommand[], radius = false) {
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
                if (item.key.toUpperCase() === 'A') {
                    pt.rx = item.radiusX;
                    pt.ry = item.radiusY;
                    if (radius) {
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
                item.key = item.key.toUpperCase();
            }
        }
        return result;
    }

    public static syncPathPoints(values: SvgPathCommand[], points: SvgPoint[], transformed = false) {
        let location: Point | undefined;
        invalid: {
            for (const item of values) {
                if (item.relative) {
                    if (location) {
                        if (transformed && (item.key === 'H' || item.key === 'V')) {
                            const pt = points.shift();
                            if (pt) {
                                item.coordinates[0] = pt.x;
                                item.coordinates[1] = pt.y;
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
                            for (let i = 0, j = 0; i < item.coordinates.length; i += 2, j++) {
                                const pt = points.shift();
                                if (pt) {
                                    item.coordinates[i] = pt.x - location.x;
                                    item.coordinates[i + 1] = pt.y - location.y;
                                    if (item.key === 'a' && pt.rx !== undefined && pt.ry !== undefined) {
                                        item.radiusX = pt.rx;
                                        item.radiusY = pt.ry;
                                    }
                                    item.value[j] = pt;
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
                            for (let i = 0, j = 0; i < item.coordinates.length; i += 2, j++) {
                                const pt = points.shift();
                                if (pt) {
                                    item.coordinates[i] = pt.x;
                                    item.coordinates[i + 1] = pt.y;
                                    item.value[j] = pt;
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
                            if (pt && pt.rx !== undefined && pt.ry !== undefined) {
                                item.coordinates[0] = pt.x;
                                item.coordinates[1] = pt.y;
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

    public static applyTransforms(transforms: SvgTransform[], values: SvgPoint[], origin?: SvgPoint) {
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
                            x2 = origin.x + $math.offsetAngleY(item.angle, origin.x);
                        }
                        if (item.method.y) {
                            y1 -= origin.y;
                            y2 = origin.y + $math.offsetAngleY(item.angle, origin.y);
                        }
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
            for (let i = 0; i < values.numberOfItems; i++) {
                const pt = values.getItem(i);
                result.push({ x: pt.x, y: pt.y });
            }
        }
        return result;
    }

    public static minMaxPoints(values: Point[]) {
        let minX = values[0].x;
        let maxX = values[0].x;
        let minY = values[0].y;
        let maxY = values[0].y;
        for (let i = 1; i < values.length; i++) {
            const pt = values[i];
            if (pt.x < minX) {
                minX = pt.x;
            }
            else if (pt.x > maxX) {
                maxX = pt.x;
            }
            if (pt.y < minY) {
                minY = pt.y;
            }
            else if (pt.y > maxY) {
                maxY = pt.y;
            }
        }
        return [minX, minY, maxX, maxY];
    }

    public static centerPoints(...values: SvgPoint[]): SvgPoint {
        const result = this.minMaxPoints(values);
        return {
            x: (result[0] + result[2]) / 2,
            y: (result[1] + result[3]) / 2
        };
    }

    public static convertPoints(values: number[]) {
        const result: Point[] = [];
        if (values.length % 2 === 0) {
            for (let i = 0; i < values.length; i += 2) {
                result.push({
                    x: values[i],
                    y: values[i + 1]
                });
            }
        }
        return result;
    }

    public static parsePoints(value: string) {
        const result: Point[] = [];
        for (const coords of value.trim().split($regex.CHAR.SPACE)) {
            const [x, y] = $util.replaceMap<string, number>(coords.split($regex.XML.SEPARATOR), pt => parseFloat(pt));
            result.push({ x, y });
        }
        return result;
    }

    public static parseCoordinates(value: string) {
        const result: number[] = [];
        let match: RegExpExecArray | null;
        while ((match = REGEXP_DECIMAL.exec(value)) !== null) {
            const coord = parseFloat(match[0]);
            if (!isNaN(coord)) {
                result.push(coord);
            }
        }
        return result;
    }

    public static getBoxRect(values: string[]): BoxRect {
        const points: SvgPoint[] = [];
        for (const value of values) {
            $util.concatArray(points, SvgBuild.getPathPoints(SvgBuild.getPathCommands(value), true));
        }
        const result = this.minMaxPoints(points);
        return { top: result[1], right: result[2], bottom: result[3], left: result[0] };
    }
}