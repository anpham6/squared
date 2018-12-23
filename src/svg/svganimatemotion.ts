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
        const path = element.attributes.getNamedItem('path');
        if (path) {
            this.path = path.value.trim();
        }
        const rotate = element.attributes.getNamedItem('rotate');
        if (rotate) {
            switch (rotate.value) {
                case 'auto':
                    this.rotateAuto = true;
                    break;
                case 'auto-reverse':
                    this.rotateAutoReverse = true;
                    break;
                default:
                    this.rotate = $util.convertInt(rotate.value);
                    break;
            }
        }
        if (this.keyTimes.length) {
            const keyPoints = element.attributes.getNamedItem('keyPoints');
            if (keyPoints) {
                const points = SvgAnimate.toFractionList(keyPoints.value);
                if (points.length === this.keyTimes.length) {
                    this.keyPoints = points;
                }
            }
        }
    }
}