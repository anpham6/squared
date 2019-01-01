import SvgPath from './svgpath';
import SvgShape from './svgshape';

export default class SvgUse extends SvgShape implements squared.svg.SvgUse {
    public x: number;
    public y: number;
    public width: number;
    public height: number;

    constructor(public readonly element: SVGUseElement) {
        super(element);
        this.x = element.x.baseVal.value;
        this.y = element.y.baseVal.value;
        this.width = element.width.baseVal.value;
        this.height = element.height.baseVal.value;
    }

    public setPath(value: SvgPath | string) {
        if (value instanceof SvgPath) {
            value = new SvgPath(this.element, value.d);
        }
        super.setPath(value);
    }
}