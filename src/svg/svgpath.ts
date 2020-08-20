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

const { getNamedItem } = squared.lib.dom;
const { equal, lessEqual, multipleOf, offsetAngleX, offsetAngleY, relativeAngle, truncateFraction } = squared.lib.math;
const { cloneArray, convertInt, convertFloat } = squared.lib.util;

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
    for (let i = 0, length = path.length; i < length; ++i) {
        const seg = path[i];
        const { coordinates, value } = seg;
        for (let j = 0, k = 0, q = coordinates.length; j < q; j += 2, ++k) {
            if (x !== undefined) {
                if (!seg.relative) {
                    coordinates[j] += x;
                }
                value[k].x += x;
            }
            if (y !== undefined) {
                if (!seg.relative) {
                    coordinates[j + 1] += y;
                }
                value[k].y += y;
            }
        }
    }
}

function updatePathRadius(path: SvgPathCommand[], rx?: number, ry?: number) {
    for (let i = 0, length = path.length; i < length; ++i) {
        const seg = path[i];
        if (seg.key.toUpperCase() === 'A') {
            if (rx !== undefined) {
                const offset = rx - seg.radiusX!;
                const x = rx * 2 * (seg.coordinates[0] < 0 ? -1 : 1);
                seg.radiusX = rx;
                seg.coordinates[0] = x;
                seg.start.x = x;
                seg.end.x = x;
                if (i === 1) {
                    const first = path[0];
                    first.coordinates[0] -= offset;
                    first.start.x -= offset;
                    first.end.x -= offset;
                }
            }
            if (ry !== undefined) {
                seg.radiusY = ry;
            }
        }
    }
}

function getDashOffset(map: SvgAnimationIntervalMap, valueOffset: number, time: number, playing?: boolean) {
    const value = map.get('stroke-dashoffset', time, playing);
    return value ? parseFloat(value) : valueOffset;
}

function getDashArray(map: SvgAnimationIntervalMap, valueArray: number[], time: number, playing?: boolean) {
    const value = map.get('stroke-dasharray', time, playing);
    return value ? SvgBuild.parseCoordinates(value) : valueArray;
}

const getFromToValue = (item?: SvgStrokeDash) => item ? item.start + ' ' + item.end : '1 1';

