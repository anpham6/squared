import SvgPaint$MX from './svgpaint-mx';
import SvgPath from './svgpath';
import SvgShape from './svgshape';

export default class SvgUse extends SvgPaint$MX(SvgShape) implements squared.svg.SvgUse {
    constructor(
        public readonly element: SVGUseElement,
        public shapeElement?: SVGGraphicsElement)
    {
        super(element);
        this.setPaint();
    }

    public setShape(value: SVGGraphicsElement) {
        this.shapeElement = value;
    }

    public build(exclusions?: number[]) {
        if (this.shapeElement) {
            if (this.path === undefined) {
                const path = new SvgPath(this.shapeElement, this.element);
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