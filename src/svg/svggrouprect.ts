import SvgViewRect$MX from './svgviewrect-mx';
import SvgGroup from './svggroup';
import SvgShape from './svgshape';

export default class SvgGroupRect extends SvgViewRect$MX(SvgGroup) implements squared.svg.SvgGroupRect {
    constructor(public readonly element: SVGSVGElement) {
        super(element);
        this.setRect();
    }

    public synchronize(useKeyTime = true) {
        if (this.animate.length) {
            SvgShape.synchronizeAnimate(this.element, this.animate, useKeyTime);
        }
    }

    get viewBox() {
        return this.element.viewBox.baseVal;
    }
}