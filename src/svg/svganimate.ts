import type { SvgAnimationAttribute } from '../../@types/svg/object';

import SvgAnimation from './svganimation';
import SvgBuild from './svgbuild';

import { INSTANCE_TYPE, KEYSPLINE_NAME, STRING_CUBICBEZIER } from './lib/constant';

const $lib = squared.lib;

const { getHexCode, parseColor } = $lib.color;
const { getFontSize, isLength, parseUnit } = $lib.css;
const { getNamedItem } = $lib.dom;
const { CHAR, XML } = $lib.regex;
const { flatMap, isNumber, replaceMap, sortNumber, trimEnd } = $lib.util;

const REGEX_BEZIER = /^\s*[\d.]+\s+[\d.]+\s+[\d.]+\s+[\d.]+\s*$/;

const invertControlPoint = (value: number) => parseFloat((1 - value).toPrecision(5));

export default class SvgAnimate extends SvgAnimation implements squared.svg.SvgAnimate {
    public static getSplitValue(value: number, next: number, percent: number) {
        return value + (next - value) * percent;
    }

    public static convertTimingFunction(value: string) {
        const keySpline = KEYSPLINE_NAME[value];
        if (keySpline) {
            return keySpline;
        }
        else if (REGEX_BEZIER.test(value)) {
            return value;
        }
        else if (/^step/.test(value)) {
            return KEYSPLINE_NAME.linear;
        }
        else {
            const match = new RegExp(STRING_CUBICBEZIER).exec(value);
            return match ? match[1] + ' ' + match[2] + ' ' + match[3] + ' ' + match[4] : KEYSPLINE_NAME.ease;
        }
    }

    public static convertStepTimingFunction(attributeName: string, timingFunction: string, keyTimes: number[], values: string[], index: number, fontSize?: number): Undef<[number[], string[]]> {
        const valueA = values[index];
        const valueB = values[index + 1];
        let currentValue: Undef<any[]>;
        let nextValue: Undef<any[]>;
        switch (attributeName) {
            case 'fill':
            case 'stroke': {
                const colorStart = parseColor(valueA);
                const colorEnd = parseColor(valueB);
                if (colorStart && colorEnd) {
                    currentValue = [colorStart];
                    nextValue = [colorEnd];
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
                currentValue = replaceMap(valueA.trim().split(CHAR.SPACE), (value: string) => parseFloat(value));
                nextValue = replaceMap(valueB.trim().split(CHAR.SPACE), (value: string) => parseFloat(value));
                break;
            default:
                if (isNumber(valueA)) {
                    currentValue = [parseFloat(valueA)];
                }
                else if (isLength(valueA)) {
                    currentValue = [parseUnit(valueA, fontSize)];
                }
                if (isNumber(valueB)) {
                    nextValue = [parseFloat(valueB)];
                }
                else if (isLength(valueB)) {
                    nextValue = [parseUnit(valueB, fontSize)];
                }
                break;
        }
        if (currentValue && nextValue) {
            const length = currentValue.length;
            if (length === nextValue.length) {
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
                        const result: string[] = [];
                        switch (attributeName) {
                            case 'fill':
                            case 'stroke': {
                                const rgbaA = (<ColorData> currentValue[0]).rgba;
                                const rgbaB = (<ColorData> nextValue[0]).rgba;
                                const rgb = getHexCode(
                                    SvgAnimate.getSplitValue(rgbaA.r, rgbaB.r, percent),
                                    SvgAnimate.getSplitValue(rgbaA.g, rgbaB.g, percent),
                                    SvgAnimate.getSplitValue(rgbaA.b, rgbaB.b, percent)
                                );
                                const a = getHexCode(SvgAnimate.getSplitValue(rgbaA.a, rgbaB.a, percent));
                                result.push(`#${rgb + (a !== 'FF' ? a : '')}`);
                                break;
                            }
                            case 'points': {
                                for (let j = 0; j < length; j++) {
                                    const current = <Point> currentValue[j];
                                    const next = <Point> nextValue[j];
                                    result.push(SvgAnimate.getSplitValue(current.x, next.x, percent) + ',' + SvgAnimate.getSplitValue(current.y, next.y, percent));
                                }
                                break;
                            }
                            default: {
                                for (let j = 0; j < length; j++) {
                                    result.push(SvgAnimate.getSplitValue(currentValue[j] as number, nextValue[j] as number, percent).toString());
                                }
                                break;
                            }
                        }
                        if (result.length) {
                            splitTimes.push(time);
                            splitValues.push(result.join(' '));
                        }
                        else {
                            return undefined;
                        }
                    }
                    return [splitTimes, splitValues];
                }
            }
        }
        return undefined;
    }

