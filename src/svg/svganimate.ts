import { SvgAnimateAttribute } from './@types/object';

import SvgAnimation from './svganimation';
import SvgBuild from './svgbuild';

import { FILL_MODE, INSTANCE_TYPE, KEYSPLINE_NAME } from './lib/constant';
import { convertClockTime, getFontSize, getHostDPI, getSplitValue, sortNumber } from './lib/util';

const $color = squared.lib.color;
const $dom = squared.lib.dom;
const $util = squared.lib.util;

function invertControlPoint(value: number) {
    return parseFloat((1 - value).toFixed(5));
}

export default class SvgAnimate extends SvgAnimation implements squared.svg.SvgAnimate {
    public static toStepFractionList(name: string, keyTimes: number[], values: string[], keySpline: string, index: number, dpi = 96, fontSize = 16): [number[], string[]] | undefined {
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
            switch (keySpline)  {
                case 'step-start':
                    keySpline = 'steps(1, start)';
                    break;
                case 'step-end':
                    keySpline = 'steps(1, end)';
                    break;
            }
            const match = /steps\((\d+)(?:, (start|end))?\)/.exec(keySpline);
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

    public type = 0;
    public from = '';
    public fillMode = 0;
    public alternate = false;
    public additiveSum = false;
    public accumulateSum = false;
    public end?: number;
    public synchronized?: NumberValue<string>;

    private _iterationCount = 1;
    private _reverse = false;
    private _setterType = false;
    private _values: string[] | undefined;
    private _keyTimes: number[] | undefined;
    private _keySplines?: string[];
    private _repeatDuration = -1;

    constructor(element?: SVGAnimateElement) {
        super(element);
        if (element) {
            const values = $dom.getNamedItem(element, 'values');
            const keyTimes = this.duration !== -1 ? SvgAnimate.toFractionList($dom.getNamedItem(element, 'keyTimes')) : [];
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
                this.from = $dom.getNamedItem(element, 'from');
                if (this.to === '') {
                    const by = $dom.getNamedItem(element, 'by');
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
            const repeatDur = $dom.getNamedItem(element, 'repeatDur');
            if (repeatDur !== '' && repeatDur !== 'indefinite') {
                this._repeatDuration = convertClockTime(repeatDur);
            }
            const repeatCount = $dom.getNamedItem(element, 'repeatCount');
            this.iterationCount = repeatCount === 'indefinite' ? -1 : parseFloat(repeatCount);
            if (element.tagName === 'animate') {
                this.setCalcMode(this.attributeName);
            }
        }
    }

    public setCalcMode(name: string) {
        switch ($dom.getNamedItem(this.element, 'calcMode')) {
            case 'discrete': {
                if (this.keyTimes.length === 2 && this.keyTimes[0] === 0) {
                    const keyTimes: number[] = [];
                    const values: string[] = [];
                    for (let i = 0; i < this.keyTimes.length - 1; i++) {
                        const result = SvgAnimate.toStepFractionList(name, this.keyTimes, this.values, 'step-end', i, getHostDPI(), getFontSize(this.element));
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
                this.keySplines = $util.flatMap($dom.getNamedItem(this.element, 'keySplines').split(';'), value => value.trim());
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

    public convertToValues(keyTimes?: number[]) {
        if (this.to !== '') {
            this.values = [this.from, this.to];
            this.keyTimes = keyTimes && keyTimes.length === 2 && this.keyTimes[0] === 0 && this.keyTimes[1] <= 1 ? keyTimes : [0, 1];
        }
    }

    public setGroupSiblings(value: SvgAnimateAttribute[]) {
        this.group.siblings = value;
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

    public getPartialDuration(iteration?: number) {
        return (iteration === 0 ? this.delay : 0) + this.keyTimes[this.keyTimes.length - 1] * this.duration;
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

    set delay(value) {
        super.delay = value;
        const end = $dom.getNamedItem(this.element, 'end');
        if (end !== '') {
            const endTime = sortNumber(end.split(';').map(time => convertClockTime(time)))[0] as number | undefined;
            if (endTime !== undefined && (this.iterationCount === -1 || this.duration > 0 && endTime < this.duration * this.iterationCount)) {
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
        this.fillFreeze = this.iterationCount !== -1 && $dom.getNamedItem(this.element, 'fill') === 'freeze';
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
        return this.values[this.values.length - 1] || '';
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
                    const points = value[i].split(' ').map(pt => parseFloat(pt));
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

    set reverse(value) {
        if (value !== this._reverse && this.values.length) {
            this.values.reverse();
            const keyTimes: number[] = [];
            for (let i = 0; i < this.keyTimes.length; i++) {
                keyTimes.push(1 - this.keyTimes[i]);
            }
            keyTimes.reverse();
            this.keyTimes = keyTimes;
            if (this._keySplines) {
                const keySplines: string[] = [];
                for (let i = this._keySplines.length - 1; i >= 0; i--) {
                    const points = this._keySplines[i].split(' ').map(pt => parseFloat(pt));
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
        return this._setterType || this.element !== undefined && this.duration === 0 && this.keyTimes.length >= 2 && this.keyTimes[0] === 0;
    }

    get instanceType() {
        return INSTANCE_TYPE.SVG_ANIMATE;
    }
}