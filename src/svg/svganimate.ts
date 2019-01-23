import SvgAnimation from './svganimation';
import SvgBuild from './svgbuild';

import { FILL_MODE, KEYSPLINE_NAME } from './lib/constant';
import { convertClockTime, getFontSize, getHostDPI, getTransformInitialValue, sortNumber } from './lib/util';

const $color = squared.lib.color;
const $dom = squared.lib.dom;
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
                currentValue = SvgBuild.fromNumberList(SvgBuild.toNumberList(values[index]));
                nextValue = SvgBuild.fromNumberList(SvgBuild.toNumberList(values[index + 1]));
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
                case 'steps-start':
                    spline = 'steps(1, start)';
                    break;
                case 'steps-end':
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
                for (let i = 0, j = match[2] === 'start' ? 1 : 0; i < stepSize; i++) {
                    const time = keyTimes[index] + keyTimeTotal * (i / stepSize);
                    const value: string[] = [];
                    const percent = (j > 0 && i === stepSize - 1 ? 100 : interval * (i + j)) / 100;
                    switch (name) {
                        case 'fill':
                        case 'stroke': {
                            const current = <ColorData> currentValue[0];
                            const next = <ColorData> nextValue[0];
                            const r = $color.convertHex(getSplitValue(current.rgba.r, next.rgba.r, percent));
                            const g = $color.convertHex(getSplitValue(current.rgba.g, next.rgba.g, percent));
                            const b = $color.convertHex(getSplitValue(current.rgba.b, next.rgba.b, percent));
                            const a = $color.convertHex(getSplitValue(current.rgba.a, next.rgba.a, percent));
                            value.push(`#${r + g + b + (a !== 'FF' ? a : '')}`);
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
        let previous = -1;
        const result = $util.flatMap(value.split(delimiter), segment => {
            const fraction = parseFloat(segment);
            if (!isNaN(fraction) && fraction <= 1 && (previous === -1 || fraction > previous)) {
                previous = fraction;
                return fraction;
            }
            return -1;
        });
        return result.length > 1 && result.some(percent => percent !== -1) && result[0] === 0 ? result : [];
    }

    public from = '';
    public by = '';
    public values!: string[];
    public keyTimes!: number[];
    public repeatDuration = -1;
    public additiveSum = false;
    public accumulateSum = false;
    public fillMode = 0;
    public alternate = false;
    public end?: number;
    public sequential?: NumberValue<string>;

    private _repeatCount = 1;
    private _reverse = false;
    private _keySplines?: string[];

    constructor(public element?: SVGAnimateElement) {
        super(element);
        if (element) {
            const values = this.getAttribute('values');
            const keyTimes = this.getAttribute('keyTimes');
            if (values !== '' && keyTimes !== '') {
                this.values = $util.flatMap(values.split(';'), value => value.trim());
                this.keyTimes = SvgAnimate.toFractionList(keyTimes);
                if (this.values.length > 1 && this.keyTimes.length === this.values.length) {
                    if (this.keyTimes[0] === 0) {
                        this.from = this.values[0];
                    }
                    this.to = this.values[this.values.length - 1];
                }
                else {
                    this.values.length = 0;
                    this.keyTimes.length = 0;
                }
            }
            const from = this.getAttribute('from');
            if (!$util.isArray(this.values) && this.to !== '') {
                if (from !== '') {
                    this.from = from;
                }
                else if (this.attributeName === 'transform') {
                    this.from = getTransformInitialValue(this.getAttribute('type'));
                }
                else if (element.parentElement) {
                    const value = $util.optionalAsString(element.parentElement, `${this.attributeName}.baseVal.value`);
                    if (value !== '') {
                        this.from = value;
                    }
                    else {
                        this.from = $dom.cssAttribute(element.parentElement, this.attributeName);
                    }
                }
                this.values = [this.from, this.to];
                this.keyTimes = [0, 1];
                this.setAttribute('by');
            }
            if (values === '' && from !== '' && this.to !== '') {
                this.setAttribute('additive', 'sum');
                if (this.additiveSum) {
                    this.setAttribute('accumulate', 'sum');
                }
            }
            const repeatDur = this.getAttribute('repeatDur');
            if (repeatDur !== '' && repeatDur !== 'indefinite') {
                this.repeatDuration = convertClockTime(repeatDur);
            }
            const repeatCount = this.getAttribute('repeatCount');
            if (repeatCount === 'indefinite') {
                this.repeatCount = -1;
            }
            else {
                this.repeatCount = parseFloat(repeatCount);
            }
            if (this.begin.length) {
                const end = this.getAttribute('end');
                if (end !== '') {
                    const times = sortNumber(end.split(';').map(value => convertClockTime(value)));
                    if (times.length && (this.begin.length === 1 || this.begin[this.begin.length - 1] !== this.end || times[0] === 0)) {
                        this.end = times[0];
                        this.begin = this.begin.filter(value => value >= 0 && value < times[0]);
                        if (this.begin.length && this.repeatCount === -1) {
                            this.repeatCount = this.end / this.duration;
                        }
                    }
                }
            }
            if (element.tagName === 'animate') {
                this.setCalcMode(this.attributeName);
            }
        }
        if (this.values === undefined) {
            this.values = [];
            this.keyTimes = [];
        }
    }

    public setCalcMode(name: string) {
        if (this.element) {
            switch (this.getAttribute('calcMode')) {
                case 'discrete':
                    const keyTimes: number[] = [];
                    const values: string[] = [];
                    const keySplines: string[] = [];
                    for (let i = 0; i < this.keyTimes.length - 1; i++) {
                        const result = SvgAnimate.toStepFractionList(name, 'steps-start', i, this.keyTimes, this.values, getHostDPI(), getFontSize(this.element));
                        if (result) {
                            keyTimes.push(...result[0]);
                            values.push(...result[1]);
                            result[0].forEach(() => keySplines.push(KEYSPLINE_NAME.step));
                        }
                        else {
                            return;
                        }
                    }
                    keyTimes.push(this.keyTimes.pop() as number);
                    values.push(this.values.pop() as string);
                    this.keyTimes = keyTimes;
                    this.values = values;
                    this._keySplines = keySplines;
                    break;
                case 'spline':
                    this.keySplines = $util.flatMap(this.getAttribute('keySplines').split(';'), value => value.trim());
                    break;
            }
        }
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
            const fill = this.getAttribute('fill');
            if (fill === 'freeze' && this.repeatCount !== -1) {
                this.fillMode |= FILL_MODE.FREEZE;
            }
            else if ($util.hasBit(this.fillMode, FILL_MODE.FREEZE)) {
                this.fillMode ^= FILL_MODE.FREEZE;
            }
        }
    }
    get repeatCount() {
        const duration = this.duration;
        if (duration !== -1) {
            if (this._repeatCount === -1 && this.repeatDuration === -1) {
                return -1;
            }
            else if (this._repeatCount !== -1 && this.repeatDuration !== -1) {
                if (this._repeatCount * duration <= this.repeatDuration) {
                    return this._repeatCount;
                }
                else {
                    return this.repeatDuration / duration;
                }
            }
            else if (this.repeatDuration !== -1) {
                return this.repeatDuration / duration;
            }
            else {
                return this._repeatCount;
            }
        }
        return 1;
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

    get instanceType() {
        return 1;
    }
}