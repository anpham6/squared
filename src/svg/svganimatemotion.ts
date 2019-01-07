import SvgAnimate from './svganimate';

import { getHrefTargetElement } from './lib/util';

const $util = squared.lib.util;

export default class SvgAnimateMotion extends SvgAnimate implements squared.svg.SvgAnimateMotion {
    public path = '';
    public mpath?: SVGGraphicsElement;
    public keyPoints: number[] = [];
    public rotate = 0;
    public rotateAuto = false;
    public rotateAutoReverse = false;

    constructor(element: SVGAnimateMotionElement) {
        super(element);
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
            if (keyPoints) {
                const points = SvgAnimate.toFractionList(keyPoints);
                if (points.length === this.keyTimes.length) {
                    this.keyPoints = points;
                }
            }
        }
        for (let i = 0; i < element.children.length; i++) {
            const item = element.children[i];
            if (item.tagName === 'mpath') {
                const target = getHrefTargetElement(item);
                if (target) {
                    this.mpath = target;
                    break;
                }
            }
        }
    }
}