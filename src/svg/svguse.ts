import SvgPaint$MX from './svgpaint-mx';
import SvgPath from './svgpath';
import SvgShape from './svgshape';

export default class SvgUse extends SvgPaint$MX(SvgShape) implements squared.svg.SvgUse {
    private _shape?: SVGGraphicsElement;

    constructor(public readonly element: SVGUseElement) {
        super(element);
        this.setPaint();
    }

    public setShape(value: SVGGraphicsElement) {
        this._shape = value;
    }

    public build(exclusions?: number[]) {
        if (this._shape) {
            if (this.path === undefined) {
                const path = new SvgPath(this._shape, this.element);
                super.path = path;
            }
            super.build(exclusions);
        }
    }

    set x(value) {
        this.element.x.baseVal.value = value;
    }
    get x() {
        return this.element.x.baseVal.value;
    }

    set y(value) {
        this.element.y.baseVal.value = value;
    }
    get y() {
        return this.element.y.baseVal.value;
    }

    set href(value) {
        if (value.charAt(0) === '#') {
            this.element.href.baseVal = value;
        }
    }
    get href() {
        return this.element.href.baseVal;
    }
}