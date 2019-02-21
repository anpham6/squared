import { SvgPoint, SvgStrokeDash, SvgTransform, SvgTransformExclude, SvgTransformResidual } from './@types/object';

import SvgBaseVal$MX from './svgbaseval-mx';
import SvgPaint$MX from './svgpaint-mx';
import SvgAnimate from './svganimate';
import SvgAnimation from './svganimation';
import SvgBuild from './svgbuild';
import SvgElement from './svgelement';

import { INSTANCE_TYPE, REGION_UNIT } from './lib/constant';
import { SVG, TRANSFORM } from './lib/util';

type SvgContainer = squared.svg.SvgContainer;
type SvgShapePattern = squared.svg.SvgShapePattern;

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
    public pathLength!: string;
    public transformed: SvgTransform[] | null = null;
    public transformResidual?: SvgTransform[][];

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
        if (valueArray.length) {
            if (!pathLength) {
                pathLength = totalLength;
            }
            valueOffset %= totalLength;
            if (valueOffset < 0) {
                valueOffset += totalLength;
            }
            let dashLength = 0;
            for (let i = 0, j = 0; ; i += dashLength, j++) {
                dashLength = valueArray[j % valueArray.length];
                if (i + dashLength > valueOffset && j % 2 === 0) {
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
                    const start = $util.truncatePrecision(startOffset / pathLength);
                    if (start < 1) {
                        const end = $util.truncatePrecision(Math.min(start + (actualLength / pathLength), 1));
                        result.push({ start, end });
                    }
                    else {
                        break;
                    }
                }
            }
            if (result.length === 0) {
                result.push({ start: 1, end: 1 });
            }
        }
        return result;
    }

    public extractStrokeDash(animations?: SvgAnimation[]) {
        let valueArray = SvgBuild.toNumberList(this.strokeDasharray);
        if (valueArray.length) {
            const totalLength = this.totalLength;
            const pathLength = $util.convertInt(this.pathLength) || totalLength;
            const dashGroup: SvgStrokeDash[][] = [];
            const dashDelay: number[] = [];
            const dashDuration: number[] = [];
            let valueOffset = $util.convertInt(this.strokeDashoffset);
            let dashLength = 0;
            const createDashGroup = (values: number[], offset: number, delay: number, duration = 0) => {
                const group = this.flatStrokeDash(values, offset, totalLength, pathLength);
                dashLength = Math.max(dashLength, group.length);
                dashGroup.push(group);
                dashDelay.push(delay);
                dashDuration.push(duration);
                return group;
            };
            function getFromToValue(group?: SvgStrokeDash) {
                return group ? `${group.start} ${group.end}` : '1 1';
            }
            function getTimingFunction(item: SvgAnimate) {
                return item.keySplines && item.keySplines.length ? item.keySplines[0] : item.timingFunction;
            }
            function getDashLength(values: number[]) {
                return Math.ceil(totalLength / (values.length === 1 ? values[0] * 2 : values.reduce((a, b) => a + b, 0)));
            }
            const result = createDashGroup(valueArray, valueOffset, 0);
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
                function setDashLength() {
                    for (const item of sorted) {
                        if (item.attributeName === 'stroke-dasharray') {
                            if (SvgBuild.asSet(item)) {
                                dashLength = Math.max(dashLength, getDashLength(SvgBuild.toNumberList(item.to)));
                            }
                            else if (SvgBuild.asAnimate(item)) {
                                dashLength = Math.max(dashLength, getDashLength(SvgBuild.toNumberList(item.valueTo)));
                            }
                        }
                    }
                }
                for (let i = 0; i < sorted.length; i++) {
                    const item = sorted[i];
                    if (SvgBuild.asSet(item) && item.to !== '') {
                        let valid = true;
                        switch (item.attributeName) {
                            case 'stroke-dasharray':
                                valueArray = SvgBuild.toNumberList(item.to);
                                break;
                            case 'stroke-dashoffset':
                                valueOffset = $util.convertInt(item.to);
                                break;
                            default:
                                valid = false;
                                break;
                        }
                        if (valid) {
                            createDashGroup(valueArray, valueOffset, item.delay, item.fillReplace && item.duration > 0 ? item.duration : 0);
                            continue;
                        }
                    }
                    else if (SvgBuild.asAnimate(item) && item.valueTo !== '') {
                        const timingFunction = getTimingFunction(<SvgAnimate> item);
                        switch (item.attributeName) {
                            case 'stroke-dasharray': {
                                const valueTo = SvgBuild.toNumberList(item.valueTo)[0];
                                if (!isNaN(valueTo)) {
                                    let offsetLength = Math.abs(valueTo - valueArray[0]);
                                    if (offsetLength > 0) {
                                        setDashLength();
                                        const groupArray: SvgAnimate[] = [];
                                        const values: string[][] = [];
                                        const keyTimes: number[] = [0];
                                        for (let j = 0; j < dashLength; j++) {
                                            values[j] = [getFromToValue(result[j])];
                                            const animate = new SvgAnimate(this.element);
                                            animate.id = j;
                                            animate.attributeName = 'stroke-dasharray';
                                            animate.delay = item.delay;
                                            animate.duration = item.duration;
                                            animate.fillForwards = true;
                                            animate.values = values[j];
                                            groupArray.push(animate);
                                        }
                                        const increment = (item.duration / offsetLength) / item.duration;
                                        const increasing = valueTo > valueArray[0];
                                        let value = valueArray[0];
                                        let keyTime = 0;
                                        do {
                                            value += increasing ? Math.min(offsetLength, 1) : Math.max(-offsetLength, -1);
                                            const nextGroup = this.flatStrokeDash([value], valueOffset, totalLength, pathLength);
                                            for (let j = 0; j < dashLength; j++) {
                                                values[j].push(getFromToValue(nextGroup[j]));
                                            }
                                            keyTime += increment;
                                            keyTimes.push(keyTime);
                                        }
                                        while (--offsetLength > 0);
                                        if (item.fillReplace) {
                                            for (let j = 0; j < dashLength; j++) {
                                                values[j].push(getFromToValue(result[j]));
                                            }
                                            keyTimes[keyTimes.length - 1] = 1 - 1 / item.duration;
                                            keyTimes.push(1);
                                        }
                                        else {
                                            keyTimes[keyTimes.length - 1] = 1;
                                            valueArray = [valueTo];
                                        }
                                        for (let j = 0; j < dashLength; j++) {
                                            groupArray[j].values = values[j];
                                            groupArray[j].keyTimes = keyTimes;
                                            groupArray[j].timingFunction = timingFunction;
                                        }
                                        revised.push(...groupArray);
                                    }
                                }
                                continue;
                            }
                            case 'stroke-dashoffset': {
                                const valueTo = parseFloat(item.valueTo);
                                const iterationCount = (Math.abs(valueTo - valueOffset) / totalLength) * (totalLength / pathLength);
                                const keyTimeInterval = item.duration / (iterationCount * item.duration);
                                const values: string[] = [];
                                const keyTimes: number[] = [];
                                let keyTime = 0;
                                for (let j = iterationCount; j > 0; j--) {
                                    keyTimes.push(keyTime + (keyTime !== 0 ? 1 / item.duration : 0));
                                    if (j > 1) {
                                        if (valueTo < valueOffset) {
                                            values.push('0', '1');
                                        }
                                        else {
                                            values.push('1', '0');
                                        }
                                        keyTime += keyTimeInterval;
                                    }
                                    else {
                                        if (valueTo < valueOffset) {
                                            values.push('0', j.toString());
                                        }
                                        else {
                                            values.push('1', (1 - j).toString());
                                        }
                                        keyTime = 1;
                                    }
                                    keyTimes.push(keyTime);
                                }
                                item.values = values;
                                item.keyTimes = keyTimes;
                                if (timingFunction) {
                                    item.timingFunction = timingFunction;
                                    item.keySplines = undefined;
                                }
                                break;
                            }
                        }
                    }
                    revised.push(item);
                }
                if (dashLength > 0) {
                    let groupFrom: SvgStrokeDash[] | undefined;
                    for (let i = 0; i < dashGroup.length; i++) {
                        const groupTo = dashGroup[i];
                        if (groupFrom) {
                            if (dashDelay[i] !== -1) {
                                const duration = dashDuration[i];
                                for (let j = 0; j < dashLength; j++) {
                                    const animate = new SvgAnimation(this.element);
                                    animate.id = j;
                                    animate.attributeName = 'stroke-dasharray';
                                    animate.baseFrom = getFromToValue(result[j]);
                                    animate.delay = dashDelay[i];
                                    animate.to = getFromToValue(groupTo[j]);
                                    animate.duration = duration;
                                    animate.fillFreeze = duration === 0;
                                    revised.push(animate);
                                }
                            }
                        }
                        else {
                            for (let j = groupTo.length; j < dashLength; j++) {
                                groupTo.push({ start: 1, end: 1 });
                            }
                        }
                        groupFrom = groupTo;
                    }
                    animations.length = 0;
                    animations.push(...revised);
                }
            }
            return result;
        }
        return undefined;
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
        this.setAttribute('pathLength');
    }

    get transforms() {
        if (this._transforms === undefined) {
            this._transforms = SvgBuild.filterTransforms(TRANSFORM.parse(this.element) || SvgBuild.convertTransforms(this.element.transform.baseVal));
        }
        return this._transforms;
    }

    get totalLength() {
        if (this.value !== '' && this._totalLength === 0) {
            let element: SVGPathElement;
            if (SVG.path(this.element)) {
                element = this.element;
            }
            else {
                element = document.createElementNS('http://www.w3.org/2000/svg', 'path');
                element.setAttribute('d', this.value);
            }
            this._totalLength = element.getTotalLength();
        }
        return this._totalLength;
    }

    get instanceType() {
        return INSTANCE_TYPE.SVG_PATH;
    }
}