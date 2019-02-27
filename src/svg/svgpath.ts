import { SvgBuildOptions, SvgPathCommand, SvgPathExtendData, SvgPoint, SvgTransformResidual, SvgStrokeDash, SvgTransform } from './@types/object';

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

interface DashGroup {
    items: SvgStrokeDash[];
    delay: number;
    duration: number;
    companion?: SvgAnimation;
}

const $math = squared.lib.math;
const $util = squared.lib.util;

export default class SvgPath extends SvgPaint$MX(SvgBaseVal$MX(SvgElement)) implements squared.svg.SvgPath {
    public static extrapolate(attr: string, pathData: string, values: string[], companion?: SvgShape, transforms?: SvgTransform[], precision?: number) {
        const result: string[] = [];
        if (attr === 'points') {
            for (let i = 0; i < values.length; i++) {
                let points = SvgBuild.convertPoints(SvgBuild.parseCoordinates(values[i]));
                if (points.length) {
                    function drawPoints() {
                        result[i] = companion && SVG.polygon(companion.element) ? SvgBuild.drawPolygon(points, precision) : SvgBuild.drawPolyline(points, precision);
                    }
                    if (transforms && transforms.length) {
                        drawPoints();
                        const commands = SvgBuild.getPathCommands(result[i]);
                        if (commands.length) {
                            points = SvgBuild.extractPathPoints(commands);
                            if (points.length) {
                                points = SvgBuild.applyTransforms(transforms, points, companion && TRANSFORM.origin(companion.element));
                            }
                        }
                    }
                    if (companion && companion.parent && companion.parent.requireRefit()) {
                        companion.parent.refitPoints(points);
                    }
                    drawPoints();
                }
                else {
                    result[i] = '';
                }
            }
        }
        else if (attr === 'd') {
            return values.slice(0);
        }
        else if (pathData) {
            if (transforms && transforms.length && companion && SVG.shape(companion.element)) {
                pathData = SvgBuild.drawRefit(companion.element, companion.parent, precision);
            }
            let commands = SvgBuild.getPathCommands(pathData);
            for (let i = 0; i < values.length; i++) {
                const value = parseFloat(values[i]);
                if (!isNaN(value)) {
                    const path = i < values.length - 1 ? <SvgPathCommand[]> $util.cloneArray(commands, [], true) : commands;
                    let x: number | undefined;
                    let y: number | undefined;
                    let rx: number | undefined;
                    let ry: number | undefined;
                    let width: number | undefined;
                    let height: number | undefined;
                    switch (attr) {
                        case 'x':
                        case 'x1':
                        case 'x2':
                        case 'cx':
                            x = value;
                            break;
                        case 'y':
                        case 'y1':
                        case 'y2':
                        case 'cy':
                            y = value;
                            break;
                        case 'r':
                            rx = value;
                            ry = rx;
                            break;
                        case 'rx':
                            rx = value;
                            break;
                        case 'ry':
                            ry = value;
                        case 'width':
                            width = value;
                            break;
                        case 'height':
                            height = value;
                            break;
                        default:
                            continue;
                    }
                    if (x !== undefined || y !== undefined) {
                        const commandA = path[0];
                        const commandB = path[path.length - 1];
                        const pointA = commandA.start;
                        const pointB = commandB.end;
                        let recalibrate = false;
                        if (x !== undefined) {
                            switch (attr) {
                                case 'x':
                                    x -= pointA.x;
                                    recalibrate = true;
                                    break;
                                case 'x1':
                                case 'cx':
                                    pointA.x = x;
                                    commandA.coordinates[0] = x;
                                    break;
                                case 'x2':
                                    pointB.x = x;
                                    commandB.coordinates[0] = x;
                                    break;
                            }
                        }
                        if (y !== undefined) {
                            switch (attr) {
                                case 'y':
                                    y -= pointA.y;
                                    recalibrate = true;
                                    break;
                                case 'y1':
                                case 'cy':
                                    pointA.y = y;
                                    commandA.coordinates[1] = y;
                                    break;
                                case 'y2':
                                    pointB.y = y;
                                    commandB.coordinates[1] = y;
                                    break;
                            }
                        }
                        if (recalibrate) {
                            for (const seg of path) {
                                for (let j = 0, k = 0; j < seg.coordinates.length; j += 2, k++) {
                                    if (x !== undefined) {
                                        if (!seg.relative) {
                                            seg.coordinates[j] += x;
                                        }
                                        seg.value[k].x += x;
                                    }
                                    if (y !== undefined) {
                                        if (!seg.relative) {
                                            seg.coordinates[j + 1] += y;
                                        }
                                        seg.value[k].y += y;
                                    }
                                }
                            }
                        }
                    }
                    else if (rx !== undefined || ry !== undefined) {
                        for (let j = 0; j < path.length; j++) {
                            const seg = path[j];
                            if (seg.name.toUpperCase() === 'A') {
                                if (rx !== undefined && seg.radiusX) {
                                    const offset = rx - seg.radiusX;
                                    seg.radiusX = rx;
                                    seg.coordinates[0] = rx * 2 * (seg.coordinates[0] < 0 ? -1 : 1);
                                    if (j === 1) {
                                        path[0].coordinates[0] -= offset;
                                        path[0].end.x -= offset;
                                    }
                                }
                                if (ry !== undefined && seg.radiusY) {
                                    seg.radiusY = ry;
                                }
                            }
                        }
                    }
                    else if (width !== undefined) {
                        for (const index of [1, 2]) {
                            const seg = path[index];
                            switch (seg.name) {
                                case 'm':
                                case 'l':
                                case 'h':
                                    seg.coordinates[0] = width * (seg.coordinates[0] < 0 ? -1 : 1);
                                    break;
                                case 'M':
                                case 'L':
                                case 'H':
                                    seg.coordinates[0] = path[0].end.x + width;
                                    break;
                            }
                        }
                    }
                    else if (height !== undefined) {
                        for (const index of [2, 3]) {
                            const seg = path[index];
                            switch (seg.name) {
                                case 'm':
                                case 'l':
                                case 'v':
                                    seg.coordinates[1] = height * (seg.coordinates[1] < 0 ? -1 : 1);
                                    break;
                                case 'M':
                                case 'L':
                                case 'V':
                                    seg.coordinates[1] = path[0].end.y + height;
                                    break;
                            }
                        }
                    }
                    else {
                        result[i] = values[i - 1] || pathData;
                        continue;
                    }
                    result[i] = SvgBuild.drawPath(path, precision);
                    if (transforms && transforms.length) {
                        commands = SvgBuild.getPathCommands(result[i]);
                        if (commands.length) {
                            let points = SvgBuild.extractPathPoints(commands);
                            if (points.length) {
                                points = SvgBuild.applyTransforms(transforms, points, companion && TRANSFORM.origin(companion.element));
                                result[i] = SvgBuild.drawPath(SvgBuild.rebindPathPoints(commands, points), precision);
                            }
                        }
                    }
                }
                else {
                    result[i] = '';
                }
            }
        }
        return result;
    }

