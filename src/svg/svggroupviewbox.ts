import SvgGroup from './svggroup';
import SvgShape from './svgshape';

export default class SvgGroupViewBox extends SvgGroup implements squared.svg.SvgGroupViewBox {
    public x: number;
    public y: number;
    public width: number;
    public height: number;

    constructor(public readonly element: SVGSVGElement) {
        super(element);
        this.x = element.x.baseVal.value;
        this.y = element.y.baseVal.value;
        this.width = element.width.baseVal.value;
        this.height = element.height.baseVal.value;
    }

    public synchronize(useKeyTime = true) {
        if (this.animate.length) {
            SvgShape.synchronizeAnimate(this.element, this.animate, useKeyTime);
        }
    }
}