import { SvgPoint, SvgStrokeDash, SvgTransform, SvgTransformExclude, SvgTransformResidual } from './@types/object';

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
                    const intervalMap = new SvgAnimationIntervalMap(sorted, 'stroke-dasharray', 'stroke-dashoffset');
                    const remainder = result[result.length - 1].remainder;
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
                                    const offsetFrom = getDashOffset(item.delay);
                                    const valueTo = parseFloat(item.valueTo);
                                    const iterationCount = (Math.abs(valueTo - offsetFrom) / totalLength) * (totalLength / pathLength);
                                    const keyTimeInterval = item.duration / (iterationCount * item.duration);
                                    const values: string[] = [];
                                    const keyTimes: number[] = [];
                                    const repeatFraction = 1 / item.duration;
                                    let keyTime = 0;
                                    for (let j = iterationCount; ; j--) {
                                        keyTimes.push(keyTime + (keyTime !== 0 ? repeatFraction : 0));
                                        if (j > 1) {
                                            if (valueTo < offsetFrom) {
                                                values.push('0', '1');
                                            }
                                            else {
                                                values.push('1', '0');
                                            }
                                            keyTime = keyTime + keyTimeInterval;
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
                        if (dashLength !== result.length) {
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
                                    const baseValue = dashGroup.length > 2 ? this.flatStrokeDash(getDashArray(delay), getDashOffset(delay), totalLength, pathLength) : result;
                                    for (let j = 0; j < dashLength; j++) {
                                        const animate = new SvgAnimation(this.element);
                                        animate.id = j;
                                        animate.attributeName = 'stroke-dasharray';
                                        animate.baseValue = getFromToValue(baseValue[j]);
                                        animate.delay = delay;
                                        animate.to = getFromToValue(items[j]);
                                        animate.duration = duration;
                                        animate.fillFreeze = duration === 0;
                                        revised.push(animate);
                                    }
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