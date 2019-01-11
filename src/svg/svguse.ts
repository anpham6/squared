import { SvgTransformExclusions, SvgTransformResidual } from './@types/object';

import SvgPaint$MX from './svgpaint-mx';
import SvgViewRect$MX from './svgviewrect-mx';
import SvgPath from './svgpath';
import SvgShape from './svgshape';

import { SVG } from './lib/util';

export default class SvgUse extends SvgPaint$MX(SvgViewRect$MX(SvgShape)) implements squared.svg.SvgUse {
    constructor(
        public readonly element: SVGUseElement,
        public shapeElement: SVGGraphicsElement)
    {
        super(element);
        this.setPaint();
    }

    public setShape(value: SVGGraphicsElement) {
        this.shapeElement = value;
        this.setType(value);
        this.path = undefined;
    }

    public build(exclusions?: SvgTransformExclusions, residual?: SvgTransformResidual) {
        if (this.path === undefined) {
            const path = new SvgPath(this.shapeElement, this.element);
            super.path = path;
        }
        super.build(exclusions, residual);
    }

    set href(value) {
        if (value.charAt(0) === '#') {
            const id = value.substring(1);
            const target = document.getElementById(id);
            if (target && SVG.shape(target)) {
                this.setShape(target);
                this.element.href.baseVal = value;
            }
        }
    }
    get href() {
        return this.element.href.baseVal;
    }
}