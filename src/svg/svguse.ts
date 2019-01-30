import { SvgTransformExclusions, SvgTransformResidual } from './@types/object';

import SvgBaseVal$MX from './svgbaseval-mx';
import SvgPaint$MX from './svgpaint-mx';
import SvgViewRect$MX from './svgviewrect-mx';
import SvgPath from './svgpath';
import SvgShape from './svgshape';

import { INSTANCE_TYPE } from './lib/constant';

export default class SvgUse extends SvgPaint$MX(SvgViewRect$MX(SvgBaseVal$MX(SvgShape))) implements squared.svg.SvgUse {
    private __get_transform = false;
    private __get_animation = false;

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

    public synchronize(useKeyTime = 0) {
        if (this.animation.length) {
            this.mergeAnimations(this.getAnimateViewRect(), this.getAnimateTransform(), useKeyTime);
        }
        super.synchronize(useKeyTime, this.shapeElement);
    }

    get transform() {
        const transform = super.transform;
        if (!this.__get_transform) {
            transform.push(...this.getTransforms(this.shapeElement));
            this.__get_transform = true;
        }
        return transform;
    }

    get animation() {
        const animation = super.animation;
        if (!this.__get_animation) {
            animation.push(...this.getAnimations(this.shapeElement));
            this.__get_animation = true;
        }
        return animation;
    }

    get instanceType() {
        return INSTANCE_TYPE.SVG_USE;
    }
}