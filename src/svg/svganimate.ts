import SvgAnimation from './svganimation';
import SvgBuild from './svgbuild';

import { PATTERN_CUBICBEZIER } from './lib/util';

const { convertHex, parseColor } = squared.lib.color;
const { getFontSize, hasEm, isLength, parseUnit } = squared.lib.css;
const { getNamedItem } = squared.lib.dom;
const { lastItemOf, replaceMap, splitSome } = squared.lib.util;

const { trimEnd } = squared.base.lib.util;

const REGEXP_BEZIER = new RegExp(`^(?:^|\\s+)${PATTERN_CUBICBEZIER}(?:$|\\s+)$`);
const REGEXP_BEZIERCSS = new RegExp(`cubic-bezier\\(${PATTERN_CUBICBEZIER}\\)`);

const invertControlPoint = (value: number) => +(1 - value).toPrecision(5);

export default class SvgAnimate extends SvgAnimation implements squared.svg.SvgAnimate {
    public static KEYSPLINE_NAME = {
        'ease': '0.25 0.1 0.25 1',
        'ease-in': '0.42 0 1 1',
        'ease-in-out': '0.42 0 0.58 1',
        'ease-out': '0 0 0.58 1',
        'linear': '0 0 1 1',
        'step-start': '0 1 0 1',
        'step-end': '1 0 1 0'
    };

    public static getSplitValue(value: number, next: number, percent: number) {
        return value + (next - value) * percent;
    }

    public static findTimingFunction(value: string) {
        const keySpline = SvgAnimate.KEYSPLINE_NAME[value] as Undef<string>;
        if (keySpline) {
            return keySpline;
        }
        else if (REGEXP_BEZIER.test(value)) {
            return value.trim();
        }
        else if (value.startsWith('step')) {
            return SvgAnimate.KEYSPLINE_NAME.linear;
        }
        const match = REGEXP_BEZIERCSS.exec(value);
        return match ? match[1] + ' ' + match[2] + ' ' + match[3] + ' ' + match[4] : SvgAnimate.KEYSPLINE_NAME.ease;
    }

