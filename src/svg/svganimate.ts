import SvgAnimation from './svganimation';

import $util = squared.lib.util;

export default class SvgAnimate extends SvgAnimation implements squared.svg.SvgAnimate {
    public static toFractionList(value: string, delimiter = ';') {
        let previousFraction = -1;
        const result = $util.flatMap(value.split(delimiter), segment => {
            const fraction = parseFloat(segment);
            if (!isNaN(fraction) && fraction <= 1 && (previousFraction === -1 || fraction > previousFraction)) {
                previousFraction = fraction;
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
    public end: number[] = [];
    public repeatDuration: number;
    public calcMode = '';
    public additiveSum = false;
    public accumulateSum = false;
    public fillFreeze = false;

    private _repeatCount: number;

    constructor(
        public element: SVGAnimateElement,
        public parentElement: SVGGraphicsElement)
    {
        super(element, parentElement);
        const values = this.getAttribute('values');
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
            this.setAttribute('from');
            if (this.from === '') {
                const xml: string = $util.optional(parentElement, `${this.attributeName}.baseVal.value`);
                if (xml) {
                    this.from = xml;
                }
                else {
                    const current = parentElement.attributes.getNamedItem(this.attributeName);
                    if (current) {
                        this.from = current.value.trim();
                    }
                }
            }
            this.values.push(this.from, this.to);
            this.keyTimes.push(0, 1);
            this.setAttribute('by');
        }
        const end = this.getAttribute('end');
        const repeatDur = this.getAttribute('repeatDur');
        const repeatCount = this.getAttribute('repeatCount');
        if (end !== '') {
            this.end = end.split(';').map(value => SvgAnimation.convertClockTime(value)).sort((a, b) => a < b ? -1 : 1);
        }
        if (repeatDur === '' || repeatDur === 'indefinite') {
            this.repeatDuration = -1;
        }
        else {
            this.repeatDuration = SvgAnimate.convertClockTime(repeatDur);
        }
        if (repeatCount === 'indefinite') {
            this._repeatCount = -1;
        }
        else {
            this._repeatCount = Math.max(1, $util.convertInt(repeatCount));
        }
        this.setAttribute('calcMode');
        this.setAttribute('additive', 'sum');
        this.setAttribute('accumulate', 'sum');
        this.setAttribute('fill', 'freeze');
    }

    set repeatCount(value) {
        this._repeatCount = value !== -1 ? Math.max(1, value) : -1;
        this.repeatDuration = -1;
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