import { SvgPathCommand, SvgPoint, SvgTransform } from './@types/object';

import { SVG, applyMatrixX, applyMatrixY, createTransform, getRadiusY } from './lib/util';

type Svg = squared.svg.Svg;
type SvgAnimation = squared.svg.SvgAnimation;
type SvgAnimate = squared.svg.SvgAnimate;
type SvgAnimateMotion = squared.svg.SvgAnimateMotion;
type SvgAnimateTransform = squared.svg.SvgAnimateTransform;
type SvgContainer = squared.svg.SvgContainer;
type SvgElement = squared.svg.SvgElement;
type SvgG = squared.svg.SvgG;
type SvgImage = squared.svg.SvgImage;
type SvgShape = squared.svg.SvgShape;
type SvgUse = squared.svg.SvgUse;
type SvgUseSymbol = squared.svg.SvgUseSymbol;
type SvgView = squared.svg.SvgView;

const $util = squared.lib.util;

const NAME_GRAPHICS = new Map<string, number>();

export default class SvgBuild implements squared.svg.SvgBuild {
    public static setName(element?: SVGElement) {
        if (element) {
            let result = '';
            let tagName: string | undefined;
            if ($util.isString(element.id)) {
                if (!NAME_GRAPHICS.has(element.id)) {
                    result = element.id;
                }
                tagName = element.id;
            }
            else {
                tagName = element.tagName;
            }
            let index = NAME_GRAPHICS.get(tagName) || 0;
            if (result !== '') {
                NAME_GRAPHICS.set(tagName, index);
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

    public static instance(object: SvgElement): object is Svg {
        return object.element.tagName === 'svg';
    }

    public static instanceOfContainer(object: SvgElement): object is Svg | SvgG | SvgUseSymbol {
        return SvgBuild.instance(object) || SvgBuild.instanceOfG(object) || SvgBuild.instanceOfUseSymbol(object);
    }

    public static instanceOfElement(object: SvgElement): object is SvgElement {
        return SvgBuild.instanceOfShape(object) || SvgBuild.instanceOfImage(object) || SvgBuild.instanceOfUse(object) && !SvgBuild.instanceOfUseSymbol(object);
    }

    public static instanceOfG(object: SvgElement): object is SvgG {
        return object.element.tagName === 'g';
    }

    public static instanceOfUseSymbol(object: SvgElement): object is SvgUseSymbol {
        return SvgBuild.instanceOfUse(object) && object['symbolElement'] !== undefined;
    }

    public static instanceOfShape(object: SvgElement): object is SvgShape {
        return (SvgBuild.instanceOfUse(object) || SVG.shape(object.element)) && object['path'] !== undefined;
    }

    public static instanceOfImage(object: SvgElement): object is SvgImage {
        return SvgBuild.instanceOfUse(object) && object['imageElement'] !== undefined || object.element.tagName === 'image';
    }

    public static instanceOfUse(object: SvgElement): object is SvgUse {
        return object.element.tagName === 'use';
    }

    public static instanceOfSet(object: SvgAnimation) {
        return !!object.element && object.element.tagName === 'set';
    }

    public static instanceOfAnimate(object: SvgAnimation): object is SvgAnimate {
        return !!object.element && object.element.tagName === 'animate' || object instanceof squared.svg.SvgAnimate && !SvgBuild.instanceOfAnimateTransform(object) && !SvgBuild.instanceOfAnimateTransform(object);
    }

    public static instanceOfAnimateTransform(object: SvgAnimation): object is SvgAnimateTransform {
        return !!object.element && object.element.tagName === 'animateTransform' || object instanceof squared.svg.SvgAnimateTransform;
    }

    public static instanceOfAnimateMotion(object: SvgAnimation): object is SvgAnimateMotion {
        return !!object.element && object.element.tagName === 'animateMotion' || object instanceof squared.svg.SvgAnimateMotion;
    }

    public static getContainerOpacity(instance: SvgView) {
        let result = parseFloat(instance.opacity);
        let current: SvgContainer | undefined = instance.parent;
        while (current) {
            const opacity = parseFloat(current['opacity'] || '1');
            if (opacity < 1) {
                result *= opacity;
            }
            current = current['parent'];
        }
        return result;
    }

    public static getContainerViewBox(instance: SvgContainer): Svg | SvgUseSymbol | undefined {
        let current: SvgContainer | undefined = instance;
        while (current) {
            switch (current.element.tagName) {
                case 'svg':
                    return <Svg> current;
                case 'symbol':
                    return <SvgUseSymbol> current;
                default:
                    current = current['parent'];
            }
        }
        return undefined;
    }

    public static convertTransformList(transform: SVGTransformList) {
        const result: SvgTransform[] = [];
        for (let i = 0; i < transform.numberOfItems; i++) {
            const item = transform.getItem(i);
            result.push(createTransform(item.type, item.matrix, item.angle));
        }
        return result;
    }

    public static filterTransforms(transform: SvgTransform[], exclude?: number[]) {
        return (exclude ? transform.filter(item => !exclude.includes(item.type)) : transform).filter(item => !(item.type === SVGTransform.SVG_TRANSFORM_SCALE && item.matrix.a === 1 && item.matrix.d === 1));
    }

    public static applyTransforms(transform: SvgTransform[], values: SvgPoint[], origin?: SvgPoint, center?: SvgPoint) {
        const result = SvgBuild.clonePoints(values);
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
                if (item.type === SVGTransform.SVG_TRANSFORM_SCALE && pt.rx !== undefined && pt.ry !== undefined) {
                    const rx = pt.rx;
                    pt.rx = applyMatrixX(m, rx + x1, pt.ry + y1);
                    pt.ry = applyMatrixY(m, rx + x2, pt.ry + y2);
                }
            }
        }
        return result;
    }

    public static getCenterPoint(values: SvgPoint[]): SvgPoint {
        const pointsX = values.map(pt => pt.x);
        const pointsY = values.map(pt => pt.y);
        return {
            x: ($util.minArray(pointsX) + $util.maxArray(pointsX)) / 2,
            y: ($util.minArray(pointsY) + $util.maxArray(pointsY)) / 2
        };
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

    public static fromNumberList(values: number[]) {
        const result: SvgPoint[] = [];
        for (let i = 0; i < values.length; i += 2) {
            result.push({ x: values[i], y: values[i + 1] });
        }
        return result.length % 2 === 0 ? result : [];
    }

    public static toNumberList(value: string) {
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

    public static getAbsolutePoints(values: SvgPathCommand[]) {
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

    public static mergeAbsolutePoints(values: SvgPathCommand[], points: SvgPoint[]) {
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

    public static toPathCommandList(value: string) {
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
}