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
    public calcMode = '';
    public additive = false;
    public accumulate = false;
    public freeze = false;
    public repeatDur: number | undefined;
    public repeatCount: number | undefined;

    private _end = 0;
    private _endMS = 0;
    private _repeatDurationMS = 0;

    constructor(
        public element: SVGAnimateElement,
        public parentElement: SVGGraphicsElement)
    {
        super(element, parentElement);
        const attributeName = element.attributes.getNamedItem('attributeName');
        if (attributeName) {
            this.attributeName = attributeName.value.trim();
        }
        const attributeType = element.attributes.getNamedItem('attributeType');
        if (attributeType) {
            this.attributeType = attributeType.value.trim();
        }
        const values = element.attributes.getNamedItem('values');
        if (values) {
            this.values.push(...$util.flatMap(values.value.split(';'), value => value.trim()));
            if (this.values.length > 1) {
                this.from = this.values[0];
                this.to = this.values[this.values.length - 1];
                const keyTimes = element.attributes.getNamedItem('keyTimes');
                if (keyTimes) {
                    const times = SvgAnimate.toFractionList(keyTimes.value);
                    if (times.length === this.values.length) {
                        this.keyTimes.push(...times);
                    }
                }
            }
        }
        else {
            if (this.to) {
                this.values.push(this.from, this.to);
                this.keyTimes.push(0, 1);
                const by = element.attributes.getNamedItem('by');
                if (by) {
                    this.by = by.value.trim();
                }
            }
        }
        const end = element.attributes.getNamedItem('end');
        const repeatDur = element.attributes.getNamedItem('repeatDur');
        const repeatCount = element.attributes.getNamedItem('repeatCount');
        if (end) {
            if (end.value === 'indefinite') {
                this._end = -1;
            }
            else {
                [this._end, this._endMS] = SvgAnimate.convertClockTime(end.value);
            }
        }
        if (repeatDur) {
            if (repeatDur.value === 'indefinite') {
                this.repeatDur = -1;
            }
            else {
                [this.repeatDur, this._repeatDurationMS] = SvgAnimate.convertClockTime(repeatDur.value);
            }
        }
        if (repeatCount) {
            if (repeatCount.value === 'indefinite') {
                this.repeatCount = -1;
            }
            else {
                const value = parseInt(repeatCount.value);
                if (!isNaN(value)) {
                    this.repeatCount = value;
                }
            }
        }
        const calcMode = element.attributes.getNamedItem('calcMode');
        if (calcMode) {
            switch (calcMode.value) {
                case 'discrete':
                case 'linear':
                case 'paced':
                case 'spline':
                    this.calcMode = calcMode.value;
                    break;
            }
        }
        const additive = element.attributes.getNamedItem('additive');
        if (additive) {
            this.additive = additive.value === 'sum';
        }
        const accumulate = element.attributes.getNamedItem('accumulate');
        if (accumulate) {
            this.accumulate = accumulate.value === 'sum';
        }
        const fill = element.attributes.getNamedItem('fill');
        if (fill) {
            this.freeze = fill.value === 'freeze';
        }
    }

    get end() {
        return this._end !== -1 ? this._end * 1000 + this._endMS : this._end;
    }

    get repeatDuration() {
        return this.repeatDur !== undefined && this.repeatDur !== -1 ? this.repeatDur * 1000 + this._repeatDurationMS : 0;
    }
}