    public static toFractionList(value: string, delimiter = ';', ordered = true) {
        let previous = 0;
        const result = replaceMap(value.split(delimiter), (seg: string) => {
            const fraction = parseFloat(seg);
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

    protected _values?: string[];
    protected _keyTimes?: number[];
    protected _keySplines?: string[];

    private _iterationCount = 1;
    private _from = '';
    private _reverse = false;
    private _alternate = false;
    private _setterType = false;
    private _repeatDuration = -1;
    private _timingFunction = '';

    constructor(element?: SVGGraphicsElement, animationElement?: SVGAnimateElement) {
        super(element, animationElement);
        if (animationElement) {
            const values = getNamedItem(animationElement, 'values');
            const keyTimes = this.duration !== -1 ? SvgAnimate.toFractionList(getNamedItem(animationElement, 'keyTimes')) : [];
            if (values !== '') {
                const valuesData = trimEnd(values, ';').split(XML.DELIMITER);
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
            if (repeatDur !== '' && repeatDur !== 'indefinite') {
                this._repeatDuration = SvgAnimation.convertClockTime(repeatDur);
            }
            const repeatCount = getNamedItem(animationElement, 'repeatCount');
            this.iterationCount = repeatCount === 'indefinite' ? -1 : parseFloat(repeatCount);
            if (animationElement.tagName === 'animate') {
                this.setCalcMode();
            }
        }
    }

    get from() {
        return this._from;
    }
    set from(value) {
        if (this._values === undefined) {
            const animationElement = this.animationElement;
            if (animationElement) {
                if (this.to === '') {
                    const by = getNamedItem(animationElement, 'by');
                    const byCoords = SvgBuild.parseCoordinates(by);
                    if (byCoords.length) {
                        if (value === '') {
                            value = this.baseValue || '';
                        }
                        if (value !== '') {
                            const fromCoords = SvgBuild.parseCoordinates(value);
                            const length = fromCoords.length;
                            if (byCoords.length === length) {
                                const to: number[] = [];
                                for (let i = 0; i < length; i++) {
                                    to.push(fromCoords[i] + byCoords[i]);
                                }
                                this.to = to.join(',');
                            }
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

    public setCalcMode(attributeName?: string, mode?: string) {
        const animationElement = this.animationElement;
        if (animationElement) {
            if (mode === undefined) {
                mode = getNamedItem(animationElement, 'calcMode') || 'linear';
            }
            const keyTimesBase = this.keyTimes;
            switch (mode) {
                case 'discrete':
                    if (keyTimesBase[0] === 0 && keyTimesBase.length === 2) {
                        let keyTimes: number[] = [];
                        let values: string[] = [];
                        const valuesBase = this.values;
                        const length = keyTimesBase.length;
                        for (let i = 0; i < length - 1; i++) {
                            const result = SvgAnimate.convertStepTimingFunction(attributeName || this.attributeName, 'step-end', keyTimesBase, valuesBase, i, getFontSize(animationElement));
                            if (result) {
                                keyTimes = keyTimes.concat(result[0]);
                                values = values.concat(result[1]);
                            }
                        }
                        keyTimes.push(keyTimesBase.pop() as number);
                        values.push(valuesBase.pop() as string);
                        this._values = values;
                        this._keyTimes = keyTimes;
                        this._keySplines = [KEYSPLINE_NAME['step-end']];
                    }
                    break;
                case 'paced':
                    this._keySplines = undefined;
                    break;
                case 'spline':
                    this.keySplines = flatMap(getNamedItem(animationElement, 'keySplines').split(';'), value => value.trim());
                case 'linear':
                    if (keyTimesBase[0] !== 0 && keyTimesBase[keyTimesBase.length - 1] !== 1) {
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
            for (let i = value.length - 1, found = false; i >= 0; i--) {
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

    public getIntervalEndTime(leadTime: number, complete = false) {
        const endTime = this.getTotalDuration();
        if (leadTime < endTime) {
            const { duration, keyTimes } = this;
            let delay = this.delay;
            while (delay + duration <= leadTime) {
                delay += duration;
            }
            return Math.min(delay + (complete ? 1 : keyTimes[keyTimes.length - 1]) * duration, endTime);
        }
        return endTime;
    }

    public getTotalDuration(minimum = false) {
        let iterationCount = this.iterationCount;
        if (minimum && iterationCount === -1) {
            iterationCount = 1;
        }
        if (iterationCount !== -1) {
            return Math.min(this.delay + this.duration * iterationCount, this.end || Number.POSITIVE_INFINITY);
        }
        return Number.POSITIVE_INFINITY;
    }

    set delay(value) {
        super.delay = value;
        const animationElement = this.animationElement;
        const end = animationElement && getNamedItem(animationElement, 'end');
        if (end) {
            const endTime = sortNumber(replaceMap(end.split(';'), (time: string) => SvgAnimation.convertClockTime(time)))[0];
            if (!isNaN(endTime)) {
                const { duration, iterationCount } = this;
                if (iterationCount === -1 || duration > 0 && endTime < duration * iterationCount) {
                    const delay = this.delay;
                    if (delay > endTime) {
                        this.end = endTime;
                        if (iterationCount === -1) {
                            this.iterationCount = Math.ceil((endTime - delay) / duration);
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
        if (value && value.length !== this.keyTimes.length) {
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
        const values = this._values;
        return values?.[values.length - 1] || '';
    }

    get valueFrom() {
        return this.values[0] || '';
    }

    set keyTimes(value) {
        const values = this._values;
        if ((values === undefined || values.length === value.length) && value.every(fraction => fraction >= 0 && fraction <= 1)) {
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
        if (value?.length) {
            const minSegment = this.keyTimes.length - 1;
            if (value.length >= minSegment && !value.every(spline => spline === '' || spline === KEYSPLINE_NAME.linear)) {
                const keySplines: string[] = [];
                for (let i = 0; i < minSegment; i++) {
                    const points = replaceMap(value[i].split(' '), (pt: string) => parseFloat(pt));
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
        this._timingFunction = value ? SvgAnimate.convertTimingFunction(value) : value;
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
            for (let i = length - 1, j = 0; i >= 0; ) {
                keyTimes[j++] = 1 - keyTimesBase[i--];
            }
            this.keyTimes = keyTimes;
            this.values.reverse();
            if (keySplinesBase) {
                const keySplines: string[] = [];
                for (let i = keySplinesBase.length - 1; i >= 0; i--) {
                    const points = replaceMap(keySplinesBase[i].split(' '), (pt: string) => parseFloat(pt));
                    keySplines.push(points.length === 4 ? invertControlPoint(points[2]) + ' ' + invertControlPoint(points[3]) + ' ' + invertControlPoint(points[0]) + ' ' + invertControlPoint(points[1]) : KEYSPLINE_NAME.linear);
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
        return keyTimes.length > 0 && keyTimes[keyTimes.length - 1] < 1;
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
            this._values = undefined;
        }
    }
    get length() {
        return this._values?.length || 0;
    }

    get instanceType() {
        return INSTANCE_TYPE.SVG_ANIMATE;
    }
}