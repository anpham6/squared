import { SvgBuildOptions, SvgPathCommand, SvgPathExtendData, SvgPoint, SvgStrokeDash, SvgTransform, SvgTransformResidual } from '../../@types/svg/object';

import SvgBaseVal$MX from './svgbaseval-mx';
import SvgPaint$MX from './svgpaint-mx';
import SvgAnimate from './svganimate';
import SvgAnimation from './svganimation';
import SvgAnimationIntervalMap from './svganimationintervalmap';
import SvgBuild from './svgbuild';
import SvgElement from './svgelement';

import { INSTANCE_TYPE, REGION_UNIT } from './lib/constant';
import { SVG, TRANSFORM, getPathLength } from './lib/util';

type SvgContainer = squared.svg.SvgContainer;
type SvgShape = squared.svg.SvgShape;
type SvgShapePattern = squared.svg.SvgShapePattern;

const $lib = squared.lib;

const { getNamedItem } = $lib.dom;
const { equal, lessEqual, multipleOf, offsetAngleX, offsetAngleY, relativeAngle, truncateFraction } = $lib.math;
const { cloneArray, convertInt, convertFloat } = $lib.util;

interface DashGroup {
    items: SvgStrokeDash[];
    delay: number;
    duration: number;
}

function updatePathLocation(path: SvgPathCommand[], attr: string, x?: number, y?: number) {
    const commandA = path[0];
    const commandB = path[path.length - 1];
    if (x !== undefined) {
        switch (attr) {
            case 'x':
                x -= commandA.start.x;
                break;
            case 'x1':
            case 'cx':
                commandA.start.x = x;
                commandA.coordinates[0] = x;
                return;
            case 'x2':
                commandB.end.x = x;
                commandB.coordinates[0] = x;
                return;
        }
    }
    if (y !== undefined) {
        switch (attr) {
            case 'y':
                y -= commandA.start.y;
                break;
            case 'y1':
            case 'cy':
                commandA.start.y = y;
                commandA.coordinates[1] = y;
                return;
            case 'y2':
                commandB.end.y = y;
                commandB.coordinates[1] = y;
                return;
        }
    }
    path.forEach(seg => {
        const { coordinates, value } = seg;
        const length = coordinates.length;
        for (let i = 0, j = 0; i < length; i += 2, ++j) {
            if (x !== undefined) {
                if (!seg.relative) {
                    coordinates[i] += x;
                }
                value[j].x += x;
            }
            if (y !== undefined) {
                if (!seg.relative) {
                    coordinates[j + 1] += y;
                }
                value[j].y += y;
            }
        }
    });
}

function updatePathRadius(path: SvgPathCommand[], rx?: number, ry?: number) {
    const length = path.length;
    let i = 0;
    while (i < length) {
        const seg = path[i++];
        if (seg.key.toUpperCase() === 'A') {
            if (rx !== undefined) {
                const offset = rx - <number> seg.radiusX;
                seg.radiusX = rx;
                seg.coordinates[0] = rx * 2 * (seg.coordinates[0] < 0 ? -1 : 1);
                if (i === 1) {
                    path[0].coordinates[0] -= offset;
                    path[0].end.x -= offset;
                }
            }
            if (ry !== undefined) {
                seg.radiusY = ry;
            }
        }
    }
}

