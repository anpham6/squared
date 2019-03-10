import SvgAnimate from './svganimate';

import { INSTANCE_TYPE } from './lib/constant';
import { SVG, getTargetElement } from './lib/util';

const $css = squared.lib.css;
const $util = squared.lib.util;

export default class SvgAnimateMotion extends SvgAnimate implements squared.svg.SvgAnimateMotion {
    public path = '';
    public motionPathElement: SVGGraphicsElement | null = null;
    public rotate = 0;
    public rotateAuto = false;
    public rotateAutoReverse = false;
    public keyPoints?: number[];

    constructor(element?: SVGGraphicsElement, animationElement?: SVGAnimateMotionElement) {
        super(element, animationElement);
        if (animationElement) {
            this.setAttribute('path');
            const rotate = $css.getNamedItem(animationElement, 'rotate');
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
                const keyPoints = $css.getNamedItem(animationElement, 'keyPoints');
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
                    const target = getTargetElement(<SVGElement> item);
                    if (target && (SVG.shape(target) || SVG.use(target))) {
                        this.motionPathElement = target;
                        break;
                    }
                }
            }
        }
    }

    get instanceType() {
        return INSTANCE_TYPE.SVG_ANIMATE_MOTION;
    }
}