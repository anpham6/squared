import { SvgAnimationAttribute } from './@types/object';

import SvgAnimation from './svganimation';
import SvgBuild from './svgbuild';

import { INSTANCE_TYPE, KEYSPLINE_NAME } from './lib/constant';

const $color = squared.lib.color;
const $css = squared.lib.css;
const $util = squared.lib.util;

function invertControlPoint(value: number) {
    return parseFloat((1 - value).toPrecision(5));
}

export default class SvgAnimate extends SvgAnimation implements squared.svg.SvgAnimate {
    public static getSplitValue(value: number, next: number, percent: number) {
        return value + (next - value) * percent;
    }

    public static convertStepTimingFunction(name: string, timingFunction: string, keyTimes: number[], values: string[], index: number, fontSize?: number): [number[], string[]] | undefined {
        let currentValue: any[] | undefined;
        let nextValue: any[] | undefined;
        switch (name) {
            case 'fill':
            case 'stroke':
                const colorStart = $color.parseColor(values[index]);
                const colorEnd = $color.parseColor(values[index + 1]);
                if (colorStart && colorEnd) {
                    currentValue = [colorStart];
                    nextValue = [colorEnd];
                }
                break;
            case 'points':
                currentValue = SvgBuild.convertPoints(SvgBuild.parseCoordinates(values[index]));
                nextValue = SvgBuild.convertPoints(SvgBuild.parseCoordinates(values[index + 1]));
                break;
            case 'rotate':
            case 'scale':
            case 'translate':
                currentValue = $util.replaceMap<string, number>(values[index].trim().split(/\s+/), value => parseFloat(value));
                nextValue = $util.replaceMap<string, number>(values[index + 1].trim().split(/\s+/), value => parseFloat(value));
                break;
            default:
                if ($util.isNumber(values[index])) {
                    currentValue = [parseFloat(values[index])];
                }
                else if ($util.isLength(values[index])) {
                    currentValue = [$util.parseUnit(values[index], fontSize)];
                }
                if ($util.isNumber(values[index + 1])) {
                    nextValue = [parseFloat(values[index + 1])];
                }
                else if ($util.isLength(values[index + 1])) {
                    nextValue = [$util.parseUnit(values[index + 1], fontSize)];
                }
                break;
        }
        if (currentValue && nextValue && currentValue.length && currentValue.length === nextValue.length) {
            switch (timingFunction)  {
                case 'step-start':
                    timingFunction = 'steps(1, start)';
                    break;
                case 'step-end':
                    timingFunction = 'steps(1, end)';
                    break;
            }
            const match = /steps\((\d+)(?:, (start|end))?\)/.exec(timingFunction);
            if (match) {
                const keyTimeTotal = keyTimes[index + 1] - keyTimes[index];
                const stepSize = parseInt(match[1]);
                const interval = 100 / stepSize;
                const splitTimes: number[] = [];
                const splitValues: string[] = [];
                for (let i = 0; i <= stepSize; i++) {
                    const offset = i === 0 && match[2] === 'start' ? 1 : 0;
                    const time = keyTimes[index] + keyTimeTotal * (i / stepSize);
                    const percent = (interval * (i + offset)) / 100;
                    const value: string[] = [];
                    switch (name) {
                        case 'fill':
                        case 'stroke': {
                            const current = <ColorData> currentValue[0];
                            const next = <ColorData> nextValue[0];
                            const rgb = $color.getHexCode(
                                SvgAnimate.getSplitValue(current.rgba.r, next.rgba.r, percent),
                                SvgAnimate.getSplitValue(current.rgba.g, next.rgba.g, percent),
                                SvgAnimate.getSplitValue(current.rgba.b, next.rgba.b, percent)
                            );
                            const a = $color.getHexCode(SvgAnimate.getSplitValue(current.rgba.a, next.rgba.a, percent));
                            value.push(`#${rgb + (a !== 'FF' ? a : '')}`);
                            break;
                        }
                        case 'points':
                            for (let j = 0; j < currentValue.length; j++) {
                                const current = <Point> currentValue[j];
                                const next = <Point> nextValue[j];
                                value.push(`${SvgAnimate.getSplitValue(current.x, next.x, percent)},${SvgAnimate.getSplitValue(current.y, next.y, percent)}`);
                            }
                            break;
                        default:
                            for (let j = 0; j < currentValue.length; j++) {
                                const current = currentValue[j] as number;
                                const next = nextValue[j] as number;
                                value.push(SvgAnimate.getSplitValue(current, next, percent).toString());
                            }
                            break;
                    }
                    if (value.length) {
                        splitTimes.push(time);
                        splitValues.push(value.join(' '));
                    }
                    else {
                        return undefined;
                    }
                }
                return [splitTimes, splitValues];
            }
        }
        return undefined;
    }

