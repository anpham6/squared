import SvgAnimation from './svganimation';
import SvgBuild from './svgbuild';

import { INSTANCE_TYPE, KEYSPLINE_NAME } from './lib/constant';

const { getHexCode, parseColor } = squared.lib.color;
const { getFontSize, isEmBased, isLength, parseUnit } = squared.lib.css;
const { getNamedItem } = squared.lib.dom;
const { isNumber, replaceMap, sortNumber, trimEnd } = squared.lib.util;

const invertControlPoint = (value: number) => parseFloat((1 - value).toPrecision(5));

const REGEXP_CUBICBEZIER = /\s*[\d.]+\s+[\d.]+\s+[\d.]+\s+[\d.]+\s*/;

export default class SvgAnimate extends SvgAnimation implements squared.svg.SvgAnimate {
    public static PATTERN_CUBICBEZIER = 'cubic-bezier\\(([01](?:\\.\\d+)?),\\s+(-?\\d+(?:\\.\\d+)?),\\s+([01](?:\\.\\d+)?),\\s+(-?\\d+(?:\\.\\d+)?)\\)';

    public static getSplitValue(value: number, next: number, percent: number) {
        return value + (next - value) * percent;
    }

    public static convertTimingFunction(value: string) {
        const keySpline = KEYSPLINE_NAME[value];
        if (keySpline) {
            return keySpline as string;
        }
        else if (REGEXP_CUBICBEZIER.test(value)) {
            return value.trim();
        }
        else if (value.startsWith('step')) {
            return KEYSPLINE_NAME.linear;
        }
        else {
            const match = new RegExp(SvgAnimate.PATTERN_CUBICBEZIER).exec(value);
            return match ? match[1] + ' ' + match[2] + ' ' + match[3] + ' ' + match[4] : KEYSPLINE_NAME.ease;
        }
    }

