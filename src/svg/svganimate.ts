import { SvgAnimationGroupOrder } from './@types/object';

import SvgAnimation from './svganimation';
import SvgBuild from './svgbuild';

import { FILL_MODE, INSTANCE_TYPE, KEYSPLINE_NAME } from './lib/constant';
import { convertClockTime, getFontSize, getHostDPI, sortNumber } from './lib/util';

const $color = squared.lib.color;
const $util = squared.lib.util;

function getSplitValue(current: number, next: number, percent: number) {
    return current + (next - current) * percent;
}

function invertControlPoint(value: number) {
    return parseFloat((1 - value).toFixed(5));
}

export default class SvgAnimate extends SvgAnimation implements squared.svg.SvgAnimate {
    public static toStepFractionList(name: string, spline: string, index: number, keyTimes: number[], values: string[], dpi = 96, fontSize = 16): [number[], string[]] | undefined {
        let currentValue: any[] | undefined;
        let nextValue: any[] | undefined;
        switch (name) {
            case 'fill':
            case 'stroke':
                const colorStart = $color.parseRGBA(values[index]);
                const colorEnd = $color.parseRGBA(values[index + 1]);
                if (colorStart && colorEnd) {
                    currentValue = [colorStart];
                    nextValue = [colorEnd];
                }
                break;
            case 'points':
                currentValue = SvgBuild.convertNumbers(SvgBuild.toNumberList(values[index]));
                nextValue = SvgBuild.convertNumbers(SvgBuild.toNumberList(values[index + 1]));
                break;
            case 'rotate':
            case 'scale':
            case 'translate':
                currentValue = values[index].trim().split(/\s+/).map(value => parseFloat(value));
                nextValue = values[index + 1].trim().split(/\s+/).map(value => parseFloat(value));
                break;
            default:
                if ($util.isNumber(values[index])) {
                    currentValue = [parseFloat(values[index])];
                }
                else if ($util.isUnit(values[index])) {
                    currentValue = [parseFloat($util.convertPX(values[index], dpi, fontSize))];
                }
                if ($util.isNumber(values[index + 1])) {
                    nextValue = [parseFloat(values[index + 1])];
                }
                else if ($util.isUnit(values[index + 1])) {
                    nextValue = [parseFloat($util.convertPX(values[index + 1], dpi, fontSize))];
                }
                break;
        }
        if (currentValue && nextValue && currentValue.length && currentValue.length === nextValue.length) {
            switch (spline)  {
                case 'step-start':
                    spline = 'steps(1, start)';
                    break;
                case 'step-end':
                    spline = 'steps(1, end)';
                    break;
            }
            const match = /steps\((\d+)(?:, (start|end))?\)/.exec(spline);
            if (match) {
                const keyTimeTotal = keyTimes[index + 1] - keyTimes[index];
                const stepSize = parseInt(match[1]);
                const interval = 100 / stepSize;
                const splitTimes: number[] = [];
                const splitValues: string[] = [];
                for (let i = 0; i < stepSize; i++) {
                    const offset = i === 0 && match[2] === 'start' ? 1 : 0;
                    const time = keyTimes[index] + keyTimeTotal * (i / stepSize);
                    const percent = (interval * (i + offset)) / 100;
                    const value: string[] = [];
                    switch (name) {
                        case 'fill':
                        case 'stroke': {
                            const current = <ColorData> currentValue[0];
                            const next = <ColorData> nextValue[0];
                            const rgb = $color.convertHex(
                                getSplitValue(current.rgba.r, next.rgba.r, percent),
                                getSplitValue(current.rgba.g, next.rgba.g, percent),
                                getSplitValue(current.rgba.b, next.rgba.b, percent)
                            );
                            const a = $color.convertHex(getSplitValue(current.rgba.a, next.rgba.a, percent));
                            value.push(`#${rgb + (a !== 'FF' ? a : '')}`);
                            break;
                        }
                        case 'points': {
                            for (let k = 0; k < currentValue.length; k++) {
                                const current = <Point> currentValue[k];
                                const next = <Point> nextValue[k];
                                value.push(`${getSplitValue(current.x, next.x, percent)},${getSplitValue(current.y, next.y, percent)}`);
                            }
                            break;
                        }
                        default: {
                            for (let k = 0; k < currentValue.length; k++) {
                                const current = currentValue[k] as number;
                                const next = nextValue[k] as number;
                                value.push(getSplitValue(current, next, percent).toString());
                            }
                            break;
                        }
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
        const result = $util.flatMap(value.split(delimiter), segment => {
            const fraction = parseFloat(segment);
            if (!isNaN(fraction) && fraction >= previous && fraction <= 1) {
                previous = fraction;
                return fraction;
            }
            return -1;
        });
        return result.length > 1 && result[0] === 0 && result.some(percent => percent !== -1) ? result : [];
    }

    public from = '';
    public repeatDuration = -1;
    public additiveSum = false;
    public accumulateSum = false;
    public fillMode = 0;
    public alternate = false;
    public end?: number;
    public synchronized?: NumberValue<string>;

    private _repeatCount = 1;
    private _reverse = false;
    private _setterType = false;
    private _values: string[] | undefined;
    private _keyTimes: number[] | undefined;
    private _keySplines?: string[];

    constructor(public element?: SVGAnimateElement) {
        super(element);
        if (element) {
            const values = this.getAttribute('values');
            const keyTimes = this.duration !== -1 ? SvgAnimate.toFractionList(this.getAttribute('keyTimes')) : [];
            if (values !== '') {
                this.values = $util.flatMap(values.split(';'), value => value.trim());
                if (this.values.length > 1 && keyTimes.length === this.values.length) {
                    this.from = this.values[0];
                    this.to = this.values[this.values.length - 1];
                    this.keyTimes = keyTimes;
                }
                else if (this.values.length === 1) {
                    this.to = values[0];
                    this.convertToValues();
                }
            }
            else {
                this.from = this.getAttribute('from');
                if (this.to === '') {
                    const by = this.getAttribute('by');
                    if ($util.isNumber(by)) {
                        if (this.from === '' && this.baseFrom) {
                            this.from = this.baseFrom;
                        }
                        if ($util.isNumber(this.from)) {
                            this.to = (parseFloat(this.from) + parseFloat(by)).toString();
                        }
                    }
                }
                this.convertToValues(keyTimes);
            }
            this.setAttribute('additive', 'sum');
            const repeatDur = this.getAttribute('repeatDur');
            if (repeatDur !== '' && repeatDur !== 'indefinite') {
                this.repeatDuration = convertClockTime(repeatDur);
            }
            if (!(this.duration !== -1 && this.repeatDuration !== -1 && this.repeatDuration < this.duration)) {
                const repeatCount = this.getAttribute('repeatCount');
                this.repeatCount = repeatCount === 'indefinite' ? -1 : parseFloat(repeatCount);
            }
            if (element.tagName === 'animate') {
                this.setCalcMode(this.attributeName);
            }
        }
    }

    public setCalcMode(name: string) {
        if (this.element) {
            switch (this.getAttribute('calcMode')) {
                case 'discrete': {
                    if (this.keyTimes.length === 2 && this.keyTimes[0] === 0) {
                        const keyTimes: number[] = [];
                        const values: string[] = [];
                        for (let i = 0; i < this.keyTimes.length - 1; i++) {
                            const result = SvgAnimate.toStepFractionList(name, 'step-end', i, this.keyTimes, this.values, getHostDPI(), getFontSize(this.element));
                            if (result) {
                                keyTimes.push(...result[0]);
                                values.push(...result[1]);
                            }
                        }
                        keyTimes.push(this.keyTimes.pop() as number);
                        values.push(this.values.pop() as string);
                        this.values = values;
                        this.keyTimes = keyTimes;
                        this._keySplines = [KEYSPLINE_NAME['step']];
                    }
                    break;
                }
                case 'spline':
                    this.keySplines = $util.flatMap(this.getAttribute('keySplines').split(';'), value => value.trim());
                case 'linear':
                    if (this.keyTimes[0] !== 0 && this.keyTimes[this.keyTimes.length - 1] !== 1) {
                        const keyTimes: number[] = [];
                        for (let i = 0; i < this.values.length; i++) {
                            keyTimes.push(i / (this.values.length - 1));
                        }
                        this._keyTimes = keyTimes;
                        this._keySplines = undefined;
                    }
                    break;
            }
        }
    }

    public convertToValues(keyTimes?: number[]) {
        if (this.to !== '') {
            this.values = [this.from, this.to];
            this.keyTimes = keyTimes && keyTimes.length === 2 && this.keyTimes[0] === 0 && this.keyTimes[1] <= 1 ? keyTimes : [0, 1];
        }
    }

    public setGroupOrder(value: SvgAnimationGroupOrder[]) {
        this.group.order = value;
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

    private _setFillMode(mode: boolean, value: number) {
        const hasBit = $util.hasBit(this.fillMode, value);
        if (mode) {
            if (!hasBit) {
                this.fillMode |= value;
            }
        }
        else {
            if (hasBit) {
                this.fillMode ^= value;
            }
        }
    }

    set begin(value) {
        super.begin = value;
        if (this.element) {
            const end = this.getAttribute('end');
            if (end !== '') {
                const endTime = sortNumber(end.split(';').map(time => convertClockTime(time)))[0] as number | undefined;
                if (endTime !== undefined && (this.repeatCount === -1 || this.duration > 0 && endTime < this.duration * this.repeatCount)) {
                    if (this.begin > endTime) {
                        this.end = endTime;
                        if (this.repeatCount === -1) {
                            this.repeatCount = Math.ceil((this.end - this.begin) / this.duration);
                        }
                    }
                    else {
                        this.duration = -1;
                    }
                }
            }
        }
    }
    get begin() {
        return super.begin;
    }

    set repeatCount(value) {
        if (!isNaN(value)) {
            this._repeatCount = value;
            if (value !== -1) {
                this.repeatDuration = -1;
            }
        }
        else {
            this._repeatCount = 1;
        }
        if (this.element) {
            this.fillFreeze = this.repeatCount !== -1 && this.getAttribute('fill') === 'freeze';
            if (this.repeatCount !== 1) {
                this.setAttribute('accumulate', 'sum');
            }
            else {
                this.accumulateSum = false;
            }
        }
    }
    get repeatCount() {
        if (this._repeatCount === -1 && this.repeatDuration === -1) {
            return -1;
        }
        else if (this.duration > 0) {
            if (this._repeatCount !== -1 && this.repeatDuration !== -1 && this._repeatCount * this.duration <= this.repeatDuration) {
                return this._repeatCount;
            }
            else if (this.repeatDuration !== -1 && this.duration > 0) {
                return this.repeatDuration / this.duration;
            }
        }
        return this._repeatCount;
    }

    set to(value) {
        super.to = value;
    }
    get to() {
        if (this._setterType) {
            return this.values[this.values.length - 1] || super.to;
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
        if (value) {
            const minSegment = this.keyTimes.length - 1;
            if (minSegment > 0 && value.length >= minSegment && !value.every(spline => spline === '')) {
                const result: string[] = [];
                for (let i = 0; i < minSegment; i++) {
                    const points = value[i].split(' ').map(pt => parseFloat(pt));
                    if (points.length === 4 && !points.some(pt => isNaN(pt)) && points[0] >= 0 && points[0] <= 1 && points[2] >= 0 && points[2] <= 1) {
                        result.push(points.join(' '));
                    }
                    else {
                        result.push(KEYSPLINE_NAME.linear);
                    }
                }
                this._keySplines = result;
            }
        }
        else {
            this._keySplines = undefined;
        }
    }
    get keySplines() {
        return this._keySplines;
    }

    set reverse(value) {
        if (value !== this._reverse && this.values.length) {
            this.values.reverse();
            if (this._keySplines) {
                const result: string[] = [];
                for (let i = this._keySplines.length - 1; i >= 0; i--) {
                    const points = this._keySplines[i].split(' ').map(pt => parseFloat(pt));
                    if (points.length === 4) {
                        result.push(`${invertControlPoint(points[2])} ${invertControlPoint(points[3])} ${invertControlPoint(points[0])} ${invertControlPoint(points[1])}`);
                    }
                    else {
                        result.push(KEYSPLINE_NAME.linear);
                    }
                }
                this._keySplines = result;
            }
            this._reverse = value;
        }
    }
    get reverse() {
        return this._reverse;
    }

    get fromToType() {
        return this.keyTimes.length === 2 && this.keyTimes[0] === 0 && this.keyTimes[1] === 1;
    }

    set fillBackwards(value) {
        this._setFillMode(value, FILL_MODE.BACKWARDS);
    }
    get fillBackwards() {
        return $util.hasBit(this.fillMode, FILL_MODE.BACKWARDS);
    }

    set fillForwards(value) {
        this._setFillMode(value, FILL_MODE.FORWARDS);
    }
    get fillForwards() {
        return $util.hasBit(this.fillMode, FILL_MODE.FORWARDS);
    }

    set fillFreeze(value) {
        this._setFillMode(value, FILL_MODE.FREEZE);
    }
    get fillFreeze() {
        return $util.hasBit(this.fillMode, FILL_MODE.FREEZE);
    }

    get fillReplace() {
        return this.fillMode < FILL_MODE.FORWARDS;
    }

    set setterType(value) {
        this._setterType = value;
    }
    get setterType() {
        return this._setterType || this.element !== undefined && this.duration === 0 && this.keyTimes.length >= 2 && this.keyTimes[0] === 0;
    }

    get instanceType() {
        return INSTANCE_TYPE.SVG_ANIMATE;
    }
}