    public static toFractionList(value: string, delimiter = ';') {
        let previous = 0;
        const result = $util.flatMap(value.split(delimiter), seg => {
            const fraction = parseFloat(seg);
            if (!isNaN(fraction) && fraction >= previous && fraction <= 1) {
                previous = fraction;
                return fraction;
            }
            return -1;
        });
        return result.length > 1 && result[0] === 0 && result.some(percent => percent !== -1) ? result : [];
    }

    public type = 0;
    public from = '';
    public alternate = false;
    public additiveSum = false;
    public accumulateSum = false;
    public evaluateStart = false;
    public by?: number;
    public end?: number;
    public synchronized?: NumberValue<string>;
    public loopIntervals?: boolean[];

    private _iterationCount = 1;
    private _reverse = false;
    private _setterType = false;
    private _repeatDuration = -1;
    private _values?: string[];
    private _keyTimes?: number[];
    private _keySplines?: string[];
    private _timingFunction?: string;

    constructor(element?: SVGGraphicsElement, animationElement?: SVGAnimateElement) {
        super(element, animationElement);
        if (animationElement) {
            const values = $css.getNamedItem(animationElement, 'values');
            const keyTimes = this.duration !== -1 ? SvgAnimate.toFractionList($css.getNamedItem(animationElement, 'keyTimes')) : [];
            if (values !== '') {
                this.values = $util.flatMap(values.split(';'), value => value.trim());
                if (this.length > 1 && keyTimes.length === this.length) {
                    this.from = this.values[0];
                    this.to = this.values[this.length - 1];
                    this.keyTimes = keyTimes;
                }
                else if (this.length === 1) {
                    this.to = this.values[0];
                    this.convertToValues();
                }
            }
            else {
                this.from = $css.getNamedItem(animationElement, 'from');
                if (this.to === '') {
                    const by = $css.getNamedItem(animationElement, 'by');
                    if ($util.isNumber(by)) {
                        if (this.from === '') {
                            if (this.baseValue) {
                                this.from = this.baseValue;
                            }
                            this.evaluateStart = true;
                        }
                        if ($util.isNumber(this.from)) {
                            this.to = (parseFloat(this.from) + parseFloat(by)).toString();
                        }
                    }
                }
                if ($util.isNumber(this.to)) {
                    this.setAttribute('additive', 'sum');
                }
                this.convertToValues(keyTimes);
            }
            const repeatDur = $css.getNamedItem(animationElement, 'repeatDur');
            if (repeatDur !== '' && repeatDur !== 'indefinite') {
                this._repeatDuration = SvgAnimation.convertClockTime(repeatDur);
            }
            const repeatCount = $css.getNamedItem(animationElement, 'repeatCount');
            this.iterationCount = repeatCount === 'indefinite' ? -1 : parseFloat(repeatCount);
            if (animationElement.tagName === 'animate') {
                this.setCalcMode(this.attributeName);
            }
        }
    }