export default class SvgPath extends SvgPaint$MX(SvgBaseVal$MX(SvgElement)) implements squared.svg.SvgPath {
    public static extrapolate(attr: string, pathData: string, values: string[], transforms?: SvgTransform[], companion?: SvgShape, precision?: number) {
        const parent = companion?.parent;
        const transformRefit = !!(transforms || parent?.requireRefit);
        const result: string[] = [];
        let commands: Undef<SvgPathCommand[]>;
        const length = values.length;
        for (let i = 0; i < length; i++) {
            if (attr === 'd') {
                result[i] = values[i];
            }
            else if (attr === 'points') {
                const points = SvgBuild.convertPoints(SvgBuild.parseCoordinates(values[i]));
                if (points.length) {
                    result[i] = companion && SVG.polygon(companion.element) ? SvgBuild.drawPolygon(points, precision) : SvgBuild.drawPolyline(points, precision);
                }
            }
            else if (pathData) {
                if (!commands) {
                    commands = SvgBuild.getPathCommands(pathData);
                }
                const value = parseFloat(values[i]);
                if (!isNaN(value)) {
                    const path = i < length - 1 ? <SvgPathCommand[]> cloneArray(commands, [], true) : commands;
                    switch (attr) {
                        case 'x':
                        case 'x1':
                        case 'x2':
                        case 'cx':
                            updatePathLocation(path, attr, value);
                            break;
                        case 'y':
                        case 'y1':
                        case 'y2':
                        case 'cy':
                            updatePathLocation(path, attr, undefined, value);
                            break;
                        case 'r':
                            updatePathRadius(path, value, value);
                            break;
                        case 'rx':
                            updatePathRadius(path, value);
                            break;
                        case 'ry':
                            updatePathRadius(path, undefined, value);
                            break;
                        case 'width':
                            [1, 2].forEach(index => {
                                const seg = path[index];
                                switch (seg.key) {
                                    case 'm':
                                    case 'l':
                                    case 'h':
                                        seg.coordinates[0] = value * (seg.coordinates[0] < 0 ? -1 : 1);
                                        break;
                                    case 'M':
                                    case 'L':
                                    case 'H':
                                        seg.coordinates[0] = path[0].end.x + value;
                                        break;
                                }
                            });
                            break;
                        case 'height':
                            [2, 3].forEach(index => {
                                const seg = path[index];
                                switch (seg.key) {
                                    case 'm':
                                    case 'l':
                                    case 'v':
                                        seg.coordinates[1] = value * (seg.coordinates[1] < 0 ? -1 : 1);
                                        break;
                                    case 'M':
                                    case 'L':
                                    case 'V':
                                        seg.coordinates[1] = path[0].end.y + value;
                                        break;
                                }
                            });
                            break;
                        default:
                            result[i] = '';
                            continue;
                    }
                    result[i] = SvgBuild.drawPath(path, precision);
                }
            }
            if (result[i]) {
                if (transformRefit) {
                    result[i] = SvgBuild.transformRefit(result[i], transforms, companion, parent, precision);
                }
            }
            else {
                result[i] = '';
            }
        }
        return result;
    }

    public name = '';
    public value = '';
    public baseValue = '';
    public transformed?: SvgTransform[];
    public transformResidual?: SvgTransform[][];

    private _transforms?: SvgTransform[];

    constructor(public readonly element: SVGGeometryElement) {
        super(element);
        this.init();
    }

    public build(options?: SvgBuildOptions) {
        let transforms: Undef<SvgTransform[]>;
        if (options?.transforms) {
            transforms = SvgBuild.filterTransforms(options.transforms, options.exclude?.[this.element.tagName]);
        }
        this.draw(transforms, options);
    }