    public static convertStepTimingFunction(element: SVGElement, attributeName: string, timingFunction: string, keyTimes: number[], values: string[], index: number): Undef<[number[], string[]]> {
        const valueA = values[index];
        const valueB = values[index + 1];
        let currentValue: Undef<any[]>,
            nextValue: Undef<any[]>;
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
                currentValue = replaceMap(valueA.trim().split(/\s+/), (value: string) => parseFloat(value));
                nextValue = replaceMap(valueB.trim().split(/\s+/), (value: string) => parseFloat(value));
                break;
            default: {
                const options: Undef<ParseUnitOptions> = isEmBased(valueA) || isEmBased(valueB) ? { fontSize: getFontSize(element) } : undefined;
                if (isNumber(valueA)) {
                    currentValue = [parseFloat(valueA)];
                }
                else if (isLength(valueA)) {
                    currentValue = [parseUnit(valueA, options)];
                }
                if (isNumber(valueB)) {
                    nextValue = [parseFloat(valueB)];
                }
                else if (isLength(valueB)) {
                    nextValue = [parseUnit(valueB, options)];
                }
                break;
            }
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
                const match = /steps\((\d+)(?:,\s+(start|end))?\)/.exec(timingFunction);
                if (match) {
                    const keyTimeTotal = keyTimes[index + 1] - keyTimes[index];
                    const stepSize = parseInt(match[1]);
                    const interval = 100 / stepSize;
                    const splitTimes: number[] = new Array(stepSize + 1);
                    const splitValues: string[] = new Array(stepSize + 1);
                    for (let i = 0; i <= stepSize; ++i) {
                        const offset = i === 0 && match[2] === 'start' ? 1 : 0;
                        const time = keyTimes[index] + keyTimeTotal * (i / stepSize);
                        const percent = (interval * (i + offset)) / 100;
                        let result = '';
                        switch (attributeName) {
                            case 'fill':
                            case 'stroke': {
                                const rgbaA = (currentValue[0] as ColorData).rgba;
                                const rgbaB = (nextValue[0] as ColorData).rgba;
                                const rgb = getHexCode(
                                    SvgAnimate.getSplitValue(rgbaA.r, rgbaB.r, percent),
                                    SvgAnimate.getSplitValue(rgbaA.g, rgbaB.g, percent),
                                    SvgAnimate.getSplitValue(rgbaA.b, rgbaB.b, percent)
                                );
                                const a = getHexCode(SvgAnimate.getSplitValue(rgbaA.a, rgbaB.a, percent));
                                result += (result !== '' ? ' ' : '') + `#${rgb + (a !== 'FF' ? a : '')}`;
                                break;
                            }
                            case 'points': {
                                let j = 0;
                                while (j < length) {
                                    const current = currentValue[j] as Point;
                                    const next = nextValue[j++] as Point;
                                    result += (result !== '' ? ' ' : '') + SvgAnimate.getSplitValue(current.x, next.x, percent) + ',' + SvgAnimate.getSplitValue(current.y, next.y, percent);
                                }
                                break;
                            }
                            default: {
                                let k = 0;
                                while (k < length) {
                                    result += (result !== '' ? ' ' : '') + SvgAnimate.getSplitValue(currentValue[k] as number, nextValue[k++] as number, percent).toString();
                                }
                                break;
                            }
                        }
                        if (result !== '') {
                            splitTimes[i] = time;
                            splitValues[i] = result;
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

    protected _reverse = false;
    protected _alternate = false;
    protected _values?: string[];
    protected _keyTimes?: number[];
    protected _keySplines?: string[];

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
            if (values !== '') {
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
            if (repeatDur !== '' && repeatDur !== 'indefinite') {
                const value = SvgAnimation.convertClockTime(repeatDur);
                if (!isNaN(value) && value > 0) {
                    this._repeatDuration = value;
                }
            }
            const repeatCount = getNamedItem(animationElement, 'repeatCount');
            this.iterationCount = repeatCount === 'indefinite' ? -1 : parseFloat(repeatCount) || 0;
            if (animationElement.tagName === 'animate') {
                this.setCalcMode();
            }
        }
    }

    public setCalcMode(attributeName?: string, mode?: string) {
        const animationElement = this.animationElement;
        if (animationElement) {
            if (!mode) {
                mode = getNamedItem(animationElement, 'calcMode') || 'linear';
            }
            const keyTimesBase = this.keyTimes;
            switch (mode) {
                case 'discrete':
                    if (keyTimesBase[0] === 0 && keyTimesBase.length === 2) {
                        const valuesBase = this.values;
                        let keyTimes: number[] = [],
                            values: string[] = [];
                        const length = keyTimesBase.length - 1;
                        let i = 0;
                        while (i < length) {
                            const result = SvgAnimate.convertStepTimingFunction(animationElement, attributeName || this.attributeName, 'step-end', keyTimesBase, valuesBase, i++);
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
                    this.keySplines = replaceMap(getNamedItem(animationElement, 'keySplines').split(';'), (value: string) => value.trim()).filter(value => value !== '');
                case 'linear':
                    if (keyTimesBase[0] !== 0 && keyTimesBase[keyTimesBase.length - 1] !== 1) {
                        const length = this.values.length;
                        const keyTimes: number[] = new Array(length);
                        let i = 0;
                        while (i < length) {
                            keyTimes[i] = i++ / (length - 1);
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
            let found: Undef<boolean>;
            let i = value.length - 1;
            while (i >= 0) {
                const item = value[i--];
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
            return Math.min(delay + (complete ? 1 : keyTimes[keyTimes.length - 1]) * duration, endTime);
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
            const endTime = sortNumber(replaceMap(end.split(';'), (time: string) => SvgAnimation.convertClockTime(time)).filter(time => !isNaN(time)))[0];
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
        return this._setterType
            ? this.valueTo || this._to
            : this.setterType
                ? this.values[0]
                : this._to;
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
                    if (byCoords.length > 0) {
                        if (value === '') {
                            value = this.baseValue || '';
                        }
                        if (value !== '') {
                            const fromCoords = SvgBuild.parseCoordinates(value);
                            const length = fromCoords.length;
                            if (byCoords.length === length) {
                                let to = '';
                                let i = 0;
                                while (i < length) {
                                    to += (i > 0 ? ',' : '') + (fromCoords[i] + byCoords[i++]);
                                }
                                this.to = to;
                            }
                        }
                    }
                }
                if (SvgBuild.parseCoordinates(this.to).length > 0) {
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
            this._keyTimes = undefined;
            this._keySplines = undefined;
        }
    }
    get values() {
        return this._values ?? (this._values = []);
    }

    set keyTimes(value) {
        const values = this._values;
        if ((!values || values.length === value.length) && value.every(fraction => fraction >= 0 && fraction <= 1)) {
            this._keyTimes = value;
        }
    }
    get keyTimes() {
        return this._keyTimes ?? (this._keyTimes = []);
    }

    set keySplines(value) {
        if (value?.length) {
            const minSegment = this.keyTimes.length - 1;
            if (value.length >= minSegment && !value.every(spline => spline === '' || spline === KEYSPLINE_NAME.linear)) {
                const keySplines: string[] = [];
                let i = 0;
                while (i < minSegment) {
                    const points = replaceMap(value[i++].split(/\s+/), (pt: string) => parseFloat(pt));
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
        if (this.length > 0 && value !== this._reverse) {
            const keyTimesBase = this.keyTimes;
            const keySplinesBase = this._keySplines;
            const length = keyTimesBase.length;
            const keyTimes: number[] = new Array(length);
            let i = length - 1, j = 0;
            while (i >= 0) {
                keyTimes[j++] = 1 - keyTimesBase[i--];
            }
            this.keyTimes = keyTimes;
            this.values.reverse();
            if (keySplinesBase) {
                const keySplines: string[] = [];
                i = keySplinesBase.length - 1;
                while (i >= 0) {
                    const points = replaceMap(keySplinesBase[i--].split(' '), (pt: string) => parseFloat(pt));
                    keySplines.push(
                        points.length === 4
                            ? invertControlPoint(points[2]) + ' ' + invertControlPoint(points[3]) + ' ' + invertControlPoint(points[0]) + ' ' + invertControlPoint(points[1])
                            : KEYSPLINE_NAME.linear
                    );
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
            this._values = undefined;
        }
    }
    get length() {
        return this._values?.length || 0;
    }

    get valueTo() {
        const values = this._values;
        return values?.[values.length - 1] || '';
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
        return keyTimes.length > 0 && keyTimes[keyTimes.length - 1] < 1;
    }

    get instanceType() {
        return INSTANCE_TYPE.SVG_ANIMATE;
    }
}