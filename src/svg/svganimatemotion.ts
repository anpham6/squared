import { SvgOffsetPath } from './@types/object';

import SvgAnimateTransform from './svganimatetransform';
import SvgBuild from './svgbuild';

import { INSTANCE_TYPE, KEYSPLINE_NAME } from './lib/constant';
import { SVG, getPathLength, getAttribute, getTargetElement } from './lib/util';

const $const = squared.lib.constant;
const $css = squared.lib.css;
const $dom = squared.lib.dom;
const $math = squared.lib.math;
const $util = squared.lib.util;

export default class SvgAnimateMotion extends SvgAnimateTransform implements squared.svg.SvgAnimateMotion {
    public path = '';
    public distance = $const.CSS.PERCENT_0;
    public rotate = 'auto 0deg';
    public motionPathElement: SVGGeometryElement | null = null;
    public rotateData?: NumberValue[];
    public framesPerSecond?: number;
    public readonly type = SVGTransform.SVG_TRANSFORM_TRANSLATE;

    private _offsetLength = 0;
    private _offsetPath?: SvgOffsetPath[];
    private _keyPoints?: number[];

    constructor(element?: SVGGraphicsElement, animationElement?: SVGAnimateMotionElement) {
        super(element, animationElement);
        if (animationElement) {
            this.setAttribute('path');
            const rotate = $dom.getNamedItem(this.animationElement, 'rotate');
            switch (rotate) {
                case 'auto':
                    break;
                case 'auto-reverse':
                    this.rotate = 'auto 180deg';
                    break;
                default:
                    if ($util.isNumber(rotate)) {
                        this.rotate = `${$util.convertFloat(rotate)}deg`;
                    }
                    break;
            }
            const children = animationElement.children;
            const length = children.length;
            for (let i = 0; i < length; i++) {
                const item = children[i];
                if (item.tagName === 'mpath') {
                    let target = getTargetElement(<SVGElement> item);
                    if (target) {
                        if (SVG.use(target)) {
                            target = getTargetElement(target);
                        }
                        if (target && SVG.shape(target)) {
                            this.motionPathElement = target;
                            break;
                        }
                    }
                }
            }
            this.setCalcMode();
        }
        else if (element) {
            const path = /path\("([^"]+)"\)/.exec(getAttribute(element, 'offset-path'));
            if (path) {
                this.path = path[1];
            }
            const distance = getAttribute(element, 'offset-distance', false);
            if (distance !== '') {
                this.distance = distance;
            }
            const rotate = getAttribute(element, 'offset-rotate', false);
            if (rotate !== '' && rotate !== $const.CSS.AUTO) {
                this.rotate = rotate;
            }
        }
    }

    public setCalcMode() {
        if (this.animationElement) {
            const mode = $dom.getNamedItem(this.animationElement, 'calcMode') || 'paced';
            switch (mode) {
                case 'paced':
                case 'discrete':
                case 'spline':
                    super.setCalcMode('translate', mode);
                    break;
                case 'linear':
                    const keyPoints = SvgAnimateTransform.toFractionList($dom.getNamedItem(this.animationElement, 'keyPoints'), ';', false);
                    let keyTimes = super.keyTimes;
                    if (keyTimes.length === 0 && this.duration !== -1) {
                        keyTimes = SvgAnimateTransform.toFractionList($dom.getNamedItem(this.animationElement, 'keyTimes'));
                        this.length = 0;
                        super.keyTimes = keyTimes;
                    }
                    if (keyPoints.length === keyTimes.length) {
                        this._keyPoints = keyPoints;
                    }
                    break;
            }
        }
    }

    public addKeyPoint(item: NumberValue) {
        if (this._offsetPath === undefined) {
            const key = item.key;
            if (key >= 0 && key <= 1) {
                const keyTimes = super.keyTimes;
                const keyPoints = this.keyPoints;
                if (keyTimes.length === keyPoints.length) {
                    const value = item.value;
                    let distance = NaN;
                    if ($css.isPercent(value)) {
                        distance = parseFloat(value) / 100;
                    }
                    else if ($util.isNumber(value)) {
                        distance = parseFloat(value) / this.offsetLength;
                    }
                    if (!isNaN(distance)) {
                        if (distance > 1) {
                            distance = 1;
                        }
                        const index = keyTimes.findIndex(previous => previous === key);
                        if (index !== -1) {
                            keyTimes[index] = item.key;
                            keyPoints[index] = distance;
                        }
                        else {
                            keyTimes.push(item.key);
                            keyPoints.push(distance);
                        }
                    }
                }
            }
        }
    }

    private setOffsetPath() {
        if (this._offsetPath === undefined && this.path) {
            const rotateData = this.rotateData;
            let offsetPath = SvgBuild.getOffsetPath(this.path, rotateData && this.rotate);
            let distance = offsetPath.length;
            if (distance > 0) {
                const duration = this.duration;
                let increment = NaN;
                if (duration >= distance) {
                    increment = duration / distance;
                    for (let i = 1; i < distance - 1; i++) {
                        offsetPath[i].key *= increment;
                    }
                    offsetPath[distance - 1].key = duration;
                }
                else if (duration > 0) {
                    const result: SvgOffsetPath[] = new Array(duration);
                    const j = distance / duration;
                    for (let i = 0; i < duration; i++) {
                        const index = Math.floor(i * j);
                        offsetPath[index].key = i;
                        result[i] = offsetPath[index];
                    }
                    const end = <SvgOffsetPath> offsetPath.pop();
                    if (result[result.length - 1].value !== end.value) {
                        end.key = duration;
                        result.push(end);
                    }
                    offsetPath = result;
                    distance = result.length;
                }
                const keyPoints = this.keyPoints;
                const fps = this.framesPerSecond ? 1000 / this.framesPerSecond : 0;
                if (keyPoints.length) {
                    const length = distance - 1;
                    const keyTimes = super.keyTimes;
                    const result: SvgOffsetPath[] = [];
                    if (keyPoints.length > 1) {
                        let previous: SvgOffsetPath | undefined;
                        const isEqual = (time: number, point: DOMPoint, rotate: number) => !!previous && previous.key === time && rotate === previous.rotate && $util.isEqual(previous.value, point);
                        const lengthA = keyTimes.length;
                        for (let i = 0; i < lengthA - 1; i++) {
                            const baseTime = $math.truncateFraction(keyTimes[i] * duration);
                            const offsetDuration = $math.truncateFraction((keyTimes[i + 1] - keyTimes[i]) * duration);
                            const from = keyPoints[i];
                            const to = keyPoints[i + 1];
                            if (offsetDuration === 0) {
                                const key = baseTime;
                                const { value, rotate } = offsetPath[Math.floor(to * length)];
                                if (isEqual(key, value, rotate)) {
                                    continue;
                                }
                                previous = {
                                    key,
                                    value,
                                    rotate
                                };
                                result.push(previous);
                            }
                            else {
                                let j = 0;
                                let nextFrame = baseTime;
                                if (from === to) {
                                    const { value, rotate } = offsetPath[Math.floor(from * length)];
                                    const offsetInterval = !isNaN(increment) ? increment : 1;
                                    if (isEqual(baseTime, value, rotate)) {
                                        j += offsetInterval;
                                        nextFrame += fps;
                                    }
                                    for ( ; j < offsetDuration; j += offsetInterval) {
                                        const key = baseTime + j;
                                        if (key >= nextFrame) {
                                            result.push({
                                                key,
                                                value,
                                                rotate
                                            });
                                            if (j < offsetDuration - 1) {
                                                nextFrame += fps;
                                            }
                                            else {
                                                nextFrame = 0;
                                            }
                                        }
                                    }
                                }
                                else {
                                    const minTime = Math.floor(Math.min(from, to) * length);
                                    const maxTime = Math.floor(Math.max(from, to) * length);
                                    const partial: SvgOffsetPath[] = [];
                                    for (let k = minTime; k <= maxTime; k++) {
                                        partial.push({ ...offsetPath[k] });
                                    }
                                    if (from > to) {
                                        partial.reverse();
                                    }
                                    const lengthB = partial.length;
                                    const offsetInterval = offsetDuration / lengthB;
                                    if (isEqual(baseTime, partial[0].value, partial[0].rotate)) {
                                        j++;
                                        nextFrame += fps;
                                    }
                                    for ( ; j < lengthB; j++) {
                                        const key = baseTime + (j * offsetInterval);
                                        if (key >= nextFrame) {
                                            partial[j].key = key;
                                            result.push(partial[j]);
                                            if (j < lengthB - 1) {
                                                nextFrame += fps;
                                            }
                                            else {
                                                nextFrame = 0;
                                            }
                                        }
                                    }
                                }
                                result[result.length - 1].key = baseTime + offsetDuration;
                            }
                        }
                    }
                    else {
                        result.push({ ...offsetPath[Math.floor(keyPoints[0] * length)] });
                        if (keyTimes[0] === 0) {
                            result[0].rotate = 0;
                        }
                    }
                    this._offsetPath = result;
                }
                else if (fps > 0) {
                    const result: SvgOffsetPath[] = [];
                    for (let i = 0; i < distance; i += fps) {
                        result.push(offsetPath[Math.floor(i)]);
                    }
                    const end = <SvgOffsetPath> offsetPath.pop();
                    if (end !== result[result.length - 1]) {
                        result.push(end);
                    }
                    this._offsetPath = result;
                }
                else {
                    this._offsetPath = offsetPath;
                }
                if (rotateData) {
                    offsetPath = this._offsetPath;
                    for (let i = 0, j = 0; i < rotateData.length - 1; i++) {
                        const from = rotateData[i];
                        const to = rotateData[i + 1];
                        const timeRange: SvgOffsetPath[] = [];
                        if (from.key === to.key) {
                            timeRange.push(offsetPath[j++]);
                        }
                        else {
                            const maxTime = Math.floor($math.truncateFraction(to.key * duration));
                            for ( ; ; j++) {
                                const item = offsetPath[j];
                                if (item && item.key <= maxTime) {
                                    timeRange.push(item);
                                }
                                else {
                                    break;
                                }
                            }
                        }
                        const angleFrom = $css.parseAngle(from.value.split(' ').pop() as string);
                        const angleTo = $css.parseAngle(to.value.split(' ').pop() as string);
                        if (from.value === to.value || angleFrom === angleTo) {
                            if (from.value.startsWith($const.CSS.AUTO)) {
                                if (angleFrom !== 0) {
                                    for (const item of timeRange) {
                                        item.rotate += angleFrom;
                                    }
                                }
                            }
                            else {
                                for (const item of timeRange) {
                                    item.rotate = angleFrom;
                                }
                            }
                        }
                        else {
                            const offset = angleTo - angleFrom;
                            const length = timeRange.length;
                            const l = offset / length;
                            if (from.value.startsWith($const.CSS.AUTO)) {
                                for (let k = 0; k < length - 1; k++) {
                                    timeRange[k].rotate += angleFrom + (k * l);
                                }
                                timeRange[length - 1].rotate += angleFrom + offset;
                            }
                            else {
                                for (let k = 0; k < length - 1; k++) {
                                    timeRange[k].rotate = angleFrom + (k * l);
                                }
                                timeRange[length - 1].rotate = angleFrom + offset;
                            }
                        }
                    }
                }
                this.keySplines = undefined;
                this.timingFunction = KEYSPLINE_NAME.linear;
            }
        }
    }

    private reverseKeyPoints() {
        let keyTimes: number[] | undefined;
        let keyPoints: number[] | undefined;
        if (this.validKeyPoints()) {
            keyPoints = (this._keyPoints as number[]).slice(0);
            keyPoints.reverse();
            keyTimes = [];
            for (const keyTime of super.keyTimes) {
                keyTimes.push(1 - keyTime);
            }
            keyTimes.reverse();
        }
        return { keyTimes, keyPoints };
    }

    private validKeyPoints() {
        return !!this._keyPoints && this._keyPoints.length > 0 && this._keyPoints.length === super.keyTimes.length;
    }

    get offsetPath() {
        return this._offsetPath;
    }

    get playable() {
        return !this.paused && this.duration !== -1 && $util.isString(this.path);
    }

    set keyTimes(value) {
        if (!this.path) {
            super.keyTimes = value;
        }
    }
    get keyTimes() {
        this.setOffsetPath();
        if (this._offsetPath) {
            const duration = this.duration;
            return $util.objectMap<SvgOffsetPath, number>(this._offsetPath, item => item.key / duration);
        }
        return super.keyTimes;
    }

    set values(value) {
        if (!this.path) {
            super.values = value;
        }
    }
    get values() {
        this.setOffsetPath();
        if (this._offsetPath) {
            return $util.objectMap<SvgOffsetPath, string>(this._offsetPath, item => `${item.value.x} ${item.value.y}`);
        }
        return super.values;
    }

    get rotateValues() {
        this.setOffsetPath();
        if (this._offsetPath) {
            return $util.objectMap<SvgOffsetPath, number>(this._offsetPath, item => item.rotate);
        }
        return undefined;
    }

    get keyPoints() {
        if (this._keyPoints === undefined) {
            this._keyPoints = [];
        }
        return this._keyPoints;
    }

    set reverse(value) {
        if (value !== super.reverse) {
            const { keyTimes, keyPoints } = this.reverseKeyPoints();
            if (keyTimes && keyPoints) {
                this.length = 0;
                this._keyPoints = keyPoints;
                super.keyTimes = keyTimes;
                super.reverse = value;
            }
        }
    }
    get reverse() {
        return super.reverse;
    }

    set alternate(value) {
        const iterationCount = this.iterationCount;
        if (value !== super.alternate && (iterationCount === -1 || iterationCount > 1)) {
            const { keyTimes, keyPoints } = this.reverseKeyPoints();
            if (keyTimes && keyPoints) {
                const duration = this.duration;
                const keyTimesBase = super.keyTimes;
                const keyPointsBase = this.keyPoints;
                const length = keyTimesBase.length;
                if (iterationCount === -1) {
                    for (let i = 0; i < length; i++) {
                        keyTimesBase[i] /= 2;
                        keyTimes[i] = 0.5 + keyTimes[i] / 2;
                    }
                    $util.concatArray(keyTimesBase, keyTimes);
                    $util.concatArray(keyPointsBase, keyPoints);
                    this.duration = duration * 2;
                }
                else {
                    const keyTimesStatic = keyTimesBase.slice(0);
                    const keyPointsStatic = keyPointsBase.slice(0);
                    for (let i = 0; i < iterationCount; i++) {
                        if (i === 0) {
                            for (let j = 0; j < length; j++) {
                                keyTimesBase[j] /= iterationCount;
                            }
                        }
                        else {
                            const baseTime = i * (1 / iterationCount);
                            const keyTimesAppend = i % 2 === 0 ? keyTimesStatic.slice(0) : keyTimes.slice(0);
                            for (let j = 0; j < length; j++) {
                                keyTimesAppend[j] = $math.truncateFraction(baseTime + keyTimesAppend[j] / iterationCount);
                            }
                            $util.concatArray(keyTimesBase, keyTimesAppend);
                            $util.concatArray(keyPointsBase, i % 2 === 0 ? keyPointsStatic : keyPoints);
                        }
                    }
                    this.duration = duration * iterationCount;
                    this.iterationCount = 1;
                }
                super.alternate = value;
            }
        }
    }
    get alternate() {
        return super.alternate;
    }

    set parent(value) {
        super.parent = value;
        const parentContainer = this.parentContainer;
        if (parentContainer && parentContainer.requireRefit && this.path) {
            this.path = SvgBuild.transformRefit(this.path, undefined, undefined, parentContainer);
        }
    }
    get parent() {
        return super.parent;
    }

    get offsetLength() {
        if (this._offsetLength === 0 && this.path) {
            this._offsetLength = getPathLength(this.path);
        }
        return this._offsetLength;
    }

    get instanceType() {
        return INSTANCE_TYPE.SVG_ANIMATE_MOTION;
    }
}