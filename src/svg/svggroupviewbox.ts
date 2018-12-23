import SvgGroup from './svggroup';

export default class SvgGroupViewBox extends SvgGroup implements squared.svg.SvgGroupViewBox {
    public x: number;
    public y: number;
    public width: number;
    public height: number;

    constructor(public readonly element: SVGSVGElement | SVGUseElement) {
        super(element);
        this.x = element.x.baseVal.value;
        this.y = element.y.baseVal.value;
        this.width = element.width.baseVal.value;
        this.height = element.height.baseVal.value;
    }

    get animatable() {
        return true;
    }

    get transformable() {
        return this.transform.numberOfItems > 0;
    }
}