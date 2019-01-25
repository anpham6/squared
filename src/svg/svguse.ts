import { SvgTransformExclusions, SvgTransformResidual } from './@types/object';

import SvgBaseVal$MX from './svgbaseval-mx';
import SvgPaint$MX from './svgpaint-mx';
import SvgViewRect$MX from './svgviewrect-mx';
import SvgPath from './svgpath';
import SvgShape from './svgshape';

import { INSTANCE_TYPE } from './lib/constant';

export default class SvgUse extends SvgPaint$MX(SvgViewRect$MX(SvgBaseVal$MX(SvgShape))) implements squared.svg.SvgUse {
    constructor(
        public readonly element: SVGUseElement,
        public shapeElement: SVGGraphicsElement)
    {
        super(element, false);
        this.setPath();
    }

    public setPath() {
        this.path = new SvgPath(this.shapeElement);
        this.path.useParent = this;
    }

    public build(exclusions?: SvgTransformExclusions, residual?: SvgTransformResidual) {
        super.build(exclusions, residual);
        this.setPaint(this.path ? [this.path.value] : undefined);
    }

    public synchronize(useKeyTime = false) {
        if (this.animation.length) {
            this.mergeAnimate(this.getAnimateViewRect(), useKeyTime);
        }
        super.synchronize(useKeyTime);
    }

    get instanceType() {
        return INSTANCE_TYPE.SVG_USE;
    }
}