    public draw(transforms?: SvgTransform[], options?: SvgBuildOptions) {
        let residual: Undef<SvgTransformResidual>;
        let precision: Undef<number>;
        if (options) {
            ({ residual, precision } = options);
        }
        const element = this.element;
        const parent = <SvgContainer> this.parent;
        const patternParent = <SvgShapePattern> this.patternParent;
        const requireRefit = parent?.requireRefit === true;
        const patternRefit = patternParent?.patternContentUnits === REGION_UNIT.OBJECT_BOUNDING_BOX;
        this.transformed = undefined;
        let d: string;
        if (SVG.path(element)) {
            d = this.getBaseValue('d');
            if (transforms?.length || requireRefit || patternRefit) {
                const commands = SvgBuild.getPathCommands(d);
                if (commands.length) {
                    let points = SvgBuild.getPathPoints(commands);
                    if (points.length) {
                        if (patternRefit) {
                            patternParent.patternRefitPoints(points);
                        }
                        if (transforms?.length) {
                            if (typeof residual === 'function') {
                                [this.transformResidual, transforms] = residual.call(this, element, transforms);
                            }
                            if (transforms.length) {
                                points = SvgBuild.applyTransforms(transforms, points, TRANSFORM.origin(this.element));
                                this.transformed = transforms;
                            }
                        }
                        this.baseValue = SvgBuild.drawPath(SvgBuild.syncPathPoints(requireRefit ? cloneArray(commands, [], true) : commands, requireRefit ? cloneArray(points, [], true) : points, !!this.transformed), precision);
                        if (requireRefit) {
                            parent.refitPoints(points);
                            d = SvgBuild.drawPath(SvgBuild.syncPathPoints(commands, points, !!this.transformed), precision);
                        }
                        else {
                            d = this.baseValue;
                        }
                    }
                }
            }
            if (this.baseValue === '') {
                this.baseValue = d;
            }
        }
        else if (SVG.line(element)) {
            let points: SvgPoint[] = [
                { x: this.getBaseValue('x1'), y: this.getBaseValue('y1') },
                { x: this.getBaseValue('x2'), y: this.getBaseValue('y2') }
            ];
            if (patternRefit) {
                patternParent.patternRefitPoints(points);
            }
            if (transforms?.length) {
                if (typeof residual === 'function') {
                    [this.transformResidual, transforms] = residual.call(this, element, transforms);
                }
                if (transforms.length) {
                    points = SvgBuild.applyTransforms(transforms, points, TRANSFORM.origin(this.element));
                    this.transformed = transforms;
                }
            }
            const drawPolyline = () => SvgBuild.drawPolyline(points, precision);
            this.baseValue = drawPolyline();
            if (requireRefit) {
                parent.refitPoints(points);
                d = drawPolyline();
            }
            else {
                d = this.baseValue;
            }
        }
        else if (SVG.circle(element) || SVG.ellipse(element)) {
            const x = this.getBaseValue('cx');
            const y = this.getBaseValue('cy');
            let rx: number;
            let ry: number;
            if (SVG.ellipse(element)) {
                rx = this.getBaseValue('rx');
                ry = this.getBaseValue('ry');
            }
            else {
                rx = this.getBaseValue('r');
                ry = rx;
            }
            let points: SvgPoint[] = [{ x, y, rx, ry }];
            if (patternRefit) {
                patternParent.patternRefitPoints(points);
            }
            if (transforms?.length) {
                if (typeof residual === 'function') {
                    [this.transformResidual, transforms] = residual.call(this, element, transforms, rx, ry);
                }
                if (transforms.length) {
                    points = SvgBuild.applyTransforms(transforms, points, TRANSFORM.origin(this.element));
                    this.transformed = transforms;
                }
            }
            const pt = <Required<SvgPoint>> points[0];
            const drawEllipse = () => SvgBuild.drawEllipse(pt.x, pt.y, pt.rx, pt.ry, precision);
            this.baseValue = drawEllipse();
            if (requireRefit) {
                parent.refitPoints(points);
                d = drawEllipse();
            }
            else {
                d = this.baseValue;
            }
        }
        else if (SVG.rect(element)) {
            let x = this.getBaseValue('x');
            let y = this.getBaseValue('y');
            let width = this.getBaseValue('width');
            let height = this.getBaseValue('height');
            if (requireRefit || transforms?.length) {
                let points: SvgPoint[] = [
                    { x, y },
                    { x: x + width, y },
                    { x: x + width, y: y + height },
                    { x, y: y + height }
                ];
                if (patternRefit) {
                    patternParent.patternRefitPoints(points);
                }
                if (transforms?.length) {
                    if (typeof residual === 'function') {
                        [this.transformResidual, transforms] = residual.call(this, element, transforms);
                    }
                    if (transforms.length) {
                        points = SvgBuild.applyTransforms(transforms, points, TRANSFORM.origin(this.element));
                        this.transformed = transforms;
                    }
                }
                this.baseValue = SvgBuild.drawPolygon(points, precision);
                if (requireRefit) {
                    parent.refitPoints(points);
                    d = SvgBuild.drawPolygon(points, precision);
                }
                else {
                    d = this.baseValue;
                }
            }
            else {
                if (patternRefit) {
                    x = patternParent.patternRefitX(x);
                    y = patternParent.patternRefitY(y);
                    width = patternParent.patternRefitX(width);
                    height = patternParent.patternRefitY(height);
                }
                d = SvgBuild.drawRect(width, height, x, y, precision);
                this.baseValue = d;
            }
        }
        else if (SVG.polygon(element) || SVG.polyline(element)) {
            let points: SvgPoint[] = this.getBaseValue('points');
            if (patternRefit) {
                patternParent.patternRefitPoints(points);
            }
            if (transforms?.length) {
                if (typeof residual === 'function') {
                    [this.transformResidual, transforms] = residual.call(this, element, transforms);
                }
                if (transforms.length) {
                    points = SvgBuild.applyTransforms(transforms, points, TRANSFORM.origin(this.element));
                    this.transformed = transforms;
                }
            }
            const drawPolygon = () => SVG.polygon(element) ? SvgBuild.drawPolygon(points, precision) : SvgBuild.drawPolyline(points, precision);
            this.baseValue = drawPolygon();
            if (requireRefit) {
                if (this.transformed === null) {
                    points = SvgBuild.clonePoints(points);
                }
                parent.refitPoints(points);
                d = drawPolygon();
            }
            else {
                d = this.baseValue;
            }
        }
        else {
            d = '';
        }
        this.value = d;
        this.setPaint([d], precision);
        return d;
    }

