import { SvgTransformExclusions, SvgTransformResidual } from './@types/object';

import SvgBaseVal$MX from './svgbaseval-mx';
import SvgPaint$MX from './svgpaint-mx';
import SvgViewRect$MX from './svgviewrect-mx';
import SvgPath from './svgpath';
import SvgShape from './svgshape';

import { SVG } from './lib/util';

export default class SvgUse extends SvgPaint$MX(SvgViewRect$MX(SvgBaseVal$MX(SvgShape))) implements squared.svg.SvgUse {
    constructor(
        public readonly element: SVGUseElement,
        public shapeElement: SVGGraphicsElement)
    {
        super(element);
        this.setPaint();
        this.setShape(shapeElement);
    }

    public setShape(value: SVGGraphicsElement) {
        this.shapeElement = value;
        this.setType(value);
        this.path = undefined;
    }

    public build(exclusions?: SvgTransformExclusions, residual?: SvgTransformResidual) {
        if (this.path === undefined) {
            this.path = new SvgPath(this.shapeElement, this.element);
        }
        super.build(exclusions, residual);
    }

    public synchronize(useKeyTime = false) {
        if (this.animation.length) {
            this.mergeAnimate(this.getAnimateViewRect(), useKeyTime);
        }
        super.synchronize(useKeyTime);
    }

    set href(value) {
        if (value.charAt(0) === '#') {
            const target = document.getElementById(value.substring(1));
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