    public static fromStepTimingFunction(element: SVGElement, attributeName: string, timingFunction: string, keyTimes: number[], values: string[], index: number): Null<[number[], string[]]> {
        const valueA = values[index];
        const valueB = values[index + 1];
        const checkOptions = (value: string) => hasEm(value) ? { fontSize: getFontSize(element) } : undefined;
        let currentValue: Undef<unknown[]>,
            nextValue: Undef<unknown[]>;
        switch (attributeName) {
            case 'fill':
            case 'stroke': {
                const start = parseColor(valueA);
                const end = parseColor(valueB);
                if (start && end) {
                    currentValue = [start];
                    nextValue = [end];
                }
                break;
            }
            case 'points':
                currentValue = SvgBuild.convertPoints(SvgBuild.parseCoordinates(valueA));
                nextValue = SvgBuild.convertPoints(SvgBuild.parseCoordinates(valueB));
                break;
            case 'rotate':
            case 'scale':
            case 'translate':
                currentValue = [];
                nextValue = [];
                splitSome(valueA, value => {
                    currentValue!.push(+value);
                }, /\s+/g);
                splitSome(valueB, value => {
                    nextValue!.push(+value);
                }, /\s+/g);
                break;
            default: {
                let n = +valueA;
                if (!isNaN(n)) {
                    currentValue = [n];
                }
                else if (isLength(valueA)) {
                    currentValue = [parseUnit(valueA, checkOptions(valueA))];
                }
                if (!isNaN(n = +valueB)) {
                    nextValue = [n];
                }
                else if (isLength(valueB)) {
                    nextValue = [parseUnit(valueB, checkOptions(valueB))];
                }
                break;
            }
        }
        if (currentValue && nextValue) {
            const length = currentValue.length;
            if (length === nextValue.length) {
                switch (timingFunction) {
                    case 'step-start':
                        timingFunction = 'steps(1, start)';
                        break;
                    case 'step-end':
                        timingFunction = 'steps(1, end)';
                        break;
                }
                const match = /steps\((\d+)(?:,\s*(start|end|jump-(?:start|end|both|none)))?\)/.exec(timingFunction);
                if (match) {
                    const keyTimeTotal = keyTimes[index + 1] - keyTimes[index];
                    const stepSize = +match[1];
                    const interval = 100 / stepSize;
                    const stepCount = stepSize + 1;
                    const splitTimes: number[] = new Array(stepCount);
                    const splitValues: string[] = new Array(stepCount);
                    for (let i = 0; i < stepCount; ++i) {
                        let offset = 0;
                        switch (match[2]) {
                            case 'start':
                            case 'jump-start':
                                if (i === 0) {
                                    offset = 1;
                                }
                                break;
                            case 'jump-both':
                                if (i < stepCount - 1) {
                                    offset = 1 / stepCount;
                                }
                                break;
                            case 'jump-none':
                                if (i > 0) {
                                    offset = 1 / stepSize;
                                }
                                break;
                        }
                        const time = keyTimes[index] + keyTimeTotal * (i / stepSize);
                        const percent = (interval * (i + offset)) / 100;
                        let result = '';
                        switch (attributeName) {
                            case 'fill':
                            case 'stroke': {
                                const rgbaA = (currentValue[0] as ColorData).rgba;
                                const rgbaB = (nextValue[0] as ColorData).rgba;
                                result = convertHex({
                                    r: SvgAnimate.getSplitValue(rgbaA.r, rgbaB.r, percent),
                                    g: SvgAnimate.getSplitValue(rgbaA.g, rgbaB.g, percent),
                                    b: SvgAnimate.getSplitValue(rgbaA.b, rgbaB.b, percent),
                                    a: SvgAnimate.getSplitValue(rgbaA.a, rgbaB.a, percent)
                                });
                                break;
                            }
                            case 'points':
                                for (let j = 0; j < length; ++j) {
                                    const current = currentValue[j] as Point;
                                    const next = nextValue[j] as Point;
                                    result += (j > 0 ? ' ' : '') + SvgAnimate.getSplitValue(current.x, next.x, percent) + ',' + SvgAnimate.getSplitValue(current.y, next.y, percent);
                                }
                                break;
                            default:
                                for (let j = 0; j < length; ++j) {
                                    result += (j > 0 ? ' ' : '') + SvgAnimate.getSplitValue(currentValue[j] as number, nextValue[j] as number, percent);
                                }
                                break;
                        }
                        if (result) {
                            splitTimes[i] = time;
                            splitValues[i] = result;
                        }
                        else {
                            return null;
                        }
                    }
                    return [splitTimes, splitValues];
                }
            }
        }
        return null;
    }

    public static toFractionList(value: string, delimiter = ';', ordered = true) {
        let previous = 0;
        const result = replaceMap(value.split(delimiter), seg => {
            const fraction = +seg;
            if (!isNaN(fraction) && (!ordered || fraction >= previous && fraction <= 1)) {
                previous = fraction;
                return fraction;
            }
            return -1;
        });
        return result.length > 1 && (!ordered || result[0] === 0 && result.some(percent => percent !== -1)) ? result : [];
    }

    public type = 0;
    public additiveSum = false;
    public accumulateSum = false;
    public by?: number;
    public end?: number;
    public synchronized?: NumberValue;
    public readonly instanceType = squared.svg.constant.INSTANCE_TYPE.SVG_ANIMATE;

    protected _reverse = false;
    protected _alternate = false;
    protected _values: Null<string[]> = null;
    protected _keyTimes: Null<number[]> = null;
    protected _keySplines: Null<string[]> = null;

    private _iterationCount = 1;
    private _from = '';
    private _setterType = false;
    private _repeatDuration = -1;
    private _timingFunction = '';

