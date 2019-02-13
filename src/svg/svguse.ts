import { SvgTransformExclude, SvgTransformResidual } from './@types/object';

import SvgBaseVal$MX from './svgbaseval-mx';
import SvgPaint$MX from './svgpaint-mx';
import SvgViewRect$MX from './svgviewrect-mx';
import SvgPath from './svgpath';
import SvgShape from './svgshape';

import { INSTANCE_TYPE } from './lib/constant';

export default class SvgUse extends SvgPaint$MX(SvgViewRect$MX(SvgBaseVal$MX(SvgShape))) implements squared.svg.SvgUse {
    private __get_transforms = false;
    private __get_animations = false;

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

    public build(exclude?: SvgTransformExclude, residual?: SvgTransformResidual) {
        super.build(exclude, residual);
        this.setPaint(this.path ? [this.path.value] : undefined);
    }

    public synchronize(keyTimeMode = 0) {
        if (this.animations.length) {
            this.mergeAnimations(this.getAnimateViewRect(), this.getAnimateTransform(), keyTimeMode);
        }
        super.synchronize(keyTimeMode, this.shapeElement);
    }

    get transforms() {
        const transforms = super.transforms;
        if (!this.__get_transforms) {
            transforms.push(...this.getTransforms(this.shapeElement));
            this.__get_transforms = true;
        }
        return transforms;
    }

    get animations() {
        const animations = super.animations;
        if (!this.__get_animations) {
            animations.push(...this.getAnimations(this.shapeElement));
            this.__get_animations = true;
        }
        return animations;
    }

    get instanceType() {
        return INSTANCE_TYPE.SVG_USE;
    }
}