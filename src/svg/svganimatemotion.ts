import { SvgOffsetPath } from './@types/object';

import SvgAnimateTransform from './svganimatetransform';
import SvgBuild from './svgbuild';

import { INSTANCE_TYPE, KEYSPLINE_NAME } from './lib/constant';
import { SVG, getPathLength, getAttribute, getTargetElement } from './lib/util';

const $css = squared.lib.css;
const $dom = squared.lib.dom;
const $math = squared.lib.math;
const $util = squared.lib.util;

export default class SvgAnimateMotion extends SvgAnimateTransform implements squared.svg.SvgAnimateMotion {
    public path = '';
    public motionPathElement: SVGGeometryElement | null = null;
    public rotate = 'auto 0deg';
    public distance = '0%';
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
                    this.rotate = $util.convertFloat(rotate).toString();
                    break;
            }
            for (let i = 0; i < animationElement.children.length; i++) {
                const item = animationElement.children[i];
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
            const match = /path\("([^"]+)"\)/.exec(getAttribute(element, 'offset-path'));
            if (match) {
                this.path = match[1];
            }
            const distance = getAttribute(element, 'offset-distance', false);
            if (distance !== '') {
                this.distance = distance;
            }
            const rotate = getAttribute(element, 'offset-rotate', false);
            if (rotate !== '') {
                this.rotate = $css.isAngle(rotate) ? $css.parseAngle(rotate).toString() : rotate;
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
            const offsetLength = this.offsetLength;
            const { key, value } = item;
            if (offsetLength > 0 && key >= 0 && key <= 1) {
                const keyTimes = super.keyTimes;
                const keyPoints = this.keyPoints;
                if (keyTimes.length === keyPoints.length) {
                    let distance = NaN;
                    if ($css.isPercent(value)) {
                        distance = parseFloat(value) / 100;
                    }
                    else if ($util.isNumber(value)) {
                        distance = parseFloat(value) / offsetLength;
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
        if (this._offsetPath === undefined && this.path !== '') {
            let offsetPath = SvgBuild.getOffsetPath(this.path, this.rotate);
            let distance = offsetPath.length;
            if (distance > 0) {
                const duration = this.duration;
                if (duration > 0) {
                    if (duration >= distance) {
                        const increment = duration / distance;
                        for (let i = 1; i < distance - 1; i++) {
                            offsetPath[i].key *= increment;
                        }
                        offsetPath[distance - 1].key = duration;
                    }
                    else {
                        const increment = distance / duration;
                        const result: SvgOffsetPath[] = new Array(duration + 1);
                        result[0] = offsetPath[0];
                        for (let i = 1; i < duration; i++) {
                            const j = Math.floor(i * increment);
                            offsetPath[j].key = i;
                            result[i] = offsetPath[j];
                        }
                        const end = <SvgOffsetPath> offsetPath.pop();
                        end.key = duration;
                        result[duration] = end;
                        offsetPath = result;
                        distance = result.length;
                    }
                }
                const keyPoints = this.keyPoints;
                if (keyPoints.length) {
                    const keyTimes = super.keyTimes;
                    const length = distance - 1;
                    const result: SvgOffsetPath[] = [];
                    if (keyPoints.length > 1) {
                        for (let i = 0; i < keyTimes.length - 1; i++) {
                            const baseTime = keyTimes[i] * duration;
                            const offsetTime = (keyTimes[i + 1] - keyTimes[i]) * duration;
                            const from = keyPoints[i];
                            const to = keyPoints[i + 1];
                            const segment: SvgOffsetPath[] = [];
                            let minPercent: number;
                            let maxPercent: number;
                            if (offsetTime === 0) {
                                minPercent = to * length;
                                maxPercent = length;
                            }
                            else {
                                minPercent = Math.min(from, to) * length;
                                maxPercent = Math.max(from, to) * length;
                            }
                            for (let j = 0; j <= length; j++) {
                                if (offsetTime === 0) {
                                    if (j >= minPercent) {
                                        segment.push({ ...offsetPath[j] });
                                        break;
                                    }
                                }
                                else {
                                    if (j >= minPercent && j <= maxPercent) {
                                        segment.push({ ...offsetPath[j] });
                                    }
                                }
                            }
                            if (offsetTime === 0) {
                                segment[0].key = baseTime;
                            }
                            else {
                                if (from > to) {
                                    segment.reverse();
                                }
                                const increment = offsetTime / segment.length;
                                for (let j = 0; j < segment.length - 1; j++) {
                                    segment[j].key = baseTime + j * increment;
                                }
                                segment[segment.length - 1].key = baseTime + offsetTime;
                            }
                            if (result.length && $util.isEqual(segment[0], result[result.length - 1])) {
                                segment.shift();
                            }
                            $util.concatArray(result, segment);
                        }
                    }
                    else {
                        const minPercent = keyPoints[0] * length;
                        for (let j = 0; j <= length; j++) {
                            if (j >= minPercent) {
                                result.push({ ...offsetPath[j] });
                                break;
                            }
                        }
                        if (keyTimes[0] === 0) {
                            result[0].rotate = 0;
                        }
                    }
                    this._offsetPath = result;
                }
                else {
                    this._offsetPath = offsetPath;
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

    set keyTimes(value) {
        if (this._offsetPath === undefined) {
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
        if (this._offsetPath === undefined) {
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
                if (iterationCount === -1) {
                    for (let i = 0; i < keyTimesBase.length; i++) {
                        keyTimesBase[i] /= 2;
                        keyTimes[i] = 0.5 + keyTimes[i] / 2;
                    }
                    $util.concatArray(keyTimesBase, keyTimes);
                    $util.concatArray(this.keyPoints, keyPoints);
                    this.duration = duration * 2;
                }
                else {
                    const keyTimesStatic = keyTimesBase.slice(0);
                    const keyPointsStatic = this.keyPoints.slice(0);
                    for (let i = 0; i < iterationCount; i++) {
                        if (i === 0) {
                            for (let j = 0; j < keyTimesBase.length; j++) {
                                keyTimesBase[j] /= iterationCount;
                            }
                        }
                        else {
                            const baseTime = i * 1 / iterationCount;
                            const keyTimesAppend = i % 2 === 0 ? keyTimesStatic.slice(0) : keyTimes.slice(0);
                            for (let j = 0; j < keyTimesAppend.length; j++) {
                                keyTimesAppend[j] = $math.truncateFraction(baseTime + keyTimesAppend[j] / iterationCount);
                            }
                            $util.concatArray(keyTimesBase, keyTimesAppend);
                            $util.concatArray(this.keyPoints, i % 2 === 0 ? keyPointsStatic : keyPoints);
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
        if (parentContainer && parentContainer.requireRefit && this.path !== '') {
            this.path = SvgBuild.transformRefit(this.path, undefined, undefined, parentContainer);
        }
    }
    get parent() {
        return super.parent;
    }

    get offsetLength() {
        if (this._offsetLength === 0 && this.path !== '') {
            this._offsetLength = getPathLength(this.path);
        }
        return this._offsetLength;
    }

    get instanceType() {
        return INSTANCE_TYPE.SVG_ANIMATE_MOTION;
    }
}