    public extendLength(data: SvgPathExtendData, precision?: number) {
        if (this.value !== '') {
            switch (this.element.tagName) {
                case 'path':
                case 'line':
                case 'polyline': {
                    const commands = SvgBuild.getPathCommands(this.value);
                    const length = commands.length;
                    if (length) {
                        const pathStart = commands[0];
                        const pathStartPoint = pathStart.start;
                        const pathEnd = commands[length - 1];
                        const pathEndPoint = pathEnd.end;
                        const name = pathEnd.key.toUpperCase();
                        const { leading, trailing } = data;
                        let modified = false;
                        if (name !== 'Z' && (pathStartPoint.x !== pathEndPoint.x || pathStartPoint.y !== pathEndPoint.y)) {
                            if (leading > 0) {
                                let afterStartPoint: Undef<SvgPoint>;
                                if (pathStart.value.length > 1) {
                                    afterStartPoint = pathStart.value[1];
                                }
                                else if (length > 1) {
                                    afterStartPoint = commands[1].start;
                                }
                                if (afterStartPoint) {
                                    const coordinates = pathStart.coordinates;
                                    if (afterStartPoint.x === pathStartPoint.x) {
                                        coordinates[1] += pathStartPoint.y > afterStartPoint.y ? leading : -leading;
                                        modified = true;
                                    }
                                    else if (afterStartPoint.y === pathStartPoint.y) {
                                        coordinates[0] += pathStartPoint.x > afterStartPoint.x ? leading : -leading;
                                        modified = true;
                                    }
                                    else {
                                        const angle = relativeAngle(afterStartPoint, pathStartPoint);
                                        coordinates[0] -= offsetAngleX(angle, leading);
                                        coordinates[1] -= offsetAngleY(angle, leading);
                                        modified = true;
                                    }
                                }
                            }
                            switch (name) {
                                case 'M':
                                case 'L': {
                                    if (trailing > 0) {
                                        let beforeEndPoint: Undef<SvgPoint>;
                                        if (length === 1) {
                                            const startValue = pathStart.value;
                                            if (startValue.length > 1) {
                                                beforeEndPoint = startValue[startValue.length - 2];
                                            }
                                        }
                                        else {
                                            const endValue = pathEnd.value;
                                            if (endValue.length > 1) {
                                                beforeEndPoint = endValue[endValue.length - 2];
                                            }
                                            else {
                                                beforeEndPoint = commands[commands.length - 2].end;
                                            }
                                        }
                                        if (beforeEndPoint) {
                                            const coordinates = pathEnd.coordinates;
                                            if (beforeEndPoint.x === pathEndPoint.x) {
                                                coordinates[1] += pathEndPoint.y > beforeEndPoint.y ? trailing : -trailing;
                                                modified = true;
                                            }
                                            else if (beforeEndPoint.y === pathEndPoint.y) {
                                                coordinates[0] += pathEndPoint.x > beforeEndPoint.x ? trailing : -trailing;
                                                modified = true;
                                            }
                                            else {
                                                const angle = relativeAngle(beforeEndPoint, pathEndPoint);
                                                coordinates[0] += offsetAngleX(angle, trailing);
                                                coordinates[1] += offsetAngleY(angle, trailing);
                                                modified = true;
                                            }
                                        }
                                    }
                                    break;
                                }
                                case 'H':
                                case 'V': {
                                    const coordinates = pathEnd.coordinates;
                                    const index = name === 'H' ? 0 : 1;
                                    coordinates[index] += (leading + trailing) * (coordinates[index] >= 0 ? 1 : -1);
                                    modified = true;
                                    break;
                                }
                            }
                        }
                        if (modified) {
                            data.leading = leading;
                            data.trailing = trailing;
                            data.path = SvgBuild.drawPath(commands, precision);
                            return data;
                        }
                        break;
                    }
                }
            }
        }
        return undefined;
    }

    public flattenStrokeDash(valueArray: number[], valueOffset: number, totalLength: number, pathLength?: number, data?: SvgPathExtendData) {
        if (!pathLength) {
            pathLength = totalLength;
        }
        let arrayLength: number;
        let dashArray: number[];
        let dashArrayTotal: number;
        let extendedLength: number;
        let j = 0;
        const getDash = (index: number) => dashArray[index % arrayLength];
        if (data) {
            ({ dashArray, dashArrayTotal, extendedLength, startIndex: j } = data);
            arrayLength = dashArray.length;
            data.items = [];
            data.leading = 0;
        }
        else {
            arrayLength = valueArray.length;
            dashArray = valueArray.slice(0);
            const dashLength = multipleOf([2, arrayLength]);
            dashArrayTotal = 0;
            let i = 0;
            while (i < dashLength) {
                const value = valueArray[i % arrayLength];
                dashArrayTotal += value;
                if (i++ >= arrayLength) {
                    dashArray.push(value);
                }
            }
            arrayLength = dashLength;
            if (valueOffset > 0) {
                let length = getDash(0);
                while (valueOffset - length >= 0) {
                    valueOffset -= length;
                    length = getDash(++j);
                }
                j %= arrayLength;
            }
            else if (valueOffset < 0) {
                dashArray.reverse();
                while (valueOffset < 0) {
                    valueOffset += getDash(j++);
                }
                j = arrayLength - (j % arrayLength);
                dashArray.reverse();
            }
            extendedLength = pathLength;
            data = {
                dashArray,
                dashArrayTotal,
                items: [],
                leading: 0,
                trailing: 0,
                startIndex: j,
                extendedLength,
                lengthRatio: totalLength / (pathLength || totalLength)
            };
        }
        let dashTotal = 0;
        let end: number;
        for (let i = 0, length = 0; ; i += length, j++) {
            length = getDash(j);
            let startOffset: number;
            let actualLength: number;
            if (i < valueOffset) {
                data.leading = valueOffset - i;
                startOffset = 0;
                actualLength = length - data.leading;
            }
            else {
                startOffset = i - valueOffset;
                actualLength = length;
            }
            const start = truncateFraction(startOffset / extendedLength);
            end = truncateFraction(start + (actualLength / extendedLength));
            if (j % 2 === 0) {
                if (start < 1) {
                    data.items.push({
                        start,
                        end: Math.min(end, 1),
                        length
                    });
                    dashTotal += length;
                }
            }
            else {
                dashTotal += length;
            }
            if (end >= 1) {
                break;
            }
        }
        data.trailing = truncateFraction((end - 1) * extendedLength);
        while (dashTotal % dashArrayTotal !== 0) {
            const value = getDash(++j);
            data.trailing += value;
            dashTotal += value;
        }
        if (data.items.length === 0) {
            data.items.push({ start: 1, end: 1 });
        }
        else {
            data.leadingOffset = truncateFraction(data.items[0].start * extendedLength);
            data.leading *= data.lengthRatio;
            data.trailing *= data.lengthRatio;
        }
        return data;
    }