    constructor(element?: SVGGraphicsElement, animationElement?: SVGAnimateElement) {
        super(element, animationElement);
        if (animationElement) {
            const values = getNamedItem(animationElement, 'values');
            const keyTimes = this.duration !== -1 ? SvgAnimate.toFractionList(getNamedItem(animationElement, 'keyTimes')) : [];
            if (values) {
                const valuesData = trimEnd(values, ';').split(/\s*;\s*/);
                this.values = valuesData;
                const length = valuesData.length;
                if (length > 1 && length === keyTimes.length) {
                    this.from = valuesData[0];
                    this.to = valuesData[length - 1];
                    this.keyTimes = keyTimes;
                }
                else if (length === 1) {
                    this.to = this.values[0];
                    this.convertToValues();
                }
            }
            else {
                this.from = getNamedItem(animationElement, 'from');
                this.convertToValues(keyTimes);
            }
            const repeatDur = getNamedItem(animationElement, 'repeatDur');
            if (repeatDur && repeatDur !== 'indefinite') {
                const value = SvgAnimation.parseClockTime(repeatDur);
                if (!isNaN(value) && value > 0) {
                    this._repeatDuration = value;
                }
            }
            const repeatCount = getNamedItem(animationElement, 'repeatCount');
            this.iterationCount = repeatCount === 'indefinite' ? -1 : +repeatCount || 0;
            if (animationElement.tagName.toLowerCase() === 'animate') {
                this.setCalcMode();
            }
        }
    }

    public setCalcMode(attributeName?: string, mode?: string) {
        const animationElement = this.animationElement;
        if (animationElement) {
            switch (mode ||= getNamedItem(animationElement, 'calcMode') || 'linear') {
                case 'discrete': {
                    const keyTimesBase = this.keyTimes;
                    if (keyTimesBase[0] === 0 && keyTimesBase.length === 2) {
                        const valuesBase = this.values;
                        const keyTimes: number[] = [],
                            values: string[] = [];
                        for (let i = 0, length = keyTimesBase.length - 1; i < length; ++i) {
                            const result = SvgAnimate.fromStepTimingFunction(animationElement, attributeName || this.attributeName, 'step-end', keyTimesBase, valuesBase, i);
                            if (result) {
                                keyTimes.push(...result[0]);
                                values.push(...result[1]);
                            }
                        }
                        keyTimes.push(keyTimesBase.pop()!);
                        values.push(valuesBase.pop()!);
                        this._values = values;
                        this._keyTimes = keyTimes;
                        this._keySplines = [SvgAnimate.KEYSPLINE_NAME['step-end']];
                    }
                    break;
                }
                case 'paced':
                    this._keySplines = null;
                    break;
                case 'spline': {
                    const keySplines: string[] = [];
                    splitSome(getNamedItem(animationElement, 'keySplines'), value => {
                        keySplines.push(value);
                    }, ';');
                    this.keySplines = keySplines;
                }
                case 'linear': {
                    const current = this.keyTimes;
                    if (current[0] !== 0 && lastItemOf(current) !== 1) {
                        const length = this.values.length;
                        const keyTimes: number[] = new Array(length);
                        for (let i = 0; i < length; ++i) {
                            keyTimes[i] = i / (length - 1);
                        }
                        this._keyTimes = keyTimes;
                        this._keySplines = null;
                    }
                    break;
                }
            }
        }
    }

    public convertToValues(keyTimes?: number[]) {
        const to = this.to;
        if (to) {
            this.values = [this.from, to];
            if (keyTimes && keyTimes.length === 2) {
                const keyTimesBase = this.keyTimes;
                if (keyTimesBase.length !== 2 || keyTimesBase[0] === 0 && keyTimesBase[1] <= 1) {
                    this.keyTimes = keyTimes;
                    return;
                }
            }
            this.keyTimes = [0, 1];
        }
    }

    public setGroupOrdering(value: SvgAnimationAttribute[]) {
        this.group.ordering = value;
        if (this.fillBackwards) {
            const name = this.group.name;
            let found: Undef<boolean>;
            for (let i = value.length - 1; i >= 0; --i) {
                const item = value[i];
                if (found) {
                    if (item.fillMode !== 'forwards') {
                        this.fillBackwards = false;
                        break;
                    }
                }
                else if (item.name === name) {
                    found = true;
                }
            }
        }
    }

