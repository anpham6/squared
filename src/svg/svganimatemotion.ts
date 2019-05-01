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
        }
    }

    private setOffsetPath() {
        if (this._offsetPath === undefined && this.path) {
            this._offsetPath = SvgBuild.translateOffsetPath(this.path, this.duration, undefined, undefined, this.rotate);
        }
    }

    set keyTimes(value) {
        super.keyTimes = value;
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

    set values(value) {
        super.values = value;
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

    get keyPoints() {
        if (this.animationElement && $dom.getNamedItem(this.animationElement, 'calcMode') === 'linear') {
            const keyPoints = SvgAnimate.toFractionList($dom.getNamedItem(this.animationElement, 'keyPoints'));
            if (keyPoints.length !== super.keyTimes.length) {
                this._keyPoints = keyPoints;
            }
        }
        return this._keyPoints;
    }

    get instanceType() {
        return INSTANCE_TYPE.SVG_ANIMATE_MOTION;
    }
}