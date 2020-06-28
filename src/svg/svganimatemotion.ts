import SvgAnimateTransform from './svganimatetransform';
import SvgBuild from './svgbuild';

import { INSTANCE_TYPE, KEYSPLINE_NAME } from './lib/constant';
import { SVG, getAttribute, getPathLength, getTargetElement } from './lib/util';

const { isPercent, parseAngle } = squared.lib.css;
const { getNamedItem } = squared.lib.dom;
const { truncateFraction } = squared.lib.math;
const { isEqual, isNumber, iterateArray, plainMap } = squared.lib.util;

const equalPoint = (item: Undef<SvgOffsetPath>, time: number, point: DOMPoint, rotate: number) => !!item && item.key === time && item.rotate === rotate && isEqual(item.value, point);

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
            iterateArray(animationElement.children, (item: SVGElement) => {
                if (item.tagName === 'mpath') {
                    let target = getTargetElement(item);
                    if (target) {
                        if (SVG.use(target)) {
                            target = getTargetElement(target);
                        }
                        if (target && SVG.shape(target)) {
                            this.motionPathElement = target;
                            return true;
                        }
                    }
                }
                return;
            });
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
                    let distance = isPercent(value)
                        ? parseFloat(value) / 100
                        : isNumber(value)
                            ? parseFloat(value) / this.offsetLength
                            : NaN;
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

    protected setOffsetPath() {
        if (this._offsetPath === undefined && this.path) {
            let offsetPath = SvgBuild.getOffsetPath(this.path, this.rotate),
                distance = offsetPath.length;
            if (distance > 0) {
                const { duration, keyPoints, rotateData, framesPerSecond } = this;
                let increment = 1;
                if (duration >= distance) {
                    increment = duration / distance;
                    const length = distance - 1;
                    let i = 1;
                    while (i < length) {
                        offsetPath[i++].key *= increment;
                    }
                    offsetPath[length].key = duration;
                }
                else if (duration > 0) {
                    const result: SvgOffsetPath[] = new Array(duration);
                    const j = distance / duration;
                    let item!: SvgOffsetPath;
                    let i = 0;
                    while (i < duration) {
                        item = offsetPath[Math.floor(i * j)];
                        item.key = i;
                        result[i++] = item;
                    }
                    const end = offsetPath.pop() as SvgOffsetPath;
                    if (item.value !== end.value) {
                        end.key = duration;
                        result.push(end);
                    }
                    offsetPath = result;
                    distance = result.length;
                }
                const fps = framesPerSecond ? 1000 / framesPerSecond : 0;
                if (keyPoints.length > 0) {
                    const length = distance - 1;
                    const keyTimes = super.keyTimes;
                    const result: SvgOffsetPath[] = [];
                    if (keyPoints.length > 1) {
                        let previous: Undef<SvgOffsetPath>;
                        const q = keyTimes.length - 1;
                        for (let i = 0; i < q; ++i) {
                            const keyTime = keyTimes[i];
                            const baseTime = truncateFraction(keyTime * duration);
                            const offsetDuration = truncateFraction((keyTimes[i + 1] - keyTime) * duration);
                            const from = keyPoints[i];
                            const to = keyPoints[i + 1];
                            if (offsetDuration === 0) {
                                const key = baseTime;
                                const { value, rotate } = offsetPath[Math.floor(to * length)];
                                if (!equalPoint(previous, key, value, rotate)) {
                                    previous = { key, value, rotate };
                                    result.push(previous);
                                }
                            }
                            else {
                                let nextFrame = baseTime;
                                let j = 0;
                                if (from === to) {
                                    const { value, rotate } = offsetPath[Math.floor(from * length)];
                                    if (equalPoint(previous, baseTime, value, rotate)) {
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
                                    let k = minTime;
                                    while (k <= maxTime) {
                                        partial.push(offsetPath[k++]);
                                    }
                                    if (from > to) {
                                        partial.reverse();
                                    }
                                    const r = partial.length;
                                    const offsetInterval = offsetDuration / r;
                                    const item = partial[0];
                                    if (equalPoint(previous, baseTime, item.value, item.rotate)) {
                                        ++j;
                                        nextFrame += fps;
                                    }
                                    for ( ; j < r; ++j) {
                                        const key = baseTime + (j * offsetInterval);
                                        if (key >= nextFrame) {
                                            const next = partial[j];
                                            next.key = key;
                                            result.push(next);
                                            if (j < r - 1) {
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
                        result.push(offsetPath[Math.floor(keyPoints[0] * length)]);
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
                    const end = offsetPath.pop() as SvgOffsetPath;
                    if (result[result.length - 1] !== end) {
                        result.push(end);
                    }
                    this._offsetPath = result;
                }
                else {
                    this._offsetPath = offsetPath;
                }
                if (rotateData) {
                    offsetPath = this._offsetPath;
                    const q = rotateData.length - 1;
                    for (let i = 0, j = 0; i < q; ++i) {
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
                        if (isNaN(angleFrom) || isNaN(angleTo)) {
                            continue;
                        }
                        const autoValue = fromValue.startsWith('auto');
                        if (fromValue === toValue || angleFrom === angleTo) {
                            const r = timeRange.length;
                            if (autoValue) {
                                if (angleFrom !== 0) {
                                    let k = 0;
                                    while (k < r) {
                                        timeRange[k++].rotate += angleFrom;
                                    }
                                }
                            }
                            else {
                                let k = 0;
                                while (k < r) {
                                    timeRange[k++].rotate = angleFrom;
                                }
                            }
                        }
                        else {
                            const offset = angleTo - angleFrom;
                            const length = timeRange.length - 1;
                            const l = offset / length;
                            let k = 0;
                            if (autoValue) {
                                while (k < length) {
                                    timeRange[k].rotate += angleFrom + (k++ * l);
                                }
                                timeRange[length].rotate += angleFrom + offset;
                            }
                            else {
                                while (k < length) {
                                    timeRange[k].rotate = angleFrom + (k++ * l);
                                }
                                timeRange[length].rotate = angleFrom + offset;
                            }
                        }
                    }
                }
                this.keySplines = undefined;
                this.timingFunction = KEYSPLINE_NAME.linear;
            }
        }
    }

    protected reverseKeyPoints() {
        let keyTimes: Undef<number[]>,
            keyPoints: Undef<number[]>;
        if (this.validKeyPoints()) {
            keyPoints = this._keyPoints.slice(0).reverse();
            keyTimes = plainMap(super.keyTimes, value => 1 - value).reverse();
        }
        return { keyTimes, keyPoints };
    }

    protected validKeyPoints() {
        const keyPoints = this.keyPoints;
        return keyPoints.length > 0 && keyPoints.length === super.keyTimes.length;
    }

    set keyTimes(value) {
        if (!this.path) {
            super.keyTimes = value;
        }
    }
    get keyTimes() {
        this.setOffsetPath();
        const path = this._offsetPath;
        if (path) {
            const duration = this.duration;
            return plainMap(path, item => item.key / duration);
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
        return this._offsetPath ? plainMap(this._offsetPath, item => `${item.value.x} ${item.value.y}`) : super.values;
    }

    set reverse(value) {
        if (value !== this._reverse) {
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
        return this._reverse;
    }

    set alternate(value) {
        const iterationCount = this.iterationCount;
        if (value !== this._alternate && (iterationCount === -1 || iterationCount > 1)) {
            const { keyTimes, keyPoints } = this.reverseKeyPoints();
            if (keyTimes && keyPoints) {
                let keyTimesBase = super.keyTimes,
                    keyPointsBase = this.keyPoints;
                const length = keyTimesBase.length;
                if (iterationCount === -1) {
                    let i = 0;
                    while (i < length) {
                        keyTimesBase[i] /= 2;
                        keyTimes[i] = 0.5 + keyTimes[i++] / 2;
                    }
                    keyTimesBase = keyTimesBase.concat(keyTimes);
                    keyPointsBase = keyPointsBase.concat(keyPoints);
                    this.duration = this.duration * 2;
                }
                else {
                    const keyTimesStatic = keyTimesBase.slice(0);
                    const keyPointsStatic = keyPointsBase.slice(0);
                    let j: number;
                    for (let i = 0; i < iterationCount; ++i) {
                        if (i === 0) {
                            j = 0;
                            while (j < length) {
                                keyTimesBase[j++] /= iterationCount;
                            }
                        }
                        else {
                            const baseTime = i * (1 / iterationCount);
                            const keyTimesAppend = i % 2 === 0 ? keyTimesStatic.slice(0) : keyTimes.slice(0);
                            j = 0;
                            while (j < length) {
                                keyTimesAppend[j] = truncateFraction(baseTime + keyTimesAppend[j++] / iterationCount);
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
                this._alternate = value;
            }
        }
    }
    get alternate() {
        return this._alternate;
    }

    set parent(value) {
        this._parent = value;
        const container = this.parentContainer;
        if (container?.requireRefit && this.path) {
            this.path = SvgBuild.transformRefit(this.path, { container });
       }
    }
    get parent() {
        return this._parent;
    }

    get offsetPath() {
        return this._offsetPath;
    }

    get playable() {
        return !this.paused && this.duration !== -1 && !!this.path;
    }

    get rotateValues() {
        this.setOffsetPath();
        return this._offsetPath && plainMap(this._offsetPath, item => item.rotate);
    }

    get keyPoints() {
        return this._keyPoints;
    }

    get offsetLength() {
        return this._offsetLength === 0 && this.path ? getPathLength(this.path) : this._offsetLength;
    }

    get instanceType() {
        return INSTANCE_TYPE.SVG_ANIMATE_MOTION;
    }
}