    public getIntervalEndTime(leadTime: number, complete?: boolean) {
        const endTime = this.getTotalDuration();
        if (leadTime < endTime) {
            const { duration, keyTimes } = this;
            let delay = this.delay;
            while (delay + duration <= leadTime) {
                delay += duration;
            }
            return Math.min(delay + (complete ? 1 : lastItemOf(keyTimes) || 0) * duration, endTime);
        }
        return endTime;
    }

    public getTotalDuration(minimum?: boolean) {
        let iterationCount = this.iterationCount;
        if (minimum && iterationCount === -1) {
            iterationCount = 1;
        }
        if (iterationCount !== -1) {
            return Math.min(this.delay + this.duration * iterationCount, this.end || Infinity);
        }
        return Infinity;
    }

    set delay(value) {
        this._delay = value;
        const animationElement = this.animationElement;
        const end = animationElement && getNamedItem(animationElement, 'end');
        if (end) {
            const endTime = SvgAnimation.getClockTimes(end)[0];
            if (!isNaN(endTime)) {
                const { duration, iterationCount } = this;
                if (iterationCount === -1 || duration > 0 && endTime < duration * iterationCount) {
                    if (value > endTime) {
                        this.end = endTime;
                        if (iterationCount === -1) {
                            this.iterationCount = Math.ceil((endTime - value) / duration);
                        }
                    }
                    else {
                        this.duration = -1;
                    }
                }
            }
        }
    }
    get delay() {
        return this._delay;
    }

    set duration(value) {
        super.duration = value;
    }
    get duration() {
        const value = this._duration;
        return value === -1 && this._repeatDuration !== -1 ? this._repeatDuration : value;
    }

    set to(value) {
        this._to = value;
    }
    get to() {
        return this._setterType ? this.valueTo || this._to : this.setterType ? this.values[0] : this._to;
    }

    get from() {
        return this._from;
    }
    set from(value) {
        if (!this._values) {
            const animationElement = this.animationElement;
            if (animationElement) {
                if (!this.to) {
                    const by = getNamedItem(animationElement, 'by');
                    const byCoords = SvgBuild.parseCoordinates(by);
                    if (byCoords.length && (value ||= this.baseValue || '')) {
                        const fromCoords = SvgBuild.parseCoordinates(value);
                        const length = fromCoords.length;
                        if (byCoords.length === length) {
                            let to = '';
                            for (let i = 0; i < length; ++i) {
                                to += (i > 0 ? ',' : '') + (fromCoords[i] + byCoords[i]);
                            }
                            this.to = to;
                        }
                    }
                }
                if (SvgBuild.parseCoordinates(this.to).length) {
                    this.setAttribute('additive', 'sum');
                }
            }
        }
        this._from = value;
    }

    set iterationCount(value) {
        this._iterationCount = isNaN(value) ? 1 : value;
        const animationElement = this.animationElement;
        if (animationElement) {
            if (this.iterationCount !== -1) {
                this.setAttribute('accumulate', 'sum');
                this.fillFreeze = getNamedItem(animationElement, 'fill') === 'freeze';
            }
            else {
                this.accumulateSum = false;
                this.fillFreeze = false;
            }
        }
    }
    get iterationCount() {
        const duration = this.duration;
        if (duration > 0) {
            const iterationCount = this._iterationCount;
            const repeatDuration = this._repeatDuration;
            if (repeatDuration !== -1 && (iterationCount === -1 || repeatDuration < iterationCount * duration)) {
                return repeatDuration / duration;
            }
            return iterationCount;
        }
        return 1;
    }

    set values(value) {
        this._values = value;
        if (value && value.length !== this.keyTimes.length) {
            this._keyTimes = null;
            this._keySplines = null;
        }
    }
    get values() {
        return this._values ||= [];
    }

