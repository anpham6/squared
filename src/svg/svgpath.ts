import { SvgPoint, SvgStrokeDash, SvgTransform, SvgTransformExclude, SvgTransformResidual } from './@types/object';

import SvgBaseVal$MX from './svgbaseval-mx';
import SvgPaint$MX from './svgpaint-mx';
import SvgAnimate from './svganimate';
import SvgAnimation from './svganimation';
import SvgBuild from './svgbuild';
import SvgElement from './svgelement';

import { FILL_MODE, INSTANCE_TYPE, REGION_UNIT } from './lib/constant';
import { SVG, TRANSFORM, getPathLength } from './lib/util';

type SvgContainer = squared.svg.SvgContainer;
type SvgIntervalMap = squared.svg.SvgIntervalMap;
type SvgShapePattern = squared.svg.SvgShapePattern;

interface DashGroup {
    items: SvgStrokeDash[];
    delay: number;
    duration: number;
}

const $math = squared.lib.math;
const $util = squared.lib.util;

export default class SvgPath extends SvgPaint$MX(SvgBaseVal$MX(SvgElement)) implements squared.svg.SvgPath {
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
    public strokeDashClipPath?: string;

    private _totalLength = 0;
    private _transforms?: SvgTransform[];

    constructor(public readonly element: SVGGraphicsElement) {
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
                    let points = SvgBuild.getPathPoints(commands);
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
                        d = SvgBuild.drawPath(SvgBuild.bindPathPoints(commands, points), precision);
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
            this._totalLength = 0;
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
                let totalLength = this.totalLength;
                let pathLength =  this.pathLength || totalLength;
                const dashGroup: DashGroup[] = [];
                let valueOffset = $util.convertInt(this.strokeDashoffset);
                let dashLength = 0;
                const createDashGroup = (values: number[], offset: number, delay: number, duration = 0) => {
                    const items = this.flatStrokeDash(values, offset, totalLength, pathLength);
                    dashLength = Math.max(dashLength, items.length);
                    dashGroup.push({ items, delay, duration});
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
                    const revised: SvgAnimation[] = [];
                    const remainder = result[result.length - 1].remainder;
                    let modified = false;
                    let intervalMap: SvgIntervalMap | undefined;
                    if (sorted.length > 1) {
                        intervalMap = SvgAnimate.getIntervalMap(sorted, 'stroke-dasharray', 'stroke-dashoffset');
                        for (let i = 0; i < sorted.length; i++) {
                            if (intervalMap[sorted[i].attributeName]) {
                                const data = intervalMap[sorted[i].attributeName].get(sorted[i].delay);
                                if (data && data.find(item => item.animate === sorted[i]) === undefined) {
                                    sorted.splice(i--, 1);
                                }
                            }
                        }
                    }
                    if (remainder && sorted.some(item => SvgBuild.asAnimate(item) && item.attributeName === 'stroke-dashoffset')) {
                        path = this.extendLength(remainder, precision);
                        if (path !== '') {
                            const boxRect = SvgBuild.toBoxRect([this.value]);
                            const strokeOffset = Math.ceil(strokeWidth / 2);
                            clipPath = SvgBuild.drawRect(boxRect.right - boxRect.left, boxRect.bottom - boxRect.top + strokeOffset * 2, boxRect.left, boxRect.top - strokeOffset);
                            const previousLength = totalLength;
                            totalLength = getPathLength(path);
                            pathLength = this.pathLength;
                            if (pathLength > 0) {
                                pathLength *= totalLength / previousLength;
                            }
                            else {
                                pathLength = totalLength;
                            }
                            dashGroup.length = 0;
                            dashLength = 0;
                            result = createDashGroup(valueArray, valueOffset, 0);
                        }
                    }
                    function getFromToValue(group?: SvgStrokeDash) {
                        return group ? `${group.start} ${group.end}` : '1 1';
                    }
                    function getDashOffset(time: number, playing = false) {
                        if (intervalMap) {
                            const value = SvgAnimate.getIntervalValue(intervalMap, 'stroke-dashoffset', time, playing);
                            if (value) {
                                return parseFloat(value);
                            }
                        }
                        return valueOffset;
                    }
                    function getDashArray(time: number, playing = false) {
                        if (intervalMap) {
                            const value = SvgAnimate.getIntervalValue(intervalMap, 'stroke-dasharray', time, playing);
                            if (value) {
                                return SvgBuild.toNumberList(value);
                            }
                        }
                        return valueArray;
                    }
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
                        else if (SvgBuild.asAnimate(item)) {
                            switch (item.attributeName) {
                                case 'stroke-dasharray': {
                                    const valueTo = SvgBuild.toNumberList(item.valueTo);
                                    if (valueTo.length && !$util.isEqual(valueArray, valueTo)) {
                                        const arrayFrom = valueArray.slice(0);
                                        const arrayTo = valueTo.slice(0);
                                        const duration = item.duration;
                                        const groupArray: SvgAnimate[] = [];
                                        const values: string[][] = [];
                                        const keyTimes: number[] = [0];
                                        let baseFrom: SvgStrokeDash[];
                                        if (modified && intervalMap) {
                                            baseFrom = this.flatStrokeDash(getDashArray(item.delay, true), getDashOffset(item.delay, true), totalLength, pathLength);
                                        }
                                        else {
                                            baseFrom = result;
                                        }
                                        if (revised.find(animate => animate.id !== undefined && animate.attributeName === 'stroke-dasharray') === undefined) {
                                            let offset = valueOffset;
                                            for (let j = i; j < sorted.length; j++) {
                                                const next = sorted[j];
                                                if (next.attributeName === 'stroke-dasharray') {
                                                    if (intervalMap) {
                                                        const value = SvgAnimate.getIntervalValue(intervalMap, 'stroke-dashoffset', next.delay);
                                                        if (value) {
                                                            offset = parseFloat(value);
                                                        }
                                                    }
                                                    dashLength = Math.max(dashLength, this.flatStrokeDash(SvgBuild.toNumberList(SvgBuild.asAnimate(next) ? next.valueTo : next.to), offset, totalLength, pathLength).length);
                                                }
                                            }
                                        }
                                        for (let j = 0; j < dashLength; j++) {
                                            values[j] = [getFromToValue(baseFrom[j])];
                                            const animate = new SvgAnimate(this.element);
                                            animate.id = j;
                                            animate.attributeName = 'stroke-dasharray';
                                            animate.delay = item.delay;
                                            animate.duration = duration;
                                            animate.iterationCount = item.iterationCount;
                                            if (!item.fillReplace) {
                                                animate.fillMode = FILL_MODE.FORWARDS;
                                            }
                                            animate.values = values[j];
                                            groupArray.push(animate);
                                        }
                                        if (arrayFrom.length !== arrayTo.length) {
                                            const from = arrayFrom.length;
                                            const to = arrayTo.length;
                                            const multiple = $math.getLeastCommonMultiple([from, to]);
                                            for (const fromTo of [arrayFrom, arrayTo]) {
                                                const length = fromTo === arrayFrom ? from : to;
                                                for (let j = fromTo.length, k = 0; j < multiple; j++) {
                                                    fromTo.push(fromTo[k]);
                                                    if (++k === length) {
                                                        k = 0;
                                                    }
                                                }
                                            }
                                        }
                                        let offsetLength = Number.POSITIVE_INFINITY;
                                        for (let j = 0; j < arrayTo.length; j++) {
                                            const offset = arrayTo[j] - arrayFrom[j];
                                            if (offset !== 0) {
                                                offsetLength = Math.min(offsetLength, Math.abs(offset));
                                            }
                                        }
                                        const keyTimeIncrement = (duration / offsetLength) / duration;
                                        let keyTime = 0;
                                        let iterationFraction = offsetLength;
                                        let previousDashValues = arrayFrom;
                                        offsetLength = Math.floor(offsetLength);
                                        do {
                                            let dashValues: number[];
                                            keyTime += keyTimeIncrement;
                                            if (iterationFraction > 1 && keyTime < 1) {
                                                dashValues = [];
                                                for (let j = 0; j < arrayTo.length; j++) {
                                                    const increment = Math.abs(arrayTo[j] - arrayFrom[j]) / offsetLength;
                                                    if (arrayTo[j] > arrayFrom[j]) {
                                                        dashValues.push(previousDashValues[j] + increment);
                                                    }
                                                    else if (arrayTo[j] < arrayFrom[j]) {
                                                        dashValues.push(previousDashValues[j] - increment);
                                                    }
                                                    else {
                                                        dashValues.push(arrayTo[j]);
                                                    }
                                                }
                                            }
                                            else {
                                                dashValues = arrayTo;
                                            }
                                            const nextGroup = this.flatStrokeDash(dashValues, valueOffset, totalLength, pathLength);
                                            for (let j = 0; j < dashLength; j++) {
                                                values[j].push(getFromToValue(nextGroup[j]));
                                            }
                                            if (dashValues !== arrayTo) {
                                                iterationFraction--;
                                                previousDashValues = dashValues;
                                            }
                                            else {
                                                keyTime = 1;
                                            }
                                            keyTimes.push(keyTime);
                                        }
                                        while (keyTime < 1);
                                        if (item.fillReplace) {
                                            if (item.iterationCount !== -1) {
                                                if (modified && intervalMap) {
                                                    const totalDuration = item.getTotalDuration();
                                                    baseFrom = this.flatStrokeDash(getDashArray(totalDuration), getDashOffset(totalDuration), totalLength, pathLength);
                                                }
                                                for (let j = 0; j < dashLength; j++) {
                                                    groupArray[j].baseFrom = getFromToValue(baseFrom[j]);
                                                }
                                            }
                                        }
                                        for (let j = 0; j < dashLength; j++) {
                                            const index = values[j].findIndex(value => value !== '1 1');
                                            let adjustedKeyTimes: number[];
                                            if (index > 0) {
                                                const previous = $util.replaceMap<string, number>(values[j][index - 1].split(' '), value => parseFloat(value));
                                                const next = $util.replaceMap<string, number>(values[j][index].split(' '), value => parseFloat(value));
                                                values[j].splice(index, 0, `${(previous[0] + next[0]) / 2} ${(previous[1] + next[1]) / 2}`);
                                                adjustedKeyTimes = keyTimes.slice(0);
                                                adjustedKeyTimes.splice(index, 0, (keyTimes[index - 1] + keyTimes[index]) / 2);
                                            }
                                            else {
                                                adjustedKeyTimes = keyTimes;
                                            }
                                            groupArray[j].values = values[j];
                                            groupArray[j].keyTimes = adjustedKeyTimes;
                                            groupArray[j].timingFunction = item.timingFunction;
                                        }
                                        revised.push(...groupArray);
                                        modified = true;
                                    }
                                    continue;
                                }
                                case 'stroke-dashoffset': {
                                    const offsetFrom = getDashOffset(item.delay);
                                    const valueTo = parseFloat(item.valueTo);
                                    const iterationCount = (Math.abs(valueTo - offsetFrom) / totalLength) * (totalLength / pathLength);
                                    const keyTimeInterval = item.duration / (iterationCount * item.duration);
                                    const values: string[] = [];
                                    const keyTimes: number[] = [];
                                    const repeatFraction = 1 / item.duration;
                                    let keyTime = 0;
                                    for (let j = iterationCount; ; j--) {
                                        const start = keyTime + (keyTime !== 0 ? repeatFraction : 0);
                                        keyTimes.push(start);
                                        if (j > 1) {
                                            if (valueTo < offsetFrom) {
                                                values.push('0', '1');
                                            }
                                            else {
                                                values.push('1', '0');
                                            }
                                            keyTime = Math.min(keyTime + keyTimeInterval, 1);
                                            if (keyTime + repeatFraction >= 1) {
                                                keyTime = 1;
                                            }
                                        }
                                        else {
                                            if (valueTo < offsetFrom) {
                                                values.push('0', j.toString());
                                            }
                                            else {
                                                values.push('1', (1 - j).toString());
                                            }
                                            keyTime = 1;
                                        }
                                        keyTimes.push(keyTime);
                                        if (keyTime === 1) {
                                            break;
                                        }
                                    }
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
                        let groupFrom: DashGroup | undefined;
                        for (let i = 0; i < dashGroup.length; i++) {
                            const groupTo = dashGroup[i];
                            if (groupFrom) {
                                const delay = groupTo.delay;
                                const duration = groupTo.duration;
                                for (let j = 0; j < dashLength; j++) {
                                    const animate = new SvgAnimation(this.element);
                                    animate.id = j;
                                    animate.attributeName = 'stroke-dasharray';
                                    animate.baseFrom = getFromToValue(result[j]);
                                    animate.delay = delay;
                                    animate.to = getFromToValue(groupTo.items[j]);
                                    animate.duration = duration;
                                    animate.fillFreeze = duration === 0;
                                    revised.push(animate);
                                }
                            }
                            else {
                                for (let j = groupTo.items.length; j < dashLength; j++) {
                                    groupTo.items.push({ start: 1, end: 1 });
                                }
                            }
                            groupFrom = groupTo;
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
        if (this.value !== '' && this._totalLength === 0) {
            this._totalLength = getPathLength(this.value);
        }
        return this._totalLength;
    }

    get instanceType() {
        return INSTANCE_TYPE.SVG_PATH;
    }
}