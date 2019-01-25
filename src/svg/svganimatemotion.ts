import SvgAnimate from './svganimate';

import { SVG, getTargetElement } from './lib/util';

const $util = squared.lib.util;

export default class SvgAnimateMotion extends SvgAnimate implements squared.svg.SvgAnimateMotion {
    public path = '';
    public mpath: SVGGraphicsElement | null = null;
    public rotate = 0;
    public rotateAuto = false;
    public rotateAutoReverse = false;
    public keyPoints?: number[];

    constructor(public element?: SVGAnimateMotionElement) {
        super(element);
        if (element) {
            this.setAttribute('path');
            const rotate = this.getAttribute('rotate');
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
                const keyPoints = this.getAttribute('keyPoints');
                if (keyPoints !== '') {
                    const points = SvgAnimate.toFractionList(keyPoints);
                    if (points.length === this.keyTimes.length) {
                        this.keyPoints = points;
                    }
                }
            }
            for (let i = 0; i < element.children.length; i++) {
                const item = element.children[i];
                if (item.tagName === 'mpath') {
                    const target = getTargetElement(item);
                    if (target && (SVG.shape(target) || SVG.use(target))) {
                        this.mpath = target;
                        break;
                    }
                }
            }
        }
    }

    get instanceType() {
        return 3;
    }
}