import { SvgOffsetPath } from '../../@types/svg/object';

import SvgAnimateTransform from './svganimatetransform';
import SvgBuild from './svgbuild';

import { INSTANCE_TYPE, KEYSPLINE_NAME } from './lib/constant';
import { SVG, getAttribute, getPathLength, getTargetElement } from './lib/util';

const $lib = squared.lib;

const { isPercent, parseAngle } = $lib.css;
const { getNamedItem } = $lib.dom;
const { truncateFraction } = $lib.math;
const { isEqual, isNumber, isString, objectMap } = $lib.util;

export default class SvgAnimateMotion extends SvgAnimateTransform implements squared.svg.SvgAnimateMotion {
    public path = '';
    public distance = '0%';
    public rotate = 'auto 0deg';
    public motionPathElement: Null<SVGGeometryElement> = null;
    public rotateData?: NumberValue[];
    public framesPerSecond?: number;
    public readonly type = SVGTransform.SVG_TRANSFORM_TRANSLATE;

    private _offsetLength = 0;
    private _keyPoints: number[] = [];
    private _offsetPath?: SvgOffsetPath[];

    constructor(element?: SVGGraphicsElement, animationElement?: SVGAnimateMotionElement) {
        super(element, animationElement);
        if (animationElement) {
            this.setAttribute('path');
            const rotate = getNamedItem(animationElement, 'rotate');
            switch (rotate) {
                case 'auto':
                    break;
                case 'auto-reverse':
                    this.rotate = 'auto 180deg';
                    break;
                default:
                    if (isNumber(rotate)) {
                        this.rotate = parseFloat(rotate) + 'deg';
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
            const distance = getAttribute(element, 'offset-distance');
            if (distance !== '') {
                this.distance = distance;
            }
            const rotate = getAttribute(element, 'offset-rotate');
            if (rotate !== '' && rotate !== 'auto') {
                this.rotate = rotate;
            }
        }
    }

    public setCalcMode() {
        const animationElement = this.animationElement;
        if (animationElement) {
            const mode = getNamedItem(animationElement, 'calcMode') || 'paced';
            switch (mode) {
                case 'paced':
                case 'discrete':
                case 'spline':
                    super.setCalcMode('translate', mode);
                    break;
                case 'linear': {
                    const keyPoints = SvgAnimateTransform.toFractionList(getNamedItem(animationElement, 'keyPoints'), ';', false);
                    let keyTimes = super.keyTimes;
                    if (keyTimes.length === 0 && this.duration !== -1) {
                        keyTimes = SvgAnimateTransform.toFractionList(getNamedItem(animationElement, 'keyTimes'));
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
    }

    public addKeyPoint(item: NumberValue) {
        if (this._offsetPath === undefined) {
            const key = item.key;
            if (key >= 0 && key <= 1) {
                const keyTimes = super.keyTimes;
                const keyPoints = this._keyPoints;
                if (keyTimes.length === keyPoints.length) {
                    const value = item.value;
                    let distance = NaN;
                    if (isPercent(value)) {
                        distance = parseFloat(value) / 100;
                    }
                    else if (isNumber(value)) {
                        distance = parseFloat(value) / this.offsetLength;
                    }
                    if (!isNaN(distance)) {
                        distance = Math.min(distance, 1);
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
        if (this._offsetPath === undefined && isString(this.path)) {
            const { duration, rotateData } = this;
            let offsetPath = SvgBuild.getOffsetPath(this.path, this.rotate);
            let distance = offsetPath.length;
            if (distance > 0) {
                let increment = 1;
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
                        const item = offsetPath[Math.floor(i * j)];
                        item.key = i;
                        result[i] = item;
                    }
                    const end = <SvgOffsetPath> offsetPath.pop();
                    if (result[result.length - 1].value !== end.value) {
                        end.key = duration;
                        result.push(end);
                    }
                    offsetPath = result;
                    distance = result.length;
                }
                const { framesPerSecond, keyPoints } = this;
                const fps = framesPerSecond ? 1000 / framesPerSecond : 0;
                if (keyPoints.length) {
                    const length = distance - 1;
                    const keyTimes = super.keyTimes;
                    const result: SvgOffsetPath[] = [];
                    if (keyPoints.length > 1) {
                        let previous: Undef<SvgOffsetPath>;
                        const equalPoint = (time: number, point: DOMPoint, rotate: number) => previous?.key === time && previous.rotate === rotate && isEqual(previous.value, point);
                        const lengthA = keyTimes.length;
                        for (let i = 0; i < lengthA - 1; i++) {
                            const keyTime = keyTimes[i];
                            const baseTime = truncateFraction(keyTime * duration);
                            const offsetDuration = truncateFraction((keyTimes[i + 1] - keyTime) * duration);
                            const from = keyPoints[i];
                            const to = keyPoints[i + 1];
                            if (offsetDuration === 0) {
                                const key = baseTime;
                                const { value, rotate } = offsetPath[Math.floor(to * length)];
                                if (!equalPoint(key, value, rotate)) {
                                    previous = { key, value, rotate };
                                    result.push(previous);
                                }
                            }
                            else {
                                let j = 0;
                                let nextFrame = baseTime;
                                if (from === to) {
                                    const { value, rotate } = offsetPath[Math.floor(from * length)];
                                    if (equalPoint(baseTime, value, rotate)) {
                                        j += increment;
                                        nextFrame += fps;
                                    }
                                    for ( ; j < offsetDuration; j += increment) {
                                        const key = baseTime + j;
                                        if (key >= nextFrame) {
                                            result.push({ key, value, rotate });
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
                                    const item = partial[0];
                                    if (equalPoint(baseTime, item.value, item.rotate)) {
                                        j++;
                                        nextFrame += fps;
                                    }
                                    for ( ; j < lengthB; j++) {
                                        const key = baseTime + (j * offsetInterval);
                                        if (key >= nextFrame) {
                                            const next = partial[j];
                                            next.key = key;
                                            result.push(next);
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
                    const lengthA = rotateData.length - 1;
                    for (let i = 0, j = 0; i < lengthA; i++) {
                        const from = rotateData[i];
                        const to = rotateData[i + 1];
                        const toKey = to.key;
                        const timeRange: SvgOffsetPath[] = [];
                        if (from.key === toKey) {
                            timeRange.push(offsetPath[j++]);
                        }
                        else {
                            const maxTime = Math.floor(truncateFraction(toKey * duration));
                            do {
                                const item = offsetPath[j];
                                if (item?.key <= maxTime) {
                                    timeRange.push(item);
                                }
                                else {
                                    break;
                                }
                            }
                            while (++j);
                        }
                        const fromValue = from.value;
                        const toValue = to.value;
                        const angleFrom = parseAngle(fromValue.split(' ').pop() as string);
                        const angleTo = parseAngle(toValue.split(' ').pop() as string);
                        const autoValue = /^auto/.test(fromValue);
                        if (fromValue === toValue || angleFrom === angleTo) {
                            if (autoValue) {
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
                            if (autoValue) {
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
        let keyTimes: Undef<number[]>;
        let keyPoints: Undef<number[]>;
        if (this.validKeyPoints()) {
            keyPoints = this._keyPoints.slice(0);
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
        const keyPoints = this.keyPoints;
        return keyPoints.length > 0 && keyPoints.length === super.keyTimes.length;
    }

    get offsetPath() {
        return this._offsetPath;
    }

    get playable() {
        return !this.paused && this.duration !== -1 && isString(this.path);
    }

    set keyTimes(value) {
        if (!isString(this.path)) {
            super.keyTimes = value;
        }
    }
    get keyTimes() {
        this.setOffsetPath();
        const path = this._offsetPath;
        if (path) {
            const duration = this.duration;
            return objectMap<SvgOffsetPath, number>(path, item => item.key / duration);
        }
        return super.keyTimes;
    }

    set values(value) {
        if (!isString(this.path)) {
            super.values = value;
        }
    }
    get values() {
        this.setOffsetPath();
        const path = this._offsetPath;
        if (path) {
            return objectMap<SvgOffsetPath, string>(path, item => {
                const { x, y } = item.value;
                return x + ' ' + y;
            });
        }
        return super.values;
    }

    get rotateValues() {
        this.setOffsetPath();
        const path = this._offsetPath;
        return path ? objectMap<SvgOffsetPath, number>(path, item => item.rotate) : undefined;
    }

    get keyPoints() {
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
                let keyTimesBase = super.keyTimes;
                let keyPointsBase = this.keyPoints;
                const length = keyTimesBase.length;
                if (iterationCount === -1) {
                    for (let i = 0; i < length; i++) {
                        keyTimesBase[i] /= 2;
                        keyTimes[i] = 0.5 + keyTimes[i] / 2;
                    }
                    keyTimesBase = keyTimesBase.concat(keyTimes);
                    keyPointsBase = keyPointsBase.concat(keyPoints);
                    this.duration = this.duration * 2;
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
                                keyTimesAppend[j] = truncateFraction(baseTime + keyTimesAppend[j] / iterationCount);
                            }
                            keyTimesBase = keyTimesBase.concat(keyTimesAppend);
                            keyPointsBase = keyPointsBase.concat(i % 2 === 0 ? keyPointsStatic : keyPoints);
                        }
                    }
                    this.duration = this.duration * iterationCount;
                    this.iterationCount = 1;
                }
                this._keyTimes = keyTimesBase;
                this._keyPoints = keyPointsBase;
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
        if (parentContainer?.requireRefit) {
            const path = this.path;
            if (path) {
                this.path = SvgBuild.transformRefit(path, undefined, undefined, parentContainer);
            }
       }
    }
    get parent() {
        return super.parent;
    }

    get offsetLength() {
        let result = this._offsetLength;
        if (result === 0) {
            const path = this.path;
            if (path) {
                result = getPathLength(path);
            }
        }
        return result;
    }

    get instanceType() {
        return INSTANCE_TYPE.SVG_ANIMATE_MOTION;
    }
}