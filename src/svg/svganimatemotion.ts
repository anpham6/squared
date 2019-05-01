import { SvgOffsetPath } from './@types/object';

import SvgAnimate from './svganimate';
import SvgBuild from './svgbuild';

import { INSTANCE_TYPE } from './lib/constant';
import { SVG, getTargetElement } from './lib/util';

const $dom = squared.lib.dom;
const $util = squared.lib.util;

export default class SvgAnimateMotion extends SvgAnimate implements squared.svg.SvgAnimateMotion {
    public path = '';
    public motionPathElement: SVGGeometryElement | null = null;
    public rotate = 0;
    public rotateAuto = false;
    public rotateAutoReverse = false;
    public keyPoints?: number[];
    public readonly attributeName = 'transform';
    public readonly type = SVGTransform.SVG_TRANSFORM_TRANSLATE;

    private _offsetPath?: SvgOffsetPath[];

    constructor(element?: SVGGraphicsElement, animationElement?: SVGAnimateMotionElement) {
        super(element, animationElement);
        if (animationElement) {
            this.setAttribute('path');
            const rotate = $dom.getNamedItem(animationElement, 'rotate');
            switch (rotate) {
                case 'auto':
                    this.rotateAuto = true;
                    break;
                case 'auto-reverse':
                    this.rotateAutoReverse = true;
                    break;
                default:
                    this.rotate = $util.convertInt(rotate);
                    break;
            }
            if (this.keyTimes.length) {
                const keyPoints = $dom.getNamedItem(animationElement, 'keyPoints');
                if (keyPoints !== '') {
                    const points = SvgAnimate.toFractionList(keyPoints);
                    if (points.length === this.keyTimes.length) {
                        this.keyPoints = points;
                    }
                }
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
        }
    }

    private setOffsetPath() {
        if (this._offsetPath === undefined) {
            const path = this.motionPathElement || this.path;
            if (path && this.duration > 0) {
                this._offsetPath = SvgBuild.translateOffsetPath(path, this.duration);
            }
        }
    }

    get keyTimes() {
        if (super.keyTimes.length === 0) {
            this.setOffsetPath();
            if (this._offsetPath) {
                const duration = this.duration;
                return $util.objectMap<SvgOffsetPath, number>(this._offsetPath, item => item.key / duration);
            }
        }
        return super.keyTimes;
    }

    get values() {
        if (super.values.length === 0) {
            this.setOffsetPath();
            if (this._offsetPath) {
                return $util.objectMap<SvgOffsetPath, string>(this._offsetPath, item => `${item.value.x} ${item.value.y}`);
            }
        }
        return super.values;
    }

    get rotationValues() {
        this.setOffsetPath();
        if (this._offsetPath) {
            return $util.objectMap<SvgOffsetPath, number>(this._offsetPath, item => item.rotate);
        }
        return undefined;
    }

    get instanceType() {
        return INSTANCE_TYPE.SVG_ANIMATE_MOTION;
    }
}