    set keyTimes(value) {
        const values = this._values;
        if ((!values || values.length === value.length) && value.every(fraction => fraction >= 0 && fraction <= 1)) {
            this._keyTimes = value;
        }
    }
    get keyTimes() {
        return this._keyTimes ||= [];
    }

    set keySplines(value) {
        if (value && value.length) {
            const minSegment = this.keyTimes.length - 1;
            if (value.length >= minSegment && !value.every(spline => !spline || spline === SvgAnimate.KEYSPLINE_NAME.linear)) {
                const keySplines: string[] = [];
                for (let i = 0; i < minSegment; ++i) {
                    const points: number[] = [];
                    splitSome(value[i], (pt: NumString) => {
                        if (!isNaN(pt = +pt)) {
                            points.push(pt);
                        }
                        else {
                            return true;
                        }
                    }, /\s+/g);
                    if (points.length === 4 && points[0] >= 0 && points[0] <= 1 && points[2] >= 0 && points[2] <= 1) {
                        keySplines.push(points.join(' '));
                    }
                    else {
                        keySplines.push(SvgAnimate.KEYSPLINE_NAME.linear);
                    }
                }
                this._keySplines = keySplines;
            }
        }
        else {
            this._keySplines = null;
        }
    }
    get keySplines() {
        return this._keySplines;
    }

    set timingFunction(value) {
        this._timingFunction = value ? SvgAnimate.findTimingFunction(value) : value;
    }
    get timingFunction() {
        return this._timingFunction || this.keySplines?.[0] || '';
    }

    set reverse(value) {
        if (this.length && value !== this._reverse) {
            const keyTimesBase = this.keyTimes;
            const keySplinesBase = this._keySplines;
            const length = keyTimesBase.length;
            const keyTimes: number[] = new Array(length);
            for (let i = length - 1, j = 0; i >= 0; --i) {
                keyTimes[j++] = 1 - keyTimesBase[i];
            }
            this.keyTimes = keyTimes;
            this.values.reverse();
            if (keySplinesBase) {
                const keySplines: string[] = [];
                for (let i = keySplinesBase.length - 1; i >= 0; --i) {
                    const points = replaceMap(keySplinesBase[i].split(' '), pt => +pt);
                    keySplines.push(points.length === 4 ? invertControlPoint(points[2]) + ' ' + invertControlPoint(points[3]) + ' ' + invertControlPoint(points[0]) + ' ' + invertControlPoint(points[1]) : SvgAnimate.KEYSPLINE_NAME.linear);
                }
                this._keySplines = keySplines;
            }
        }
        this._reverse = value;
    }
    get reverse() {
        return this._reverse;
    }

    set alternate(value) {
        this._alternate = value;
    }
    get alternate() {
        return this._alternate;
    }

    set setterType(value) {
        this._setterType = value;
    }
    get setterType() {
        if (this._setterType) {
            return true;
        }
        else if (this.animationElement && this.duration === 0) {
            const keyTimes = this.keyTimes;
            return keyTimes.length >= 2 && keyTimes[0] === 0 && this.values[0] !== '';
        }
        return false;
    }

    set length(value) {
        if (value === 0) {
            this._values = null;
        }
    }
    get length() {
        return this._values ? this._values.length : 0;
    }

    get valueTo() {
        return this._values && lastItemOf(this._values) || '';
    }

    get valueFrom() {
        return this.values[0] || '';
    }

    get playable() {
        return !this.paused && this.duration > 0 && this.keyTimes.length > 0;
    }

    get fillReplace() {
        return super.fillReplace || this.iterationCount === -1;
    }

    get fromToType() {
        const keyTimes = this.keyTimes;
        return keyTimes.length === 2 && keyTimes[0] === 0 && keyTimes[1] === 1;
    }

    get evaluateStart() {
        const keyTimes = this.keyTimes;
        return keyTimes.length > 0 && keyTimes[0] > 0;
    }

    get evaluateEnd() {
        const keyTimes = this.keyTimes;
        return keyTimes.length > 0 && lastItemOf(keyTimes)! < 1;
    }
}