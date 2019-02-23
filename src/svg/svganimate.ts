import { SvgAnimationAttribute } from './@types/object';

import SvgAnimation from './svganimation';
import SvgBuild from './svgbuild';

import { INSTANCE_TYPE, KEYSPLINE_NAME, FILL_MODE } from './lib/constant';

type SvgIntervalMap = squared.svg.SvgIntervalMap;
type SvgIntervalValue = squared.svg.SvgIntervalValue;

const $color = squared.lib.color;
const $dom = squared.lib.dom;
const $util = squared.lib.util;

function invertControlPoint(value: number) {
    return parseFloat((1 - value).toPrecision(5));
}

export default class SvgAnimate extends SvgAnimation implements squared.svg.SvgAnimate {
    public static getGroupDuration(item: SvgAnimationAttribute) {
        return item.iterationCount === 'infinite' ? Number.POSITIVE_INFINITY : item.delay + item.duration * parseInt(item.iterationCount);
    }

    public static getIntervalMap(animations: squared.svg.SvgAnimation[], ...attrs: string[]) {
        animations = (attrs.length ? $util.filterArray(animations, item => attrs.includes(item.attributeName)) : animations.slice(0)).sort((a, b) => {
            if (a.delay === b.delay) {
                return a.group.id < b.group.id ? 1 : -1;
            }
            return a.delay < b.delay ? -1 : 1;
        });
        if (attrs.length === 0) {
            for (const item of animations) {
                if (!attrs.includes(item.attributeName)) {
                    attrs.push(item.attributeName);
                }
            }
        }
        const result: SvgIntervalMap = {};
        const intervalMap: ObjectMap<ObjectIndex<SvgIntervalValue[]>> = {};
        const intervalTimes: ObjectMap<Set<number>> = {};
        function insertIntervalValue(attr: string, time: number, value: string, duration = 0, animate?: squared.svg.SvgAnimation, start = false, end = false, fillMode = 0, infinite = false, valueFrom?: string) {
            if (intervalMap[attr][time] === undefined) {
                intervalMap[attr][time] = [];
            }
            intervalMap[attr][time].push({
                time,
                value,
                animate,
                start,
                end,
                duration,
                fillMode,
                infinite,
                valueFrom
            });
            intervalTimes[attr].add(time);
        }
        for (const attr of attrs) {
            result[attr] = new Map<number, SvgIntervalValue[]>();
            intervalMap[attr] = {};
            intervalTimes[attr] = new Set<number>();
            const backwards = <SvgAnimate> $util.filterArray(animations, item => item.fillBackwards && item.attributeName === attr).sort((a, b) => a.group.id < b.group.id ? -1 : 1)[0];
            if (backwards) {
                insertIntervalValue(attr, 0, backwards.values[0], backwards.delay, backwards, backwards.delay === 0, false, FILL_MODE.BACKWARDS);
            }
        }
        for (const item of animations) {
            const attr = item.attributeName;
            if (intervalMap[attr][-1] === undefined && item.baseFrom) {
                insertIntervalValue(attr, -1, item.baseFrom);
            }
            if (item.setterType) {
                const fillReplace = item.fillReplace && item.duration > 0;
                insertIntervalValue(attr, item.delay, item.to, fillReplace ? item.delay + item.duration : 0, item, fillReplace, !fillReplace, FILL_MODE.FREEZE);
                if (fillReplace) {
                    insertIntervalValue(attr, item.delay + item.duration, '', 0, item, false, true, FILL_MODE.FREEZE);
                }
            }
            else if (SvgBuild.asAnimate(item) && item.duration > 0) {
                const infinite = item.iterationCount === -1;
                const timeEnd = item.getTotalDuration();
                insertIntervalValue(attr, item.delay, item.valueTo, timeEnd, item, true, false, 0, infinite, item.valueFrom);
                if (!infinite && !item.fillReplace) {
                    insertIntervalValue(attr, timeEnd, item.valueTo, 0, item, false, true, item.fillForwards ? FILL_MODE.FORWARDS : FILL_MODE.FREEZE);
                }
            }
        }
        for (const attr in intervalMap) {
            for (const time of $util.sortNumber(Array.from(intervalTimes[attr]))) {
                const values = intervalMap[attr][time];
                for (let i = 0; i < values.length; i++) {
                    const interval = values[i];
                    if (interval.value === '') {
                        let value: string | undefined;
                        for (const group of result[attr].values()) {
                            for (const previous of group) {
                                if (interval.animate !== previous.animate && previous.value !== '' && (previous.time === -1 || previous.fillMode === FILL_MODE.FORWARDS || previous.fillMode === FILL_MODE.FREEZE)) {
                                    value = previous.value;
                                    break;
                                }
                            }
                        }
                        if (value) {
                            interval.value = value;
                        }
                        else {
                            values.splice(i--, 1);
                        }
                    }
                }
                if (values.length) {
                    values.sort((a, b) => {
                        if (a.animate && b.animate) {
                            if (a.fillMode === b.fillMode) {
                                return a.animate.group.id < b.animate.group.id ? 1 : -1;
                            }
                            return a.fillMode < b.fillMode ? 1 : -1;
                        }
                        return 0;
                    });
                    result[attr].set(time, values);
                }
            }
        }
        for (const attr in result) {
            for (const [timeA, dataA] of result[attr].entries()) {
                for (const itemA of dataA) {
                    if (itemA.animate) {
                        if (itemA.fillMode === FILL_MODE.FREEZE) {
                            const previous: SvgAnimation[] = [];
                            for (const [timeB, dataB] of result[attr].entries()) {
                                if (timeB < timeA) {
                                    for (const itemB of dataB) {
                                        if (itemB.start && itemB.animate && itemB.animate.animationElement) {
                                            previous.push(<SvgAnimation> itemB.animate);
                                        }
                                    }
                                }
                                else if (timeB > timeA) {
                                    for (let i = 0; i < dataB.length; i++) {
                                        const itemB = dataB[i];
                                        if (itemB.end && previous.includes(<SvgAnimation> itemB.animate)) {
                                            dataB.splice(i--, 1);
                                        }
                                    }
                                }
                                else {
                                    for (let i = 0; i < dataB.length; i++) {
                                        const itemB = dataB[i];
                                        if (itemB.end && itemB.animate && itemB.animate.animationElement && itemB.animate.group.id < itemA.animate.group.id) {
                                            dataB.splice(i--, 1);
                                        }
                                    }
                                }
                            }
                        }
                        else if (itemA.fillMode === FILL_MODE.FORWARDS || itemA.infinite) {
                            let forwarded = false;
                            if (itemA.animate.group.ordering) {
                                const duration = (<SvgAnimate> itemA.animate).getTotalDuration();
                                for (const sibling of itemA.animate.group.ordering) {
                                    if (sibling.name === itemA.animate.group.name) {
                                        forwarded = true;
                                    }
                                    else if (SvgAnimate.getGroupDuration(sibling) >= duration) {
                                        break;
                                    }
                                }
                            }
                            const previous: SvgAnimation[] = [];
                            for (const [timeB, dataB] of result[attr].entries()) {
                                if (!forwarded && timeB < timeA) {
                                    for (const itemB of dataB) {
                                        if (itemB.start && itemB.animate) {
                                            previous.push(<SvgAnimation> itemB.animate);
                                        }
                                    }
                                }
                                else if (timeB > timeA) {
                                    for (let i = 0; i < dataB.length; i++) {
                                        const itemB = dataB[i];
                                        if (forwarded || itemB.animate && (itemB.end && previous.includes(<SvgAnimation> itemB.animate) || itemA.animate.animationElement === null && itemB.animate.group.id < itemA.animate.group.id)) {
                                            dataB.splice(i--, 1);
                                        }
                                    }
                                }
                                else {
                                    for (let i = 0; i < dataB.length; i++) {
                                        const itemB = dataB[i];
                                        if (itemB.end && itemB.animate && itemB.animate.group.id < itemA.animate.group.id) {
                                            dataB.splice(i--, 1);
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
        for (const attr in result) {
            for (const [time, data] of Array.from(result[attr].entries())) {
                if (data.length === 0) {
                    result[attr].delete(time);
                }
            }
        }
        return result;
    }

    public static getIntervalValue(map: SvgIntervalMap, attr: string, interval: number, playing = false) {
        let result: string | undefined;
        if (map[attr]) {
            for (const [time, data] of map[attr].entries()) {
                if (time <= interval) {
                    for (const previous of data) {
                        if (previous.value !== '' && (previous.time === -1 || previous.end && (previous.fillMode === FILL_MODE.FORWARDS || previous.fillMode === FILL_MODE.FREEZE)) || playing && previous.start && time !== interval) {
                            result = previous.value;
                            break;
                        }
                    }
                }
                else {
                    break;
                }
            }
        }
        return result;
    }

    public static getSplitValue(value: number, next: number, percent: number) {
        return value + (next - value) * percent;
    }

    public static toStepFractionList(name: string, keyTimes: number[], values: string[], keySpline: string, index: number, fontSize?: number): [number[], string[]] | undefined {
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
                currentValue = $util.replaceMap<string, number>(values[index].trim().split(/\s+/), value => parseFloat(value));
                nextValue = $util.replaceMap<string, number>(values[index + 1].trim().split(/\s+/), value => parseFloat(value));
                break;
            default:
                if ($util.isNumber(values[index])) {
                    currentValue = [parseFloat(values[index])];
                }
                else if ($util.isUnit(values[index])) {
                    currentValue = [parseFloat($util.convertPX(values[index], fontSize))];
                }
                if ($util.isNumber(values[index + 1])) {
                    nextValue = [parseFloat(values[index + 1])];
                }
                else if ($util.isUnit(values[index + 1])) {
                    nextValue = [parseFloat($util.convertPX(values[index + 1], fontSize))];
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
                                SvgAnimate.getSplitValue(current.rgba.r, next.rgba.r, percent),
                                SvgAnimate.getSplitValue(current.rgba.g, next.rgba.g, percent),
                                SvgAnimate.getSplitValue(current.rgba.b, next.rgba.b, percent)
                            );
                            const a = $color.convertHex(SvgAnimate.getSplitValue(current.rgba.a, next.rgba.a, percent));
                            value.push(`#${rgb + (a !== 'FF' ? a : '')}`);
                            break;
                        }
                        case 'points': {
                            for (let k = 0; k < currentValue.length; k++) {
                                const current = <Point> currentValue[k];
                                const next = <Point> nextValue[k];
                                value.push(`${SvgAnimate.getSplitValue(current.x, next.x, percent)},${SvgAnimate.getSplitValue(current.y, next.y, percent)}`);
                            }
                            break;
                        }
                        default: {
                            for (let k = 0; k < currentValue.length; k++) {
                                const current = currentValue[k] as number;
                                const next = nextValue[k] as number;
                                value.push(SvgAnimate.getSplitValue(current, next, percent).toString());
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
    public alternate = false;
    public additiveSum = false;
    public accumulateSum = false;
    public end?: number;
    public synchronized?: NumberValue<string>;

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
            const values = $dom.getNamedItem(animationElement, 'values');
            const keyTimes = this.duration !== -1 ? SvgAnimate.toFractionList($dom.getNamedItem(animationElement, 'keyTimes')) : [];
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
                this.from = $dom.getNamedItem(animationElement, 'from');
                if (this.to === '') {
                    const by = $dom.getNamedItem(animationElement, 'by');
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
            const repeatDur = $dom.getNamedItem(animationElement, 'repeatDur');
            if (repeatDur !== '' && repeatDur !== 'indefinite') {
                this._repeatDuration = SvgAnimation.convertClockTime(repeatDur);
            }
            const repeatCount = $dom.getNamedItem(animationElement, 'repeatCount');
            this.iterationCount = repeatCount === 'indefinite' ? -1 : parseFloat(repeatCount);
            if (animationElement.tagName === 'animate') {
                this.setCalcMode(this.attributeName);
            }
        }
    }

    public setCalcMode(name: string) {
        switch ($dom.getNamedItem(this.animationElement, 'calcMode')) {
            case 'discrete': {
                if (this.keyTimes.length === 2 && this.keyTimes[0] === 0) {
                    const keyTimes: number[] = [];
                    const values: string[] = [];
                    for (let i = 0; i < this.keyTimes.length - 1; i++) {
                        const result = SvgAnimate.toStepFractionList(name, this.keyTimes, this.values, 'step-end', i, $dom.getFontSize(this.animationElement));
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
                this.keySplines = $util.flatMap($dom.getNamedItem(this.animationElement, 'keySplines').split(';'), value => value.trim());
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

    public getPartialDuration(iteration?: number) {
        return (iteration === 0 ? this.delay : 0) + this.keyTimes[this.keyTimes.length - 1] * this.duration;
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
        const end = $dom.getNamedItem(this.animationElement, 'end');
        if (end !== '') {
            const endTime = $util.sortNumber($util.replaceMap<string, number>(end.split(';'), time => SvgAnimation.convertClockTime(time)))[0] as number | undefined;
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
        this.fillFreeze = this.iterationCount !== -1 && $dom.getNamedItem(this.animationElement, 'fill') === 'freeze';
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
        if (value !== this._reverse && this.values.length) {
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
        return this._setterType || this.animationElement !== null && this.duration === 0 && this.keyTimes.length >= 2 && this.keyTimes[0] === 0;
    }

    get instanceType() {
        return INSTANCE_TYPE.SVG_ANIMATE;
    }
}