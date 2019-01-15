import SvgAnimation from './svganimation';

import { convertClockTime, sortNumber } from './lib/util';

const $util = squared.lib.util;

export default class SvgAnimate extends SvgAnimation implements squared.svg.SvgAnimate {
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
    public values: string[] = [];
    public keyTimes: number[] = [];
    public calcMode = '';
    public additiveSum = false;
    public accumulateSum = false;
    public fillFreeze = false;
    public repeatDuration = -1;
    public end?: number;
    public keySplines?: string[];
    public sequential?: NameValue;

    private _repeatCount = 1;

    constructor(public element?: SVGAnimateElement) {
        super(element);
        if (element) {
            const values = this.getAttribute('values');
            const from = this.getAttribute('from');
            if (values !== '') {
                this.values.push(...$util.flatMap(values.split(';'), value => value.trim()));
                if (this.values.length > 1) {
                    this.from = this.values[0];
                    this.to = this.values[this.values.length - 1];
                    const keyTimes = this.getAttribute('keyTimes');
                    if (keyTimes) {
                        const times = SvgAnimate.toFractionList(keyTimes);
                        if (times.length === this.values.length) {
                            this.keyTimes.push(...times);
                        }
                    }
                }
                else {
                    this.values.length = 0;
                }
            }
            if (this.values.length === 0 && this.to !== '') {
                if (from !== '') {
                    this.from = from;
                }
                else if (element.parentElement) {
                    const value = $util.optionalAsString(element.parentElement, `${this.attributeName}.baseVal.value`);
                    if (value !== '') {
                        this.from = value;
                    }
                    else {
                        const current = element.parentElement.attributes.getNamedItem(this.attributeName);
                        if (current) {
                            this.from = current.value.trim();
                        }
                    }
                }
                this.values.push(this.from, this.to);
                this.keyTimes.push(0, 1);
                this.setAttribute('by');
            }
            const repeatDur = this.getAttribute('repeatDur');
            const repeatCount = this.getAttribute('repeatCount');
            if (repeatDur && repeatDur !== 'indefinite') {
                this.repeatDuration = convertClockTime(repeatDur) || -1;
            }
            if (repeatCount !== 'indefinite') {
                this.repeatCount = parseFloat(repeatCount);
            }
            if (this.begin.length) {
                const end = this.getAttribute('end');
                if (end !== '') {
                    const times = sortNumber(end.split(';').map(value => convertClockTime(value)));
                    if (times.length && (this.begin.length === 1 || this.begin[this.begin.length - 1] !== this.end || times[0] === 0)) {
                        this.end = times[0];
                        this.begin = this.begin.filter(value => value >= 0 && value < times[0]);
                        if (this.begin.length && this._repeatCount === -1) {
                            this._repeatCount = this.end / this.duration;
                        }
                    }
                }
            }
            this.setAttribute('calcMode');
            if (values === '' && from !== '' && this.to !== '') {
                this.setAttribute('additive', 'sum');
                if (this.additiveSum) {
                    this.setAttribute('accumulate', 'sum');
                }
            }
            this.setAttribute('fill', 'freeze');
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
}