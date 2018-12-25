import SvgAnimate from './svganimate';

import $util = squared.lib.util;

export default class SvgAnimateMotion extends SvgAnimate implements squared.svg.SvgAnimateMotion {
    public path = '';
    public keyPoints: number[] = [];
    public rotate = 0;
    public rotateAuto = false;
    public rotateAutoReverse = false;

    constructor(element: SVGAnimateMotionElement, parentElement: SVGGraphicsElement) {
        super(element, parentElement);
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
    }
}