    public setCalcMode(name: string) {
        switch ($css.getNamedItem(this.animationElement, 'calcMode')) {
            case 'discrete': {
                if (this.keyTimes.length === 2 && this.keyTimes[0] === 0) {
                    const keyTimes: number[] = [];
                    const values: string[] = [];
                    for (let i = 0; i < this.keyTimes.length - 1; i++) {
                        const result = SvgAnimate.convertStepTimingFunction(name, 'step-end', this.keyTimes, this.values, i, $css.getFontSize(this.animationElement));
                        if (result) {
                            $util.concatArray(keyTimes, result[0]);
                            $util.concatArray(values, result[1]);
                        }
                    }
                    keyTimes.push(this.keyTimes.pop() as number);
                    values.push(this.values.pop() as string);
                    this.values = values;
                    this.keyTimes = keyTimes;
                    this._keySplines = [KEYSPLINE_NAME['step-end']];
                }
                break;
            }
            case 'spline':
                this.keySplines = $util.flatMap($css.getNamedItem(this.animationElement, 'keySplines').split(';'), value => value.trim());
            case 'linear':
                if (this.keyTimes[0] !== 0 && this.keyTimes[this.keyTimes.length - 1] !== 1) {
                    const keyTimes: number[] = [];
                    const length = this.values.length;
                    for (let i = 0; i < length; i++) {
                        keyTimes.push(i / (length - 1));
                    }
                    this._keyTimes = keyTimes;
                    this._keySplines = undefined;
                }
                break;
        }
    }

    public convertToValues(keyTimes?: number[]) {
        if (this.to) {
            this.values = [this.from, this.to];
            this.keyTimes = keyTimes && keyTimes.length === 2 && this.keyTimes[0] === 0 && this.keyTimes[1] <= 1 ? keyTimes : [0, 1];
            if (this.from === '') {
                this.evaluateStart = true;
            }
        }
    }

    public isLoop(index: number) {
        return !!this.loopIntervals && this.loopIntervals[index] === true;
    }

    public setGroupOrdering(value: SvgAnimationAttribute[]) {
        this.group.ordering = value;
        if (this.fillBackwards) {
            for (let i = value.length - 1, found = false; i >= 0; i--) {
                if (found) {
                    if (value[i].fillMode === 'backwards' || value[i].fillMode === 'both') {
                        this.fillBackwards = false;
                        break;
                    }
                }
                else if (value[i].name === this.group.name) {
                    found = true;
                }
            }
        }
    }

    public getIntervalEndTime(leadTime: number) {
        const endTime = this.getTotalDuration();
        if (leadTime < endTime) {
            const duration = this.duration;
            let time = this.delay;
            while (time + duration <= leadTime) {
                time += duration;
            }
            return Math.min(time + this.keyTimes[this.keyTimes.length - 1] * this.duration, endTime);
        }
        return endTime;
    }

    public getTotalDuration(minimum = false) {
        const iterationCount = minimum && this.iterationCount === -1 ? 1 : this.iterationCount;
        if (iterationCount !== -1) {
            return Math.min(this.delay + this.duration * iterationCount, this.end || Number.POSITIVE_INFINITY);
        }
        return Number.POSITIVE_INFINITY;
    }

    set delay(value) {
        super.delay = value;
        const end = $css.getNamedItem(this.animationElement, 'end');
        if (end) {
            const endTime = $util.sortNumber($util.replaceMap<string, number>(end.split(';'), time => SvgAnimation.convertClockTime(time)))[0];
            if (!isNaN(endTime) && (this.iterationCount === -1 || this.duration > 0 && endTime < this.duration * this.iterationCount)) {
                if (this.delay > endTime) {
                    this.end = endTime;
                    if (this.iterationCount === -1) {
                        this.iterationCount = Math.ceil((this.end - this.delay) / this.duration);
                    }
                }
                else {
                    this.duration = -1;
                }
            }
        }
    }
    get delay() {
        return super.delay;
    }

    set duration(value) {
        super.duration = value;
    }
    get duration() {
        const value = super.duration;
        if (value === -1 && this._repeatDuration !== -1) {
            return this._repeatDuration;
        }
        return value;
    }

    set iterationCount(value) {
        this._iterationCount = isNaN(value) ? 1 : value;
        this.fillFreeze = this.iterationCount !== -1 && $css.getNamedItem(this.animationElement, 'fill') === 'freeze';
        if (this.iterationCount !== 1) {
            this.setAttribute('accumulate', 'sum');
        }
        else {
            this.accumulateSum = false;
        }
    }
    get iterationCount() {
        if (this.duration > 0) {
            if (this._repeatDuration !== -1 && (this._iterationCount === -1 || this._repeatDuration < this._iterationCount * this.duration)) {
                return this._repeatDuration / this.duration;
            }
            return this._iterationCount;
        }
        return 1;
    }