    public extractStrokeDash(animations?: SvgAnimation[], precision?: number): [Undef<SvgAnimation[]>, Undef<SvgStrokeDash[]>, string, string] {
        const strokeWidth = convertInt(this.strokeWidth);
        let result: Undef<SvgStrokeDash[]>;
        let path = '';
        let clipPath = '';
        if (strokeWidth > 0) {
            let valueArray = SvgBuild.parseCoordinates(this.strokeDasharray);
            if (valueArray.length) {
                const totalLength = this.totalLength;
                const pathLength =  this.pathLength || totalLength;
                const dashGroup: DashGroup[] = [];
                let valueOffset = convertInt(this.strokeDashoffset);
                let dashTotal = 0;
                let flattenData!: SvgPathExtendData;
                const createDashGroup = (values: number[], offset: number, delay: number, duration = 0) => {
                    const data = this.flattenStrokeDash(values, offset, totalLength, pathLength);
                    if (dashGroup.length === 0) {
                        flattenData = data;
                    }
                    dashTotal = Math.max(dashTotal, data.items.length);
                    dashGroup.push({ items: data.items, delay, duration });
                    return data.items;
                };
                result = createDashGroup(valueArray, valueOffset, 0);
                if (animations) {
                    const sorted = animations.slice(0).sort((a, b) => {
                        if (a.attributeName.startsWith('stroke-dash') && b.attributeName.startsWith('stroke-dash')) {
                            if (a.delay !== b.delay) {
                                return a.delay < b.delay ? -1 : 1;
                            }
                            else if (SvgBuild.asSet(a) && SvgBuild.asAnimate(b) || !a.animationElement && b.animationElement) {
                                return -1;
                            }
                            else if (SvgBuild.asAnimate(a) && SvgBuild.asSet(b) || a.animationElement && !b.animationElement) {
                                return 1;
                            }
                        }
                        return 0;
                    });
                    const intervalMap = new SvgAnimationIntervalMap(sorted, 'stroke-dasharray', 'stroke-dashoffset');
                    const getDashOffset = (time: number, playing = false) => {
                        const value = intervalMap.get('stroke-dashoffset', time, playing);
                        return value ? parseFloat(value) : valueOffset;
                    };
                    const getDashArray = (time: number, playing = false) => {
                        const value = intervalMap.get('stroke-dasharray', time, playing);
                        return value ? SvgBuild.parseCoordinates(value) : valueArray;
                    };
                    const getFromToValue = (item?: SvgStrokeDash) => item ? item.start + ' ' + item.end : '1 1';
                    if (sorted.length > 1) {
                        for (let i = 0; i < sorted.length; ++i) {
                            const item = sorted[i];
                            if (!intervalMap.has(item.attributeName, item.delay, item)) {
                                sorted.splice(i--, 1);
                            }
                        }
                    }
                    let setDashLength: Undef<(index: number) => void> = (index: number) => {
                        let offset = valueOffset;
                        const length = sorted.length;
                        let j = index;
                        while (j < length) {
                            const item = sorted[j++];
                            if (item.attributeName === 'stroke-dasharray') {
                                const value = intervalMap.get('stroke-dashoffset', item.delay);
                                if (value) {
                                    offset = parseFloat(value);
                                }
                                for (const array of (SvgBuild.asAnimate(item) ? intervalMap.evaluateStart(item) : [item.to])) {
                                    dashTotal = Math.max(dashTotal, this.flattenStrokeDash(SvgBuild.parseCoordinates(array), offset, totalLength, pathLength).items.length);
                                }
                                (SvgBuild.asAnimate(item) ? intervalMap.evaluateStart(item) : [item.to]).forEach(array => dashTotal = Math.max(dashTotal, this.flattenStrokeDash(SvgBuild.parseCoordinates(array), offset, totalLength, pathLength).items.length));
                            }
                        }
                    };
                    let extracted: SvgAnimation[] = [];
                    let modified = false;
                    for (let i = 0; i < sorted.length; i++) {
                        const item = sorted[i];
                        if (item.setterType) {
                            const setDashGroup = (values: number[], offset: number) => {
                                createDashGroup(values, offset, item.delay, item.fillReplace && item.duration > 0 ? item.duration : 0);
                                modified = true;
                            };
                            switch (item.attributeName) {
                                case 'stroke-dasharray':
                                    valueArray = SvgBuild.parseCoordinates(item.to);
                                    setDashGroup(valueArray, getDashOffset(item.delay));
                                    continue;
                                case 'stroke-dashoffset':
                                    valueOffset = convertInt(item.to);
                                    setDashGroup(getDashArray(item.delay), valueOffset);
                                    continue;
                            }
                        }
                        else if (SvgBuild.asAnimate(item) && item.playable) {
                            intervalMap.evaluateStart(item);
                            switch (item.attributeName) {
                                case 'stroke-dasharray': {
                                    if (setDashLength) {
                                        setDashLength(i);
                                        setDashLength = undefined;
                                    }
                                    const delayOffset = getDashOffset(item.delay);
                                    const baseValue = this.flattenStrokeDash(getDashArray(item.delay), delayOffset, totalLength, pathLength).items;
                                    const group: SvgAnimate[] = [];
                                    const values: string[][] = [];
                                    let j = 0;
                                    while (j < dashTotal) {
                                        const animate = new SvgAnimate(this.element);
                                        animate.id = j;
                                        animate.baseValue = getFromToValue(baseValue[j]);
                                        animate.attributeName = 'stroke-dasharray';
                                        animate.delay = item.delay;
                                        animate.duration = item.duration;
                                        animate.iterationCount = item.iterationCount;
                                        animate.fillMode = item.fillMode;
                                        values[j++] = [];
                                        group.push(animate);
                                    }
                                    item.values.forEach(value => {
                                        const dashValue = this.flattenStrokeDash(SvgBuild.parseCoordinates(value), delayOffset, totalLength, pathLength).items;
                                        let k = 0;
                                        while (k < dashTotal) {
                                            values[k].push(getFromToValue(dashValue[k++]));
                                        }
                                    });
                                    const { keyTimes, keySplines } = item;
                                    const timingFunction = item.timingFunction;
                                    j = 0;
                                    while (j < dashTotal) {
                                        const data = group[j];
                                        data.values = values[j++];
                                        data.keyTimes = keyTimes;
                                        if (keySplines) {
                                            data.keySplines = keySplines;
                                        }
                                        else if (timingFunction) {
                                            data.timingFunction = timingFunction;
                                        }
                                    }
                                    if (item.fillReplace) {
                                        const totalDuration = item.getTotalDuration();
                                        const replaceValue = this.flattenStrokeDash(getDashArray(totalDuration), getDashOffset(totalDuration), totalLength, pathLength).items;
                                        j = 0;
                                        while (j < dashTotal) {
                                            group[j].replaceValue = getFromToValue(replaceValue[j++]);
                                        }
                                    }
                                    extracted = extracted.concat(group);
                                    modified = true;
                                    continue;
                                }
                                case 'stroke-dashoffset': {
                                    const duration = item.duration;
                                    const startOffset = parseFloat(item.values[0]);
                                    const values: string[] = [];
                                    const keyTimes: number[] = [];
                                    let keyTime = 0;
                                    let previousRemaining = 0;
                                    if (valueOffset !== startOffset && item.delay === 0 && !item.fillReplace) {
                                        flattenData = this.flattenStrokeDash(flattenData.dashArray, startOffset, totalLength, pathLength);
                                        result = flattenData.items;
                                        dashGroup[0].items = result;
                                        dashTotal = Math.max(dashTotal, flattenData.items.length);
                                        valueOffset = startOffset;
                                    }
                                    let extendedLength = totalLength;
                                    let extendedRatio = 1;
                                    if (flattenData.leading > 0 || flattenData.trailing > 0) {
                                        this.extendLength(flattenData, precision);
                                        if (flattenData.path) {
                                            const boxRect = SvgBuild.getBoxRect([this.value]);
                                            extendedLength = truncateFraction(getPathLength(flattenData.path));
                                            extendedRatio = extendedLength / totalLength;
                                            flattenData.extendedLength = this.pathLength;
                                            if (flattenData.extendedLength > 0) {
                                                flattenData.extendedLength *= extendedRatio;
                                            }
                                            else {
                                                flattenData.extendedLength = extendedLength;
                                            }
                                            const data = this.flattenStrokeDash(flattenData.dashArray, 0, totalLength, pathLength, flattenData);
                                            result = data.items;
                                            dashGroup[0].items = result;
                                            dashTotal = Math.max(dashTotal, result.length);
                                            const strokeOffset = Math.ceil(strokeWidth / 2);
                                            path = flattenData.path;
                                            clipPath = SvgBuild.drawRect(boxRect.right - boxRect.left, boxRect.bottom - boxRect.top + strokeOffset * 2, boxRect.left, boxRect.top - strokeOffset);
                                        }
                                    }
                                    let replaceValue: Undef<string>;
                                    if (item.fillReplace && item.iterationCount !== -1) {
                                        const offsetForward = convertFloat(intervalMap.get(item.attributeName, item.getTotalDuration()) as string);
                                        if (offsetForward !== valueOffset) {
                                            let offsetReplace = (Math.abs(offsetForward - valueOffset) % extendedLength) / extendedLength;
                                            if (offsetForward > valueOffset) {
                                                offsetReplace = 1 - offsetReplace;
                                            }
                                            replaceValue = offsetReplace.toString();
                                        }
                                    }
                                    const keyTimesBase = item.keyTimes;
                                    const valuesBase = item.values;
                                    const length = keyTimesBase.length;
                                    let j = -1;
                                    while (++j < length) {
                                        const offsetFrom = j === 0 ? valueOffset : parseFloat(valuesBase[j - 1]);
                                        const offsetTo = parseFloat(valuesBase[j]);
                                        const offsetValue = Math.abs(offsetTo - offsetFrom);
                                        const keyTimeTo = keyTimesBase[j];
                                        if (offsetValue === 0) {
                                            if (j > 0) {
                                                keyTime = keyTimeTo;
                                                keyTimes.push(keyTime);
                                                const q = values.length;
                                                if (q) {
                                                    values.push(values[q - 1]);
                                                    previousRemaining = parseFloat(values[q - 1]);
                                                }
                                                else {
                                                    values.push('0');
                                                    previousRemaining = 0;
                                                }
                                            }
                                            continue;
                                        }
                                        const increasing = offsetTo > offsetFrom;
                                        const segDuration = j > 0 ? (keyTimeTo - keyTimesBase[j - 1]) * duration : 0;
                                        const offsetTotal = offsetValue * flattenData.lengthRatio;
                                        let iterationTotal = offsetTotal / extendedLength;
                                        let offsetRemaining = offsetTotal;
                                        let finalValue = 0;
                                        const getKeyTimeIncrement = (offset: number) => ((offset / offsetTotal) * segDuration) / duration;
                                        const isDuplicateFraction = () => j > 0 && values[values.length - 1] === (increasing ? '1' : '0');
                                        const setFinalValue = (offset: number, checkInvert = false) => {
                                            finalValue = (offsetRemaining - offset) / extendedLength;
                                            if (checkInvert) {
                                                const value = truncateFraction(finalValue);
                                                if (increasing) {
                                                    if (value > 0) {
                                                        finalValue = 1 - finalValue;
                                                    }
                                                }
                                                else {
                                                    if (value === 0) {
                                                        finalValue = 1;
                                                    }
                                                }
                                            }
                                        };
                                        const insertFractionKeyTime = () => {
                                            if (!isDuplicateFraction()) {
                                                keyTimes.push(keyTime === 0 ? 0 : truncateFraction(keyTime));
                                                values.push(increasing ? '1' : '0');
                                            }
                                        };
                                        const insertFinalKeyTime = () => {
                                            keyTime = keyTimeTo;
                                            keyTimes.push(keyTime);
                                            const value = truncateFraction(finalValue);
                                            values.push(value.toString());
                                            previousRemaining = value > 0 && value < 1 ? finalValue : 0;
                                        };
                                        if (j === 0) {
                                            offsetRemaining %= extendedLength;
                                            setFinalValue(0);
                                            if (increasing) {
                                                finalValue = 1 - finalValue;
                                            }
                                            insertFinalKeyTime();
                                        }
                                        else {
                                            if (previousRemaining > 0) {
                                                const remaining = increasing ? previousRemaining : 1 - previousRemaining;
                                                const remainingValue = truncateFraction(remaining * extendedLength);
                                                if (lessEqual(offsetRemaining, remainingValue)) {
                                                    setFinalValue(0);
                                                    if (increasing) {
                                                        finalValue = previousRemaining - finalValue;
                                                    }
                                                    else {
                                                        finalValue += previousRemaining;
                                                    }
                                                    insertFinalKeyTime();
                                                    continue;
                                                }
                                                else {
                                                    values.push(increasing ? '0' : '1');
                                                    keyTime += getKeyTimeIncrement(remainingValue);
                                                    keyTimes.push(truncateFraction(keyTime));
                                                    iterationTotal = truncateFraction(iterationTotal - remaining);
                                                    offsetRemaining = truncateFraction(offsetRemaining - remainingValue);
                                                }
                                            }
                                            if (equal(offsetRemaining, extendedLength)) {
                                                offsetRemaining = extendedLength;
                                            }
                                            if (offsetRemaining > extendedLength) {
                                                iterationTotal = Math.floor(iterationTotal);
                                                const iterationOffset = iterationTotal * extendedLength;
                                                if (iterationOffset === offsetRemaining) {
                                                    iterationTotal--;
                                                }
                                                setFinalValue(iterationOffset, true);
                                            }
                                            else {
                                                iterationTotal = 0;
                                                setFinalValue(0, true);
                                            }
                                            while (iterationTotal > 0) {
                                                insertFractionKeyTime();
                                                values.push(increasing ? '0' : '1');
                                                keyTime += getKeyTimeIncrement(extendedLength);
                                                keyTimes.push(truncateFraction(keyTime));
                                                iterationTotal--;
                                            }
                                            insertFractionKeyTime();
                                            insertFinalKeyTime();
                                        }
                                    }
                                    item.baseValue = '0';
                                    item.replaceValue = replaceValue;
                                    item.values = values;
                                    item.keyTimes = keyTimes;
                                    const timingFunction = item.timingFunction;
                                    if (timingFunction) {
                                        item.keySplines = undefined;
                                        item.timingFunction = timingFunction;
                                    }
                                    modified = true;
                                    break;
                                }
                            }
                        }
                        extracted.push(item);
                    }
                    if (modified) {
                        const length = dashGroup.length;
                        let i = 0;
                        while (i < length) {
                            const { delay, duration, items } = dashGroup[i++];
                            if (items === result) {
                                let j = items.length - 1;
                                while (++j < dashTotal) {
                                    items.push({ start: 1, end: 1 });
                                }
                            }
                            else {
                                const baseValue = length > 2 ? this.flattenStrokeDash(getDashArray(delay - 1), getDashOffset(delay - 1), totalLength, pathLength).items : result;
                                let j = 0;
                                while (j < dashTotal) {
                                    const animate = new SvgAnimation(this.element);
                                    animate.id = j;
                                    animate.attributeName = 'stroke-dasharray';
                                    animate.baseValue = getFromToValue(baseValue[j]);
                                    animate.delay = delay;
                                    animate.duration = duration;
                                    animate.fillFreeze = duration === 0;
                                    animate.to = getFromToValue(items[j++]);
                                    extracted.push(animate);
                                }
                            }
                        }
                        animations = extracted;
                    }
                }
            }
        }
        return [animations, result, path, clipPath];
    }

