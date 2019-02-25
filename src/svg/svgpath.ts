import { SvgPathCommand, SvgPoint, SvgStrokeDash, SvgTransform, SvgTransformExclude, SvgTransformResidual } from './@types/object';

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
    public static extrapolate(basePath: string, attr: string, values: string[], precision?: number, element?: SVGGraphicsElement) {
        let result: string[] | undefined;
        if (attr === 'points') {
            result = [];
            for (let i = 0; i < values.length; i++) {
                const value = values[i].trim();
                if (value !== '') {
                    const points = SvgBuild.convertNumbers(SvgBuild.toNumberList(value));
                    if (points.length) {
                        result[i] = element && SVG.polygon(element) ? SvgBuild.drawPolygon(points, precision) : SvgBuild.drawPolyline(points, precision);
                    }
                    else {
                        return undefined;
                    }
                }
                else {
                    result[i] = '';
                }
            }
        }
        else if (attr === 'd') {
            result = values.slice(0);
        }
        else if (basePath) {
            const commands = SvgBuild.getPathCommands(basePath);
            if (commands.length <= 1) {
                return undefined;
            }
            else {
                result = [];
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
                                    if (!seg.relative) {
                                        for (let j = 0, k = 0; j < seg.coordinates.length; j += 2, k++) {
                                            const pt = seg.value[k];
                                            if (x !== undefined) {
                                                seg.coordinates[j] += x;
                                                pt.x += x;
                                            }
                                            if (y !== undefined) {
                                                seg.coordinates[j + 1] += y;
                                                pt.y += y;
                                            }
                                        }
                                    }
                                }
                            }
                        }
                        else if (rx !== undefined || ry !== undefined) {
                            for (const seg of path) {
                                if (seg.name.toUpperCase() === 'A') {
                                    if (rx !== undefined) {
                                        seg.radiusX = rx;
                                        seg.coordinates[0] = rx * 2 * (seg.coordinates[0] < 0 ? -1 : 1);
                                    }
                                    if (ry !== undefined) {
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
                            result[i] = values[i - 1] || basePath;
                            continue;
                        }
                        result[i] = SvgBuild.drawPath(path, precision);
                    }
                    else {
                        result[i] = '';
                    }
                }
            }
        }
        return result;
    }

    public static build(path: SvgPath, transforms: SvgTransform[], exclude?: SvgTransformExclude, residual?: SvgTransformResidual, precision?: number) {
        if (exclude && exclude[path.element.tagName]) {
            transforms = SvgBuild.filterTransforms(transforms, exclude[path.element.tagName]);
        }
        path.draw(transforms, residual, precision);
        return path;
    }

    public name = '';
    public value = '';
    public transformed: SvgTransform[] | null = null;
    public transformResidual?: SvgTransform[][];

    private _transforms?: SvgTransform[];

    constructor(public readonly element: SVGGeometryElement) {
        super(element);
        this.init();
    }

    public draw(transforms?: SvgTransform[], residual?: SvgTransformResidual, precision?: number, extract = false) {
        if (!extract) {
            this.transformed = null;
        }
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
        if (!extract) {
            this.value = d;
            this.setPaint([d], precision);
        }
        return d;
    }

    public flatStrokeDash(valueArray: number[], valueOffset: number, totalLength: number, pathLength?: number) {
        const result: SvgStrokeDash[] = [];
        let remainder = 0;
        if (valueArray.length) {
            if (!pathLength) {
                pathLength = totalLength;
            }
            valueOffset %= totalLength;
            if (valueOffset < 0) {
                valueOffset += totalLength;
            }
            let dashLength: number;
            for (let i = 0, j = 0; ; i += dashLength, j++) {
                dashLength = valueArray[j % valueArray.length];
                let startOffset: number;
                let actualLength: number;
                if (i < valueOffset) {
                    startOffset = 0;
                    actualLength = valueOffset - i;
                }
                else {
                    startOffset = i - valueOffset;
                    actualLength = dashLength;
                }
                if (i + dashLength > valueOffset) {
                    const start = $math.truncatePrecision(startOffset / pathLength);
                    const end = $math.truncatePrecision(start + (actualLength / pathLength));
                    if (j % 2 === 0) {
                        if (start < 1) {
                            result.push({ start, end: Math.min(end, 1) });
                        }
                        else {
                            if (start > 1) {
                                remainder = (start - 1) * totalLength;
                            }
                            break;
                        }
                    }
                    else if (start >= 1) {
                        remainder = (end - 1) * totalLength;
                        break;
                    }
                }
            }
            if (result.length === 0) {
                result.push({ start: 1, end: 1 });
            }
        }
        if (remainder > 0) {
            result[result.length - 1].remainder = $math.truncatePrecision(remainder);
        }
        return result;
    }

    public extendLength(value: number, precision?: number) {
        if (this.value !== '') {
            switch (this.element.tagName) {
                case 'path':
                case 'line':
                case 'polyline':
                    const commands = SvgBuild.getPathCommands(this.value);
                    if (commands.length > 1) {
                        const pathEnd = commands[commands.length - 1];
                        const pathEndPoint = pathEnd.value[0];
                        if (commands[0].value[0].x !== pathEndPoint.x || commands[0].value[0].y !== pathEndPoint.y) {
                            const name = pathEnd.name.toUpperCase();
                            let modified = false;
                            switch (name) {
                                case 'M':
                                case 'L': {
                                    const beforeEnd = commands[commands.length - 2];
                                    const beforeEndPoint = beforeEnd.value[beforeEnd.value.length - 1];
                                    if (beforeEndPoint.x === pathEndPoint.x) {
                                        pathEnd.coordinates[1] += pathEndPoint.y > beforeEndPoint.y ? value : -value;
                                    }
                                    else if (beforeEndPoint.y === pathEndPoint.y) {
                                        pathEnd.coordinates[0] += pathEndPoint.x > beforeEndPoint.x ? value : -value;
                                    }
                                    else {
                                        const angle = $math.getAngle(beforeEndPoint, pathEndPoint);
                                        pathEnd.coordinates[0] += $math.distanceFromX(value, angle);
                                        pathEnd.coordinates[1] += $math.distanceFromY(value, angle);
                                    }
                                    modified = true;
                                    break;
                                }
                                case 'H':
                                case 'V': {
                                    const index = name === 'H' ? 0 : 1;
                                    pathEnd.coordinates[index] += pathEnd.coordinates[index] > 0 ? value : -value;
                                    modified = true;
                                    break;
                                }
                            }
                            if (modified) {
                                return SvgBuild.drawPath(commands, precision);
                            }
                        }
                    }
                    break;
            }
        }
        return '';
    }

    public extractStrokeDash(animations?: SvgAnimation[], precision?: number): [SvgStrokeDash[] | undefined, string | undefined, string | undefined] {
        const strokeWidth = $util.convertInt(this.strokeWidth);
        let result: SvgStrokeDash[] | undefined;
        let path: string | undefined;
        let clipPath: string | undefined;
        if (strokeWidth > 0) {
            let valueArray = SvgBuild.toNumberList(this.strokeDasharray);
            if (valueArray.length) {
                const totalLength = this.totalLength;
                const pathLength =  this.pathLength || totalLength;
                const dashGroup: DashGroup[] = [];
                let valueOffset = $util.convertInt(this.strokeDashoffset);
                let dashLength = 0;
                const createDashGroup = (values: number[], offset: number, delay: number, duration = 0, otherLength?: number, companion?: SvgAnimation) => {
                    const items = this.flatStrokeDash(values, offset, totalLength, otherLength || pathLength);
                    dashLength = Math.max(dashLength, items.length);
                    dashGroup.push({ items, delay, duration, companion });
                    return items;
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
                    const getFromToValue = (item?: SvgStrokeDash) => item ? `${item.start} ${item.end}` : '1 1';
                    const revised: SvgAnimation[] = [];
                    let modified = false;
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
                            return SvgBuild.toNumberList(value);
                        }
                        return valueArray;
                    }
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
                                    dashLength = Math.max(dashLength, this.flatStrokeDash(SvgBuild.toNumberList(array), offset, totalLength, pathLength).length);
                                }
                            }
                        }
                    };
                    for (let i = 0; i < sorted.length; i++) {
                        const item = sorted[i];
                        if (item.setterType) {
                            let valid = true;
                            switch (item.attributeName) {
                                case 'stroke-dasharray':
                                    valueArray = SvgBuild.toNumberList(item.to);
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
                                    const baseValue = this.flatStrokeDash(valueArray, valueOffset, totalLength, pathLength);
                                    for (let j = 0; j < dashLength; j++) {
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
                                        const dashValue = this.flatStrokeDash(SvgBuild.toNumberList(item.values[j]), valueOffset, totalLength, pathLength);
                                        for (let k = 0; k < dashLength; k++) {
                                            values[k].push(getFromToValue(dashValue[k]));
                                        }
                                    }
                                    for (let j = 0; j < dashLength; j++) {
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
                                        const replaceValue = this.flatStrokeDash(getDashArray(totalDuration), getDashOffset(totalDuration), totalLength, pathLength);
                                        for (let j = 0; j < dashLength; j++) {
                                            group[j].replaceValue = getFromToValue(replaceValue[j]);
                                        }
                                    }
                                    revised.push(...group);
                                    modified = true;
                                    continue;
                                }
                                case 'stroke-dashoffset': {
                                    const duration = item.duration;
                                    const repeatFraction = 1 / duration;
                                    const values: string[] = [];
                                    const keyTimes: number[] = [];
                                    const endTime = item.keyTimes[item.keyTimes.length - 1];
                                    let actualLength = totalLength;
                                    let keyTime = 0;
                                    let previousIteration = 0;
                                    let previousDirection = 0;
                                    let previousIncreasing: boolean | undefined;
                                    const startOffset = parseFloat(item.values[0]);
                                    let baseValue: SvgStrokeDash[] | undefined;
                                    if (valueOffset !== startOffset) {
                                        if (modified || item.delay > 0) {
                                            baseValue = createDashGroup(valueArray, startOffset, item.delay, 0, pathLength, item);
                                        }
                                        else {
                                            result = this.flatStrokeDash(valueArray, startOffset, totalLength, pathLength);
                                            dashGroup[0].items = result;
                                            dashLength = Math.max(dashLength, result.length);
                                            baseValue = result;
                                        }
                                    }
                                    else if (result[result.length - 1].remainder) {
                                        baseValue = result;
                                    }
                                    if (baseValue) {
                                        const remainder = baseValue[baseValue.length - 1].remainder;
                                        if (remainder) {
                                            path = this.extendLength(remainder, precision);
                                            if (path !== '') {
                                                const boxRect = SvgBuild.toBoxRect([this.value]);
                                                const strokeOffset = Math.ceil(strokeWidth / 2);
                                                clipPath = SvgBuild.drawRect(boxRect.right - boxRect.left, boxRect.bottom - boxRect.top + strokeOffset * 2, boxRect.left, boxRect.top - strokeOffset);
                                                actualLength = getPathLength(path);
                                                let otherLength = this.pathLength;
                                                if (otherLength > 0) {
                                                    otherLength *= actualLength / totalLength;
                                                }
                                                else {
                                                    otherLength = actualLength;
                                                }
                                                if (baseValue === result) {
                                                    result = this.flatStrokeDash(valueArray, startOffset, actualLength, otherLength);
                                                    dashGroup[0].items = result;
                                                    baseValue = result;
                                                }
                                                else {
                                                    for (let j = 0; j < dashGroup.length; j++) {
                                                        if (dashGroup[j].items === baseValue) {
                                                            baseValue = this.flatStrokeDash(valueArray, startOffset, actualLength, otherLength);
                                                            dashGroup[j].items = baseValue;
                                                            break;
                                                        }
                                                    }
                                                }
                                                dashLength = Math.max(dashLength, baseValue.length);
                                            }
                                        }
                                    }
                                    for (let j = 0; j < item.keyTimes.length; j++) {
                                        if (j < item.keyTimes.length - 1) {
                                            const offsetFrom = parseFloat(item.values[j]);
                                            const offsetTo = parseFloat(item.values[j + 1]);
                                            const increasing = offsetTo > offsetFrom;
                                            let iterationCount = (Math.abs(offsetTo - offsetFrom) / actualLength) * (actualLength / pathLength);
                                            let segmentDuration = (item.keyTimes[j + 1] - item.keyTimes[j]) * duration;
                                            let remainderDuration!: number;
                                            let keyTimeInterval!: number;
                                            let keyTimeRemainder!: number;
                                            function setKeyTimeInterval() {
                                                if (iterationCount >= 1) {
                                                    remainderDuration = (iterationCount % 1) * (segmentDuration / Math.ceil(iterationCount));
                                                    keyTimeInterval = ((segmentDuration - remainderDuration) / Math.floor(iterationCount)) / duration;
                                                }
                                                else {
                                                    remainderDuration = segmentDuration;
                                                    keyTimeInterval = 0;
                                                }
                                                keyTimeRemainder = remainderDuration / duration;
                                            }
                                            setKeyTimeInterval();
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
                                                    if (iterationCount >= 1 && iterationCount > iterationRemainder) {
                                                        const resumeDuration = iterationRemainder * (segmentDuration / Math.ceil(iterationCount));
                                                        iterationCount -= iterationRemainder;
                                                        segmentDuration -= resumeDuration;
                                                        setKeyTimeInterval();
                                                        keyTime += resumeDuration / duration;
                                                        k = iterationCount;
                                                    }
                                                    else {
                                                        keyTime += keyTimeRemainder;
                                                        k = -1;
                                                    }
                                                    keyTimes.push($math.truncatePrecision(keyTime));
                                                    previousIteration = 0;
                                                    previousDirection = 0;
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
                                                if (k !== -1) {
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
                                                        if (increasing) {
                                                            if (!ignoreFraction) {
                                                                values.push('1');
                                                            }
                                                            values.push((1 - k).toString());
                                                            previousDirection = k - 1;
                                                        }
                                                        else {
                                                            if (!ignoreFraction) {
                                                                values.push('0');
                                                            }
                                                            values.push(k.toString());
                                                            previousDirection = 1 - k;
                                                        }
                                                        keyTime = $math.truncatePrecision(keyTime + keyTimeRemainder);
                                                        keyTimes.push(keyTime);
                                                        previousIncreasing = increasing;
                                                        break;
                                                    }
                                                }
                                            }
                                        }
                                        else {
                                            keyTimes[keyTimes.length - 1] = endTime;
                                        }
                                    }
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
                        revised.push(item);
                    }
                    if (modified) {
                        for (let i = 0; i < dashGroup.length; i++) {
                            const items = dashGroup[i].items;
                            if (items === result) {
                                for (let j = items.length; j < dashLength; j++) {
                                    items.push({ start: 1, end: 1 });
                                }
                            }
                            else {
                                const delay = dashGroup[i].delay;
                                const duration = dashGroup[i].duration;
                                const companion = dashGroup[i].companion;
                                const baseValue = dashGroup.length > 2 ? this.flatStrokeDash(getDashArray(delay - 1), getDashOffset(delay - 1), totalLength, pathLength) : result;
                                for (let j = 0; j < dashLength; j++) {
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
                                    revised.push(animate);
                                }
                            }
                        }
                        animations.length = 0;
                        animations.push(...revised);
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