export default class SvgPath extends SvgPaint$MX(SvgBaseVal$MX(SvgElement)) implements squared.svg.SvgPath {
    public static extrapolate(attr: string, pathData: string, values: string[], transforms?: Null<SvgTransform[]>, parent?: SvgShape, precision?: number) {
        const container = parent && parent.parent;
        const transformRefit = !!transforms || !!container && container.requireRefit;
        const result: string[] = [];
        let commands: Undef<SvgPathCommand[]>;
        for (let i = 0, length = values.length; i < length; ++i) {
            if (attr === 'd') {
                result[i] = values[i];
            }
            else if (attr === 'points') {
                const points = SvgBuild.convertPoints(SvgBuild.parseCoordinates(values[i]));
                if (points.length > 0) {
                    result[i] = parent && SVG.polygon(parent.element) ? SvgBuild.drawPolygon(points, precision) : SvgBuild.drawPolyline(points, precision);
                }
            }
            else if (pathData) {
                if (!commands) {
                    commands = SvgBuild.toPathCommands(pathData);
                }
                const value = parseFloat(values[i]);
                if (!isNaN(value)) {
                    const path = i < length - 1 ? cloneArray(commands, [], true) as SvgPathCommand[] : commands;
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
                            for (const index of [1, 2]) {
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
                            }
                            break;
                        case 'height':
                            for (const index of [2, 3]) {
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
                            }
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
                    result[i] = SvgBuild.transformRefit(result[i], { transforms, parent, container, precision });
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
    public transformed?: Null<SvgTransform[]>;
    public transformResidual?: SvgTransform[][];

    private _transforms?: SvgTransform[];

    constructor(public readonly element: SVGGeometryElement) {
        super(element);
        this.init();
    }

    public build(options?: SvgBuildOptions) {
        this.draw(options && options.transforms ? SvgBuild.filterTransforms(options.transforms, options.exclude?.[this.element.tagName]) : undefined, options);
    }

    public draw(transforms?: SvgTransform[], options?: SvgBuildOptions) {
        let residualHandler: Undef<SvgTransformResidualHandler>,
            precision: Undef<number>;
        if (options) {
            ({ residualHandler, precision } = options);
        }
        const element = this.element;
        const parent = this.parent as SvgContainer;
        const patternParent = this.patternParent as SvgShapePattern;
        const requireRefit = parent ? parent.requireRefit : false;
        const patternRefit = patternParent ? patternParent.patternContentUnits === REGION_UNIT.OBJECT_BOUNDING_BOX : false;
        this.transformed = null;
        let d: string;
        if (SVG.path(element)) {
            d = this.getBaseValue<string>('d')!;
            if (transforms && transforms.length > 0 || requireRefit || patternRefit) {
                const commands = SvgBuild.toPathCommands(d);
                if (commands.length > 0) {
                    let points = SvgBuild.toPathPoints(commands);
                    if (points.length > 0) {
                        if (patternRefit) {
                            patternParent.patternRefitPoints(points);
                        }
                        if (transforms && transforms.length > 0) {
                            if (typeof residualHandler === 'function') {
                                [this.transformResidual, transforms] = residualHandler.call(this, element, transforms);
                            }
                            if (transforms.length > 0) {
                                points = SvgBuild.applyTransforms(transforms, points, TRANSFORM.origin(this.element));
                                this.transformed = transforms;
                            }
                        }
                        this.baseValue = SvgBuild.drawPath(SvgBuild.syncPath(requireRefit ? cloneArray(commands, [], true) : commands, requireRefit ? cloneArray(points, [], true) : points, !!this.transformed), precision);
                        if (requireRefit) {
                            parent.refitPoints(points);
                            d = SvgBuild.drawPath(SvgBuild.syncPath(commands, points, !!this.transformed), precision);
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
                { x: this.getBaseValue<number>('x1')!, y: this.getBaseValue<number>('y1')! },
                { x: this.getBaseValue<number>('x2')!, y: this.getBaseValue<number>('y2')! }
            ];
            if (patternRefit) {
                patternParent.patternRefitPoints(points);
            }
            if (transforms && transforms.length > 0) {
                if (typeof residualHandler === 'function') {
                    [this.transformResidual, transforms] = residualHandler.call(this, element, transforms);
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
            const x = this.getBaseValue<number>('cx')!;
            const y = this.getBaseValue<number>('cy')!;
            let rx: number,
                ry: number;
            if (SVG.ellipse(element)) {
                rx = this.getBaseValue<number>('rx')!;
                ry = this.getBaseValue<number>('ry')!;
            }
            else {
                rx = this.getBaseValue<number>('r')!;
                ry = rx;
            }
            let points: SvgPoint[] = [{ x, y, rx, ry }];
            if (patternRefit) {
                patternParent.patternRefitPoints(points);
            }
            if (transforms && transforms.length > 0) {
                if (typeof residualHandler === 'function') {
                    [this.transformResidual, transforms] = residualHandler.call(this, element, transforms, rx, ry);
                }
                if (transforms.length > 0) {
                    points = SvgBuild.applyTransforms(transforms, points, TRANSFORM.origin(this.element));
                    this.transformed = transforms;
                }
            }
            const pt = points[0] as Required<SvgPoint>;
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
            let x = this.getBaseValue<number>('x')!,
                y = this.getBaseValue<number>('y')!,
                width = this.getBaseValue<number>('width')!,
                height = this.getBaseValue<number>('height')!;
            if (requireRefit || transforms && transforms.length > 0) {
                let points: SvgPoint[] = [
                    { x, y },
                    { x: x + width, y },
                    { x: x + width, y: y + height },
                    { x, y: y + height }
                ];
                if (patternRefit) {
                    patternParent.patternRefitPoints(points);
                }
                if (transforms && transforms.length > 0) {
                    if (typeof residualHandler === 'function') {
                        [this.transformResidual, transforms] = residualHandler.call(this, element, transforms);
                    }
                    if (transforms.length > 0) {
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
            let points = this.getBaseValue<SvgPoint[]>('points')!;
            if (patternRefit) {
                patternParent.patternRefitPoints(points);
            }
            if (transforms && transforms.length > 0) {
                if (typeof residualHandler === 'function') {
                    [this.transformResidual, transforms] = residualHandler.call(this, element, transforms);
                }
                if (transforms.length > 0) {
                    points = SvgBuild.applyTransforms(transforms, points, TRANSFORM.origin(this.element));
                    this.transformed = transforms;
                }
            }
            const drawPolygon = () => SVG.polygon(element) ? SvgBuild.drawPolygon(points, precision) : SvgBuild.drawPolyline(points, precision);
            this.baseValue = drawPolygon();
            if (requireRefit) {
                if (!this.transformed) {
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
                    const commands = SvgBuild.toPathCommands(this.value);
                    const length = commands.length;
                    if (length > 0) {
                        const pathStart = commands[0];
                        const pathStartPoint = pathStart.start;
                        const pathEnd = commands[length - 1];
                        const pathEndPoint = pathEnd.end;
                        const name = pathEnd.key.toUpperCase();
                        const { leading, trailing } = data;
                        let modified: Undef<boolean>;
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
                                case 'L':
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
    }

    public flattenStrokeDash(valueArray: number[], valueOffset: number, totalLength: number, pathLength?: number, data?: SvgPathExtendData) {
        if (!pathLength) {
            pathLength = totalLength;
        }
        let dashTotal = 0,
            dashArray: number[],
            arrayLength: number,
            dashArrayTotal: number,
            extendedLength: number,
            end: number,
            j = 0;
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
            for (let i = 0; i < dashLength; ++i) {
                const value = valueArray[i % arrayLength];
                dashArrayTotal += value;
                if (i >= arrayLength) {
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
        for (let i = 0, length = 0; ; i += length, ++j) {
            length = getDash(j);
            let startOffset: number,
                actualLength: number;
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
        let path = '',
            clipPath = '',
            result: Undef<SvgStrokeDash[]>;
        if (strokeWidth > 0) {
            let valueArray = SvgBuild.parseCoordinates(this.strokeDasharray);
            if (valueArray.length > 0) {
                const totalLength = this.totalLength;
                const pathLength = this.pathLength || totalLength;
                const dashGroup: DashGroup[] = [];
                let valueOffset = convertInt(this.strokeDashoffset),
                    dashTotal = 0,
                    flattenData!: SvgPathExtendData;
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
                    const setDashLength: Undef<(index: number) => void> = (index: number) => {
                        let offset = valueOffset;
                        for (let j = index, length = sorted.length; j < length; ++j) {
                            const item = sorted[j];
                            if (item.attributeName === 'stroke-dasharray') {
                                const value = intervalMap.get('stroke-dashoffset', item.delay);
                                if (value) {
                                    offset = parseFloat(value);
                                }
                                for (const array of SvgBuild.asAnimate(item) ? intervalMap.evaluateStart(item) : [item.to]) {
                                    dashTotal = Math.max(dashTotal, this.flattenStrokeDash(SvgBuild.parseCoordinates(array), offset, totalLength, pathLength).items.length);
                                }
                            }
                        }
                    };
                    let extracted: SvgAnimation[] = [],
                        initialized: Undef<boolean>,
                        modified: Undef<boolean>;
                    if (sorted.length > 1) {
                        for (let i = 0; i < sorted.length; ++i) {
                            const item = sorted[i];
                            if (!intervalMap.has(item.attributeName, item.delay, item)) {
                                sorted.splice(i--, 1);
                            }
                        }
                    }
                    for (let i = 0; i < sorted.length; ++i) {
                        const item = sorted[i];
                        if (item.setterType) {
                            const setDashGroup = (values: number[], offset: number) => {
                                createDashGroup(values, offset, item.delay, item.fillReplace && item.duration > 0 ? item.duration : 0);
                                modified = true;
                            };
                            switch (item.attributeName) {
                                case 'stroke-dasharray':
                                    valueArray = SvgBuild.parseCoordinates(item.to);
                                    setDashGroup(valueArray, getDashOffset(intervalMap, valueOffset, item.delay));
                                    continue;
                                case 'stroke-dashoffset':
                                    valueOffset = convertInt(item.to);
                                    setDashGroup(getDashArray(intervalMap, valueArray, item.delay), valueOffset);
                                    continue;
                            }
                        }
                        else if (SvgBuild.asAnimate(item) && item.playable) {
                            intervalMap.evaluateStart(item);
                            switch (item.attributeName) {
                                case 'stroke-dasharray': {
                                    if (!initialized) {
                                        setDashLength(i);
                                        initialized = true;
                                    }
                                    const delayOffset = getDashOffset(intervalMap, valueOffset, item.delay);
                                    const baseValue = this.flattenStrokeDash(getDashArray(intervalMap, valueArray, item.delay), delayOffset, totalLength, pathLength).items;
                                    const group: SvgAnimate[] = [];
                                    const values: string[][] = [];
                                    for (let j = 0; j < dashTotal; ++j) {
                                        const animate = new SvgAnimate(this.element);
                                        animate.id = j;
                                        animate.baseValue = getFromToValue(baseValue[j]);
                                        animate.attributeName = 'stroke-dasharray';
                                        animate.delay = item.delay;
                                        animate.duration = item.duration;
                                        animate.iterationCount = item.iterationCount;
                                        animate.fillMode = item.fillMode;
                                        values[j] = [];
                                        group.push(animate);
                                    }
                                    const items = item.values;
                                    for (let j = 0, q = items.length; j < q; ++j) {
                                        const dashValue = this.flattenStrokeDash(SvgBuild.parseCoordinates(items[j]), delayOffset, totalLength, pathLength).items;
                                        for (let k = 0; k < dashTotal; ++k) {
                                            values[k].push(getFromToValue(dashValue[k]));
                                        }
                                    }
                                    const { keyTimes, keySplines } = item;
                                    const timingFunction = item.timingFunction;
                                    for (let j = 0; j < dashTotal; ++j) {
                                        const data = group[j];
                                        data.values = values[j];
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
                                        const replaceValue = this.flattenStrokeDash(getDashArray(intervalMap, valueArray, totalDuration), getDashOffset(intervalMap, valueOffset, totalDuration), totalLength, pathLength).items;
                                        for (let j = 0; j < dashTotal; ++j) {
                                            group[j].replaceValue = getFromToValue(replaceValue[j]);
                                        }
                                    }
                                    extracted = extracted.concat(group);
                                    modified = true;
                                    continue;
                                }
                                case 'stroke-dashoffset': {
                                    const duration = item.duration;
                                    const startOffset = parseFloat(item.values[0]);
                                    let keyTime = 0,
                                        previousRemaining = 0,
                                        extendedLength = totalLength,
                                        extendedRatio = 1,
                                        replaceValue: Undef<string>;
                                    if (valueOffset !== startOffset && item.delay === 0 && !item.fillReplace) {
                                        flattenData = this.flattenStrokeDash(flattenData.dashArray, startOffset, totalLength, pathLength);
                                        result = flattenData.items;
                                        dashGroup[0].items = result;
                                        dashTotal = Math.max(dashTotal, flattenData.items.length);
                                        valueOffset = startOffset;
                                    }
                                    if (flattenData.leading > 0 || flattenData.trailing > 0) {
                                        this.extendLength(flattenData, precision);
                                        if (flattenData.path) {
                                            const boxRect = SvgBuild.boxRectOf([this.value]);
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
                                    if (item.fillReplace && item.iterationCount !== -1) {
                                        const offsetForward = convertFloat(intervalMap.get(item.attributeName, item.getTotalDuration())!);
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
                                    const values: string[] = [];
                                    const keyTimes: number[] = [];
                                    for (let j = 0, length = keyTimesBase.length; j < length; ++j) {
                                        const offsetFrom = j === 0 ? valueOffset : parseFloat(valuesBase[j - 1]);
                                        const offsetTo = parseFloat(valuesBase[j]);
                                        const offsetValue = Math.abs(offsetTo - offsetFrom);
                                        const keyTimeTo = keyTimesBase[j];
                                        if (offsetValue === 0) {
                                            if (j > 0) {
                                                keyTime = keyTimeTo;
                                                keyTimes.push(keyTime);
                                                const q = values.length;
                                                if (q > 0) {
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
                                        let iterationTotal = offsetTotal / extendedLength,
                                            offsetRemaining = offsetTotal,
                                            finalValue = 0;
                                        const insertFractionKeyTime = () => {
                                            const time = increasing ? '1' : '0';
                                            if (!(j > 0 && values[values.length - 1] === time)) {
                                                keyTimes.push(keyTime === 0 ? 0 : truncateFraction(keyTime));
                                                values.push(time);
                                            }
                                        };
                                        const setFinalValue = (offset: number, checkInvert?: boolean) => {
                                            finalValue = (offsetRemaining - offset) / extendedLength;
                                            if (checkInvert) {
                                                const value = truncateFraction(finalValue);
                                                if (increasing) {
                                                    if (value > 0) {
                                                        finalValue = 1 - finalValue;
                                                    }
                                                }
                                                else if (value === 0) {
                                                    finalValue = 1;
                                                }
                                            }
                                        };
                                        const insertFinalKeyTime = () => {
                                            keyTime = keyTimeTo;
                                            keyTimes.push(keyTime);
                                            const value = truncateFraction(finalValue);
                                            values.push(value.toString());
                                            previousRemaining = value > 0 && value < 1 ? finalValue : 0;
                                        };
                                        const getKeyTimeIncrement = (offset: number) => ((offset / offsetTotal) * segDuration) / duration;
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
                                                    --iterationTotal;
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
                                                --iterationTotal;
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
                                        item.keySplines = null;
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
                        for (let i = 0, length = dashGroup.length; i < length; ++i) {
                            const { delay, duration, items } = dashGroup[i];
                            if (items === result) {
                                for (let j = items.length; j < dashTotal; ++j) {
                                    items.push({ start: 1, end: 1 });
                                }
                            }
                            else {
                                const baseValue = length > 2 ? this.flattenStrokeDash(getDashArray(intervalMap, valueArray, delay - 1), getDashOffset(intervalMap, valueOffset, delay - 1), totalLength, pathLength).items : result;
                                for (let j = 0; j < dashTotal; ++j) {
                                    const animate = new SvgAnimation(this.element);
                                    animate.id = j;
                                    animate.attributeName = 'stroke-dasharray';
                                    animate.baseValue = getFromToValue(baseValue[j]);
                                    animate.delay = delay;
                                    animate.duration = duration;
                                    animate.fillFreeze = duration === 0;
                                    animate.to = getFromToValue(items[j]);
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
        return this._transforms || (this._transforms = SvgBuild.filterTransforms(TRANSFORM.parse(this.element) || SvgBuild.convertTransforms(this.element.transform.baseVal)));
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