    set to(value) {
        super.to = value;
    }
    get to() {
        if (this._setterType) {
            return this.valueTo || super.to;
        }
        return this.setterType ? this.values[0] : super.to;
    }

    set values(value) {
        this._values = value;
        if (this._keyTimes && this._keyTimes.length !== value.length) {
            this._keyTimes = undefined;
            this._keySplines = undefined;
        }
    }
    get values() {
        if (this._values === undefined) {
            this._values = [];
        }
        return this._values;
    }

    get valueTo() {
        return this._values ? this._values[this._values.length - 1] : '';
    }

    get valueFrom() {
        return this.values[0] || '';
    }

    set keyTimes(value) {
        if (value.every(fraction => fraction >= 0 && fraction <= 1) && (this._values === undefined || this._values.length === value.length)) {
            this._keyTimes = value;
        }
    }
    get keyTimes() {
        if (this._keyTimes === undefined) {
            this._keyTimes = [];
        }
        return this._keyTimes;
    }

    set keySplines(value) {
        if (value && value.length) {
            const minSegment = this.keyTimes.length - 1;
            if (value.length >= minSegment && !value.every(spline => spline === '' || spline === KEYSPLINE_NAME.linear)) {
                const keySplines: string[] = [];
                for (let i = 0; i < minSegment; i++) {
                    const points = $util.replaceMap<string, number>(value[i].split(' '), pt => parseFloat(pt));
                    if (points.length === 4 && !points.some(pt => isNaN(pt)) && points[0] >= 0 && points[0] <= 1 && points[2] >= 0 && points[2] <= 1) {
                        keySplines.push(points.join(' '));
                    }
                    else {
                        keySplines.push(KEYSPLINE_NAME.linear);
                    }
                }
                this._keySplines = keySplines;
            }
        }
        else {
            this._keySplines = undefined;
        }
    }
    get keySplines() {
        return this._keySplines;
    }

    set timingFunction(value) {
        this._timingFunction = value;
    }
    get timingFunction() {
        return this._timingFunction || this.keySplines && this.keySplines[0];
    }

    set reverse(value) {
        if (value !== this._reverse && this.length) {
            this.values.reverse();
            const keyTimes: number[] = [];
            for (const keyTime of this.keyTimes) {
                keyTimes.push(1 - keyTime);
            }
            keyTimes.reverse();
            this.keyTimes = keyTimes;
            if (this._keySplines) {
                const keySplines: string[] = [];
                for (let i = this._keySplines.length - 1; i >= 0; i--) {
                    const points = $util.replaceMap<string, number>(this._keySplines[i].split(' '), pt => parseFloat(pt));
                    if (points.length === 4) {
                        keySplines.push(`${invertControlPoint(points[2])} ${invertControlPoint(points[3])} ${invertControlPoint(points[0])} ${invertControlPoint(points[1])}`);
                    }
                    else {
                        keySplines.push(KEYSPLINE_NAME.linear);
                    }
                }
                this._keySplines = keySplines;
            }
            this._reverse = value;
        }
    }
    get reverse() {
        return this._reverse;
    }

    get playable() {
        return !this.paused && this.keyTimes && this.keyTimes.length > 1 && this.duration > 0;
    }

    get fillReplace() {
        return super.fillReplace || this.iterationCount === -1;
    }

    get fromToType() {
        return this.keyTimes.length === 2 && this.keyTimes[0] === 0 && this.keyTimes[1] === 1;
    }

    get partialType() {
        return this.keyTimes.length > 1 && this.keyTimes[this.keyTimes.length - 1] < 1;
    }

    set setterType(value) {
        this._setterType = value;
    }
    get setterType() {
        return this._setterType || this.animationElement !== null && this.duration === 0 && this.keyTimes.length >= 2 && this.keyTimes[0] === 0 && this.values[0] !== '';
    }

    get length() {
        return this._values ? this._values.length : 0;
    }

    get instanceType() {
        return INSTANCE_TYPE.SVG_ANIMATE;
    }
}