import { SvgOffsetPath } from './@types/object';

import SvgAnimate from './svganimate';
import SvgBuild from './svgbuild';

import { INSTANCE_TYPE, KEYSPLINE_NAME } from './lib/constant';
import { SVG, getTargetElement } from './lib/util';

const $dom = squared.lib.dom;
const $util = squared.lib.util;

export default class SvgAnimateMotion extends SvgAnimate implements squared.svg.SvgAnimateMotion {
    public path = '';
    public motionPathElement: SVGGeometryElement | null = null;
    public rotate = 'auto';
    public readonly attributeName = 'transform';
    public readonly type = SVGTransform.SVG_TRANSFORM_TRANSLATE;

    private _offsetPath?: SvgOffsetPath[];
    private _keyPoints?: number[];

    constructor(element?: SVGGraphicsElement, animationElement?: SVGAnimateMotionElement) {
        super(element, animationElement);
        if (animationElement) {
            this.setAttribute('path');
            this.setAttribute('rotate');
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
                    const keyPoints = SvgAnimate.toFractionList($dom.getNamedItem(this.animationElement, 'keyPoints'), ';', false);
                    let keyTimes = super.keyTimes;
                    if (keyTimes.length === 0 && this.duration !== -1) {
                        keyTimes = SvgAnimate.toFractionList($dom.getNamedItem(this.animationElement, 'keyTimes'));
                        super.values = undefined as any;
                        super.keyTimes = keyTimes;
                    }
                    if (keyPoints.length === keyTimes.length) {
                        this._keyPoints = keyPoints;
                    }
                    break;
            }
        }
    }

    private setOffsetPath() {
        if (this.path && this._offsetPath === undefined) {
            let offsetPath = SvgBuild.getOffsetPath(this.path, this.rotate);
            let distance = offsetPath.length;
            if (distance > 0) {
                const duration = this.duration;
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
                const keyPoints = this.keyPoints;
                if (keyPoints) {
                    const keyTimes = super.keyTimes;
                    const length = distance - 1;
                    const result: SvgOffsetPath[] = [];
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

    set keyPoints(value) {
        if (this.animationElement === null) {
            this._keyPoints = value;
        }
    }
    get keyPoints() {
        return this._keyPoints;
    }

    get instanceType() {
        return INSTANCE_TYPE.SVG_ANIMATE_MOTION;
    }
}