    public static build(path: SvgPath, transforms: SvgTransform[], options?: SvgBuildOptions) {
        const exclude = options && options.exclude;
        if (exclude && exclude[path.element.tagName]) {
            transforms = SvgBuild.filterTransforms(transforms, exclude[path.element.tagName]);
        }
        path.draw(transforms, options);
        return path;
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

    public draw(transforms?: SvgTransform[], options?: SvgBuildOptions) {
        let residual: SvgTransformResidual | undefined;
        let precision: number | undefined;
        if (options) {
            residual = options.residual;
            precision = options.precision;
        }
        this.transformed = undefined;
        const element = this.element;
        const parent = <SvgContainer> this.parent;
        const patternParent = <SvgShapePattern> this.patternParent;
        const requireRefit = !!parent && parent.requireRefit();
        const requirePatternRefit = !!patternParent && patternParent.patternContentUnits === REGION_UNIT.OBJECT_BOUNDING_BOX;
        let d: string;
        if (SVG.path(element)) {
            d = this.getBaseValue('d');
            if (transforms && transforms.length || requireRefit || requirePatternRefit) {
                const commands = SvgBuild.getPathCommands(d);
                if (commands.length) {
                    let points = SvgBuild.extractPathPoints(commands);
                    if (points.length) {
                        if (requirePatternRefit) {
                            patternParent.patternRefitPoints(points);
                        }
                        if (transforms && transforms.length) {
                            if (typeof residual === 'function') {
                                [this.transformResidual, transforms] = residual.call(this, element, transforms);
                            }
                            if (transforms.length) {
                                points = SvgBuild.applyTransforms(transforms, points, TRANSFORM.origin(this.element));
                                this.transformed = transforms;
                            }
                        }
                        if (requireRefit) {
                            parent.refitPoints(points);
                        }
                        d = SvgBuild.drawPath(SvgBuild.rebindPathPoints(commands, points), precision);
                    }
                }
            }
        }
        else if (SVG.line(element)) {
            let points: SvgPoint[] = [
                { x: this.getBaseValue('x1'), y: this.getBaseValue('y1') },
                { x: this.getBaseValue('x2'), y: this.getBaseValue('y2') }
            ];
            if (requirePatternRefit) {
                patternParent.patternRefitPoints(points);
            }
            if (transforms && transforms.length) {
                if (typeof residual === 'function') {
                    [this.transformResidual, transforms] = residual.call(this, element, transforms);
                }
                if (transforms.length) {
                    points = SvgBuild.applyTransforms(transforms, points, TRANSFORM.origin(this.element));
                    this.transformed = transforms;
                }
            }
            if (requireRefit) {
                parent.refitPoints(points);
            }
            d = SvgBuild.drawPolyline(points, precision);
        }
        else if (SVG.circle(element) || SVG.ellipse(element)) {
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
            let points: SvgPoint[] = [
                { x: this.getBaseValue('cx'), y: this.getBaseValue('cy'), rx, ry }
            ];
            if (requirePatternRefit) {
                patternParent.patternRefitPoints(points);
            }
            if (transforms && transforms.length) {
                if (typeof residual === 'function') {
                    [this.transformResidual, transforms] = residual.call(this, element, transforms, rx, ry);
                }
                if (transforms.length) {
                    points = SvgBuild.applyTransforms(transforms, points, TRANSFORM.origin(this.element));
                    this.transformed = transforms;
                }
            }
            if (requireRefit) {
                parent.refitPoints(points);
            }
            const pt = <Required<SvgPoint>> points[0];
            d = SvgBuild.drawEllipse(pt.x, pt.y, pt.rx, pt.ry, precision);
        }
        else if (SVG.rect(element)) {
            let x = this.getBaseValue('x');
            let y = this.getBaseValue('y');
            let width = this.getBaseValue('width');
            let height = this.getBaseValue('height');
            if (transforms && transforms.length) {
                let points: SvgPoint[] = [
                    { x, y },
                    { x: x + width, y },
                    { x: x + width, y: y + height },
                    { x, y: y + height }
                ];
                if (requirePatternRefit) {
                    patternParent.patternRefitPoints(points);
                }
                if (typeof residual === 'function') {
                    [this.transformResidual, transforms] = residual.call(this, element, transforms);
                }
                if (transforms.length) {
                    points = SvgBuild.applyTransforms(transforms, points, TRANSFORM.origin(this.element));
                    this.transformed = transforms;
                }
                if (requireRefit) {
                    parent.refitPoints(points);
                }
                d = SvgBuild.drawPolygon(points, precision);
            }
            else {
                if (requirePatternRefit) {
                    x = patternParent.patternRefitX(x);
                    y = patternParent.patternRefitY(y);
                    width = patternParent.patternRefitX(width);
                    height = patternParent.patternRefitY(height);
                }
                if (requireRefit) {
                    x = parent.refitX(x);
                    y = parent.refitY(y);
                    width = parent.refitSize(width);
                    height = parent.refitSize(height);
                }
                d = SvgBuild.drawRect(width, height, x, y, precision);
            }
        }
        else if (SVG.polygon(element) || SVG.polyline(element)) {
            let points: SvgPoint[] = this.getBaseValue('points');
            if (requirePatternRefit) {
                patternParent.patternRefitPoints(points);
            }
            if (transforms && transforms.length) {
                if (typeof residual === 'function') {
                    [this.transformResidual, transforms] = residual.call(this, element, transforms);
                }
                if (transforms.length) {
                    points = SvgBuild.applyTransforms(transforms, points, TRANSFORM.origin(this.element));
                    this.transformed = transforms;
                }
            }
            if (requireRefit) {
                if (this.transformed === null) {
                    points = SvgBuild.clonePoints(points);
                }
                parent.refitPoints(points);
            }
            d = SVG.polygon(element) ? SvgBuild.drawPolygon(points, precision) : SvgBuild.drawPolyline(points, precision);
        }
        else {
            d = '';
        }
        this.value = d;
        this.setPaint([d], precision);
        return d;
    }

    public extendLength(data: SvgPathExtendData, negative = false, precision?: number) {
        if (this.value !== '') {
            switch (this.element.tagName) {
                case 'path':
                case 'line':
                case 'polyline':
                    const commands = SvgBuild.getPathCommands(this.value);
                    if (commands.length) {
                        const pathStart = commands[0];
                        const pathStartPoint = pathStart.start;
                        const pathEnd = commands[commands.length - 1];
                        const pathEndPoint = pathEnd.end;
                        let modified = false;
                        let leading = data.leading;
                        let trailing = data.trailing + data.trailingSpace;
                        if (pathStartPoint.x !== pathEndPoint.x || pathStartPoint.y !== pathEndPoint.y) {
                            if (leading > 0) {
                                let afterStartPoint: SvgPoint | undefined;
                                if (pathStart.value.length > 1) {
                                    afterStartPoint = pathStart.value[1];
                                }
                                else if (commands.length > 1) {
                                    afterStartPoint = commands[1].start;
                                }
                                if (afterStartPoint) {
                                    if (afterStartPoint.x === pathStartPoint.x) {
                                        const y = pathStart.coordinates[1] + (pathStartPoint.y > afterStartPoint.y ? leading : -leading);
                                        if (negative || y >= 0) {
                                            pathStart.coordinates[1] = y;
                                            modified = true;
                                        }
                                        else {
                                            leading = 0;
                                        }
                                    }
                                    else if (afterStartPoint.y === pathStartPoint.y) {
                                        const x = pathStart.coordinates[0] + (pathStartPoint.x > afterStartPoint.x ? leading : -leading);
                                        if (negative || x >= 0) {
                                            pathStart.coordinates[0] = x;
                                            modified = true;
                                        }
                                        else {
                                            leading = 0;
                                        }
                                    }
                                    else {
                                        const angle = $math.getAngle(afterStartPoint, pathStartPoint);
                                        const x = pathStart.coordinates[0] - $math.distanceFromX(leading, angle);
                                        const y = pathStart.coordinates[1] - $math.distanceFromY(leading, angle);
                                        if (negative || x >= 0 && y >= 0) {
                                            pathStart.coordinates[0] = x;
                                            pathStart.coordinates[1] = y;
                                            modified = true;
                                        }
                                        else {
                                            leading = 0;
                                        }
                                    }
                                }
                            }
                            const name = pathEnd.name.toUpperCase();
                            switch (name) {
                                case 'M':
                                case 'L': {
                                    if (trailing > 0) {
                                        let beforeEndPoint: SvgPoint | undefined;
                                        if (commands.length === 1) {
                                            if (pathStart.value.length > 1) {
                                                beforeEndPoint = pathStart.value[pathStart.value.length - 2];
                                            }
                                        }
                                        else if (pathEnd.value.length > 1) {
                                            beforeEndPoint = pathEnd.value[pathEnd.value.length - 2];
                                        }
                                        else {
                                            beforeEndPoint = commands[commands.length - 2].end;
                                        }
                                        if (beforeEndPoint) {
                                            if (beforeEndPoint.x === pathEndPoint.x) {
                                                const y = pathEnd.coordinates[1] + (pathEndPoint.y > beforeEndPoint.y ? trailing : -trailing);
                                                if (negative || y >= 0) {
                                                    pathEnd.coordinates[1] = y;
                                                    modified = true;
                                                }
                                                else {
                                                    trailing = 0;
                                                }
                                            }
                                            else if (beforeEndPoint.y === pathEndPoint.y) {
                                                const x = pathEnd.coordinates[0] + (pathEndPoint.x > beforeEndPoint.x ? trailing : -trailing);
                                                if (negative || x >= 0) {
                                                    pathEnd.coordinates[0] = x;
                                                    modified = true;
                                                }
                                                else {
                                                    trailing = 0;
                                                }
                                            }
                                            else {
                                                const angle = $math.getAngle(beforeEndPoint, pathEndPoint);
                                                const x = pathEnd.coordinates[0] + $math.distanceFromX(trailing, angle);
                                                const y = pathEnd.coordinates[1] + $math.distanceFromY(trailing, angle);
                                                if (negative || x >= 0 && y >= 0) {
                                                    pathEnd.coordinates[0] = x;
                                                    pathEnd.coordinates[1] = y;
                                                    modified = true;
                                                }
                                                else {
                                                    trailing = 0;
                                                }
                                            }
                                        }
                                    }
                                    break;
                                }
                                case 'H':
                                case 'V': {
                                    const index = name === 'H' ? 0 : 1;
                                    const pt = pathEnd.coordinates[index] + (leading + trailing) * (pathEnd.coordinates[index] >= 0 ? 1 : -1);
                                    if (negative || pt >= 0) {
                                        pathEnd.coordinates[index] = pt;
                                        modified = true;
                                    }
                                    else {
                                        trailing = 0;
                                    }
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
                    }
                    break;
            }
        }
        return undefined;
    }

    public flattenStrokeDash(valueArray: number[], valueOffset: number, totalLength: number, pathLength?: number, data?: SvgPathExtendData) {
        const result: SvgPathExtendData = {
            items: [],
            leading: 0,
            trailing: 0,
            trailingSpace: 0,
            pathLengthRatio: totalLength / (pathLength || totalLength)
        };
        if (valueArray.length) {
            if (!pathLength) {
                pathLength = totalLength;
            }
            const extendedLength = data && data.extendedLength || pathLength;
            let j = 0;
            if (data === undefined) {
                const arrayTotal = valueArray.reduce((a, b) => a + b, 0);
                valueOffset %= totalLength;
                if (valueOffset < 0) {
                    while (valueOffset < 0) {
                        valueOffset += arrayTotal;
                    }
                }
            }
            else if (data.leadingOffset) {
                j = 1;
            }
            const arrayLength = valueArray.length;
            for (let i = 0, dashLength = 0; ; i += dashLength, j++) {
                dashLength = valueArray[j % arrayLength];
                if (i + dashLength > valueOffset) {
                    let startOffset: number;
                    let actualLength: number;
                    if (i < valueOffset) {
                        result.leading = valueOffset - i;
                        startOffset = 0;
                        actualLength = dashLength - result.leading;
                    }
                    else {
                        startOffset = i - valueOffset;
                        actualLength = dashLength;
                    }
                    const start = $math.truncatePrecision(startOffset / extendedLength);
                    const end = $math.truncatePrecision(start + (actualLength / extendedLength));
                    if (j % 2 === 0) {
                        if (start < 1) {
                            result.items.push({ start, end: Math.min(end, 1) });
                        }
                        else {
                            if (start > 1) {
                                result.trailing = $math.truncatePrecision((start - 1) * extendedLength);
                            }
                            result.trailingSpace = valueArray[(j + 1) % arrayLength];
                            break;
                        }
                    }
                    else if (start >= 1) {
                        result.trailing = $math.truncatePrecision((end - 1) * extendedLength);
                        result.trailingSpace = dashLength;
                        break;
                    }
                }
            }
            if (data === undefined) {
                if (result.items.length === 0) {
                    result.items.push({ start: 1, end: 1 });
                }
                else {
                    result.leadingOffset = $math.truncatePrecision(result.items[0].start * extendedLength);
                    result.trailingOffset = $math.truncatePrecision((1 - result.items[result.items.length - 1].end) * extendedLength);
                    if (result.leadingOffset > 0) {
                        if (result.leadingOffset + result.trailingOffset >= result.trailingSpace) {
                            result.leading = 0;
                            result.trailing = 0;
                            result.trailingSpace -= result.leadingOffset + result.trailingOffset;
                        }
                        else if (result.leadingOffset + result.trailing >= result.trailingSpace) {
                            result.leading = 0;
                            result.trailing -= result.leadingOffset;
                            result.trailingSpace = 0;
                        }
                        else if (result.leadingOffset + result.leading >= result.trailingSpace) {
                            result.trailing = 0;
                            result.trailingSpace = 0;
                        }
                    }
                    else if (result.leading === 0 && result.trailing < result.trailingSpace) {
                        result.trailingSpace -= result.trailingOffset;
                    }
                    else if (j % 2 === 1) {
                        result.trailingSpace = 0;
                    }
                    result.leading *= result.pathLengthRatio;
                    result.trailing *= result.pathLengthRatio;
                    result.trailingSpace *= result.pathLengthRatio;
                }
            }
        }
        return result;
    }

    public extractStrokeDash(animations?: SvgAnimation[], negative = false, precision?: number): [SvgStrokeDash[] | undefined, string | undefined, string | undefined] {
        const strokeWidth = $util.convertInt(this.strokeWidth);
        let result: SvgStrokeDash[] | undefined;
        let path: string | undefined;
        let clipPath: string | undefined;
        if (strokeWidth > 0) {
            let valueArray = SvgBuild.parseCoordinates(this.strokeDasharray);
            if (valueArray.length) {
                const totalLength = this.totalLength;
                const pathLength =  this.pathLength || totalLength;
                const dashGroup: DashGroup[] = [];
                let flattenData!: SvgPathExtendData;
                let valueOffset = $util.convertInt(this.strokeDashoffset);
                let dashTotal = 0;
                const createDashGroup = (values: number[], offset: number, delay: number, duration = 0, companion?: SvgAnimation) => {
                    const data = this.flattenStrokeDash(values, offset, totalLength, pathLength);
                    if (dashGroup.length === 0 || companion) {
                        flattenData = data;
                    }
                    dashTotal = Math.max(dashTotal, data.items.length);
                    dashGroup.push({ items: data.items, delay, duration, companion });
                    return data.items;
                };
                result = createDashGroup(valueArray, valueOffset, 0);
                if (animations) {
                    const sorted = animations.slice(0).sort((a, b) => {
                        if (a.attributeName.startsWith('stroke-dash') && b.attributeName.startsWith('stroke-dash')) {
                            if (a.delay !== b.delay) {
                                return a.delay < b.delay ? -1 : 1;
                            }
                            else if (SvgBuild.asSet(a) && SvgBuild.asAnimate(b) || a.animationElement === undefined && b.animationElement) {
                                return -1;
                            }
                            else if (SvgBuild.asAnimate(a) && SvgBuild.asSet(b) || a.animationElement && b.animationElement === undefined) {
                                return 1;
                            }
                        }
                        return 0;
                    });
                    const intervalMap = new SvgAnimationIntervalMap(sorted, 'stroke-dasharray', 'stroke-dashoffset');
                    if (sorted.length > 1) {
                        for (let i = 0; i < sorted.length; i++) {
                            if (!intervalMap.has(sorted[i].attributeName, sorted[i].delay, sorted[i])) {
                                sorted.splice(i--, 1);
                            }
                        }
                    }
                    function getDashOffset(time: number, playing = false) {
                        const value = intervalMap.get('stroke-dashoffset', time, playing);
                        if (value) {
                            return parseFloat(value);
                        }
                        return valueOffset;
                    }
                    function getDashArray(time: number, playing = false) {
                        const value = intervalMap.get('stroke-dasharray', time, playing);
                        if (value) {
                            return SvgBuild.parseCoordinates(value);
                        }
                        return valueArray;
                    }
                    const getFromToValue = (item?: SvgStrokeDash) => item ? `${item.start} ${item.end}` : '1 1';
                    let setDashLength: Undefined<(index: number) => void> = (index: number) => {
                        let offset = valueOffset;
                        for (let i = index; i < sorted.length; i++) {
                            const item = sorted[i];
                            if (item.attributeName === 'stroke-dasharray') {
                                const value = intervalMap.get('stroke-dashoffset', item.delay);
                                if (value) {
                                    offset = parseFloat(value);
                                }
                                for (const array of (SvgBuild.asAnimate(item) ? intervalMap.evaluateStart(item) : [item.to])) {
                                    dashTotal = Math.max(dashTotal, this.flattenStrokeDash(SvgBuild.parseCoordinates(array), offset, totalLength, pathLength).items.length);
                                }
                            }
                        }
                    };
                    const extracted: SvgAnimation[] = [];
                    let modified = false;
                    for (let i = 0; i < sorted.length; i++) {
                        const item = sorted[i];
                        if (item.setterType) {
                            let valid = true;
                            switch (item.attributeName) {
                                case 'stroke-dasharray':
                                    valueArray = SvgBuild.parseCoordinates(item.to);
                                    valueOffset = getDashOffset(item.delay);
                                    break;
                                case 'stroke-dashoffset':
                                    valueOffset = $util.convertInt(item.to);
                                    valueArray = getDashArray(item.delay);
                                    break;
                                default:
                                    valid = false;
                                    break;
                            }
                            if (valid) {
                                createDashGroup(valueArray, valueOffset, item.delay, item.fillReplace && item.duration > 0 ? item.duration : 0);
                                modified = true;
                                continue;
                            }
                        }
                        else if (SvgBuild.asAnimate(item) && item.playable) {
                            valueArray = getDashArray(item.delay);
                            valueOffset = getDashOffset(item.delay);
                            intervalMap.evaluateStart(item);
                            switch (item.attributeName) {
                                case 'stroke-dasharray': {
                                    if (setDashLength) {
                                        setDashLength(i);
                                        setDashLength = undefined;
                                    }
                                    const group: SvgAnimate[] = [];
                                    const values: string[][] = [];
                                    const baseValue = this.flattenStrokeDash(valueArray, valueOffset, totalLength, pathLength);
                                    for (let j = 0; j < dashTotal; j++) {
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
                                    for (let j = 0; j < item.keyTimes.length; j++) {
                                        const dashValue = this.flattenStrokeDash(SvgBuild.parseCoordinates(item.values[j]), valueOffset, totalLength, pathLength);
                                        for (let k = 0; k < dashTotal; k++) {
                                            values[k].push(getFromToValue(dashValue[k]));
                                        }
                                    }
                                    for (let j = 0; j < dashTotal; j++) {
                                        group[j].values = values[j];
                                        group[j].keyTimes = item.keyTimes;
                                        if (item.keySplines) {
                                            group[j].keySplines = item.keySplines;
                                        }
                                        else {
                                            group[j].timingFunction = item.timingFunction;
                                        }
                                    }
                                    if (item.fillReplace) {
                                        const totalDuration = item.getTotalDuration();
                                        const replaceValue = this.flattenStrokeDash(getDashArray(totalDuration), getDashOffset(totalDuration), totalLength, pathLength);
                                        for (let j = 0; j < dashTotal; j++) {
                                            group[j].replaceValue = getFromToValue(replaceValue[j]);
                                        }
                                    }
                                    extracted.push(...group);
                                    modified = true;
                                    continue;
                                }
                                case 'stroke-dashoffset': {
                                    const duration = item.duration;
                                    const repeatFraction = 1 / duration;
                                    const values: string[] = [];
                                    const keyTimes: number[] = [];
                                    const endTime = item.keyTimes[item.keyTimes.length - 1];
                                    let keyTime = 0;
                                    let previousIteration = 0;
                                    let previousDirection = 0;
                                    let previousIncreasing: boolean | undefined;
                                    const startOffset = parseFloat(item.values[0]);
                                    const requireExtend = () => flattenData.leading > 0 || flattenData.trailing > 0 || flattenData.trailingSpace !== 0;
                                    let baseValue: SvgStrokeDash[] | undefined;
                                    if (valueOffset !== startOffset) {
                                        if (modified || item.delay > 0) {
                                            baseValue = createDashGroup(valueArray, startOffset, item.delay, 0, item);
                                        }
                                        else {
                                            flattenData = this.flattenStrokeDash(valueArray, startOffset, totalLength, pathLength);
                                            dashGroup[0].items = flattenData.items;
                                            dashTotal = Math.max(dashTotal, flattenData.items.length);
                                            baseValue = result;
                                        }
                                    }
                                    else if (requireExtend()) {
                                        baseValue = result;
                                    }
                                    if (baseValue && (requireExtend())) {
                                        this.extendLength(flattenData, negative, precision);
                                        if (flattenData.path) {
                                            const boxRect = SvgBuild.parseBoxRect([this.value]);
                                            const strokeOffset = Math.ceil(strokeWidth / 2);
                                            const extendedLength = getPathLength(flattenData.path);
                                            if (flattenData.leading > 0 || flattenData.trailing > 0) {
                                                clipPath = SvgBuild.drawRect(boxRect.right - boxRect.left, boxRect.bottom - boxRect.top + strokeOffset * 2, boxRect.left, boxRect.top - strokeOffset);
                                            }
                                            flattenData.extendedLength = this.pathLength;
                                            if (flattenData.extendedLength > 0) {
                                                flattenData.extendedLength *= extendedLength / totalLength;
                                            }
                                            else {
                                                flattenData.extendedLength = extendedLength;
                                            }
                                            if (baseValue === result) {
                                                const data = this.flattenStrokeDash(valueArray, 0, totalLength, pathLength, flattenData);
                                                result = data.items;
                                                dashGroup[0].items = result;
                                                baseValue = result;
                                            }
                                            else {
                                                for (const group of dashGroup) {
                                                    if (group.items === baseValue) {
                                                        const data = this.flattenStrokeDash(valueArray, 0, totalLength, pathLength, flattenData);
                                                        baseValue = data.items;
                                                        group.items = baseValue;
                                                        break;
                                                    }
                                                }
                                            }
                                            path = flattenData.path;
                                            dashTotal = Math.max(dashTotal, baseValue.length);
                                        }
                                    }
                                    $util.replaceMap<string, string>(item.values, value => (parseFloat(value) - valueOffset).toString());
                                    for (let j = 0; j < item.keyTimes.length; j++) {
                                        if (j < item.keyTimes.length - 1) {
                                            const offsetFrom = parseFloat(item.values[j]);
                                            const offsetTo = parseFloat(item.values[j + 1]);
                                            const increasing = offsetTo > offsetFrom;
                                            const iterationCount = (Math.abs(offsetTo - offsetFrom) / totalLength) * flattenData.pathLengthRatio;
                                            let segDuration = (item.keyTimes[j + 1] - item.keyTimes[j]) * duration;
                                            let iterationRatio = segDuration / iterationCount;
                                            let keyTimeInterval: number | undefined;
                                            for (let k = iterationCount, l = 0; k > 0; k--, l++) {
                                                let ignoreFraction = false;
                                                if (previousIteration !== 0) {
                                                    const iterationRemainder = Math.abs(previousDirection);
                                                    if (increasing) {
                                                        if (iterationCount >= iterationRemainder) {
                                                            values.push('0');
                                                        }
                                                        else {
                                                            if (previousDirection > 0) {
                                                                values.push((previousIteration - iterationCount).toString());
                                                            }
                                                            else {
                                                                values.push((iterationRemainder - iterationCount).toString());
                                                            }
                                                        }
                                                    }
                                                    else {
                                                        if (iterationCount >= iterationRemainder) {
                                                            values.push('1');
                                                        }
                                                        else {
                                                            if (previousDirection > 0) {
                                                                values.push((previousIteration + iterationRemainder).toString());
                                                            }
                                                            else {
                                                                values.push((iterationRemainder + iterationRemainder).toString());
                                                            }
                                                        }
                                                    }
                                                    if (iterationCount > iterationRemainder) {
                                                        const remainderDuration = previousIteration * iterationRatio;
                                                        keyTime += remainderDuration / duration;
                                                        keyTimes.push($math.truncatePrecision(keyTime));
                                                        segDuration -= remainderDuration;
                                                        iterationRatio = segDuration / iterationCount;
                                                        k = iterationCount;
                                                        previousIteration = 0;
                                                        previousDirection = 0;
                                                    }
                                                    else {
                                                        keyTimes.push($math.truncatePrecision(keyTime + segDuration / duration));
                                                        break;
                                                    }
                                                }
                                                else if (previousIncreasing !== undefined) {
                                                    if (increasing) {
                                                        ignoreFraction = previousIncreasing;
                                                    }
                                                    else {
                                                        ignoreFraction = !previousIncreasing;
                                                    }
                                                    previousIncreasing = undefined;
                                                }
                                                else if (keyTimes.length) {
                                                    const value = values[values.length - 1];
                                                    if (increasing) {
                                                        ignoreFraction = value === '1';
                                                    }
                                                    else {
                                                        ignoreFraction = value === '0';
                                                    }
                                                }
                                                if (keyTimeInterval === undefined) {
                                                    const remainderDuration = (iterationCount % 1) * iterationRatio;
                                                    keyTimeInterval = ((segDuration - remainderDuration) / Math.floor(iterationCount)) / duration;
                                                }
                                                if (!ignoreFraction) {
                                                    keyTimes.push(keyTime + (keyTime !== 0 ? repeatFraction : 0));
                                                }
                                                k = $math.truncatePrecision(k);
                                                if (k >= 1) {
                                                    if (increasing) {
                                                        if (!ignoreFraction) {
                                                            values.push('1');
                                                        }
                                                        values.push('0');
                                                    }
                                                    else {
                                                        if (!ignoreFraction) {
                                                            values.push('0');
                                                        }
                                                        values.push('1');
                                                    }
                                                    keyTime = $math.truncatePrecision(keyTime + keyTimeInterval);
                                                    if (keyTime + repeatFraction >= endTime) {
                                                        keyTime = endTime;
                                                    }
                                                    keyTimes.push(keyTime);
                                                }
                                                else {
                                                    previousIteration = k;
                                                    const value = ((offsetTo % totalLength) / totalLength).toString();
                                                    if (increasing) {
                                                        if (!ignoreFraction) {
                                                            values.push('1');
                                                        }
                                                        if (value !== '1') {
                                                            values.push(value);
                                                        }
                                                        else {
                                                            keyTimes.pop();
                                                        }
                                                        previousDirection = k - 1;
                                                    }
                                                    else {
                                                        if (!ignoreFraction) {
                                                            values.push('0');
                                                        }
                                                        if (value !== '0') {
                                                            values.push(value);
                                                        }
                                                        else {
                                                            keyTimes.pop();
                                                        }
                                                        previousDirection = 1 - k;
                                                    }
                                                    keyTime = $math.truncatePrecision(keyTime + (k * iterationRatio) / duration);
                                                    keyTimes.push(keyTime);
                                                    previousIncreasing = increasing;
                                                    break;
                                                }
                                            }
                                        }
                                        else {
                                            keyTimes[keyTimes.length - 1] = endTime;
                                        }
                                    }
                                    item.baseValue = undefined;
                                    item.replaceValue = '0';
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
                        for (let i = 0; i < dashGroup.length; i++) {
                            const items = dashGroup[i].items;
                            if (items === result) {
                                for (let j = items.length; j < dashTotal; j++) {
                                    items.push({ start: 1, end: 1 });
                                }
                            }
                            else {
                                const delay = dashGroup[i].delay;
                                const duration = dashGroup[i].duration;
                                const companion = dashGroup[i].companion;
                                const baseValue = dashGroup.length > 2 ? this.flattenStrokeDash(getDashArray(delay - 1), getDashOffset(delay - 1), totalLength, pathLength) : result;
                                for (let j = 0; j < dashTotal; j++) {
                                    const animate = new SvgAnimation(this.element);
                                    animate.id = j;
                                    animate.attributeName = 'stroke-dasharray';
                                    animate.baseValue = getFromToValue(baseValue[j]);
                                    animate.delay = delay;
                                    animate.to = getFromToValue(items[j]);
                                    animate.duration = duration;
                                    animate.fillFreeze = duration === 0;
                                    if (companion) {
                                        animate.companion = { index: -1, value: companion };
                                    }
                                    extracted.push(animate);
                                }
                            }
                        }
                        animations.length = 0;
                        animations.push(...extracted);
                    }
                }
            }
        }
        return [result, path, clipPath];
    }

    private init() {
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
        if (this._transforms === undefined) {
            this._transforms = SvgBuild.filterTransforms(TRANSFORM.parse(this.element) || SvgBuild.convertTransforms(this.element.transform.baseVal));
        }
        return this._transforms;
    }

    get pathLength() {
        return $util.convertFloat(this.getAttribute('pathLength'));
    }

    get totalLength() {
        return this.element.getTotalLength();
    }

    get instanceType() {
        return INSTANCE_TYPE.SVG_PATH;
    }
}