    protected init() {
        const element = this.element;
        if (SVG.path(element)) {
            this.setBaseValue('d');
        }
        else if (SVG.line(element)) {
            this.setBaseValue('x1');
            this.setBaseValue('y1');
            this.setBaseValue('x2');
            this.setBaseValue('y2');
        }
        else if (SVG.rect(element)) {
            this.setBaseValue('x');
            this.setBaseValue('y');
            this.setBaseValue('width');
            this.setBaseValue('height');
        }
        else if (SVG.circle(element)) {
            this.setBaseValue('cx');
            this.setBaseValue('cy');
            this.setBaseValue('r');
        }
        else if (SVG.ellipse(element)) {
            this.setBaseValue('cx');
            this.setBaseValue('cy');
            this.setBaseValue('rx');
            this.setBaseValue('ry');
        }
        else if (SVG.polygon(element) || SVG.polyline(element)) {
            this.setBaseValue('points', SvgBuild.clonePoints(element.points));
        }
    }

    get transforms() {
        let result = this._transforms;
        if (result === undefined) {
            result = SvgBuild.filterTransforms(TRANSFORM.parse(this.element) || SvgBuild.convertTransforms(this.element.transform.baseVal));
            this._transforms = result;
        }
        return result;
    }

    get pathLength() {
        return convertFloat(getNamedItem(this.element, 'pathLength'));
    }

    get totalLength() {
        return this.element.getTotalLength();
    }

    get instanceType() {
        return INSTANCE_TYPE.SVG_PATH;
    }
}