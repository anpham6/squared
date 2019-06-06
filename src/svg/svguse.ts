import { SvgBuildOptions, SvgSynchronizeOptions } from './@types/object';

import SvgAnimation from './svganimation';
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
        public shapeElement: SVGGeometryElement,
        initialize = true)
    {
        super(element, false);
        if (initialize) {
            this.setPath();
        }
    }

    public setPath() {
        this.path = new SvgPath(this.shapeElement);
        this.path.useParent = this;
    }

    public build(options?: SvgBuildOptions) {
        super.build(options);
        this.setPaint(this.path ? [this.path.value] : undefined, options && options.precision);
    }

    public synchronize(options?: SvgSynchronizeOptions) {
        options = { ...options };
        options.element = this.shapeElement;
        if (this.animations.length) {
            this.animateSequentially(this.getAnimateViewRect(), this.getAnimateTransform(options), undefined, options);
        }
        super.synchronize(options);
    }

    get transforms() {
        let transforms = super.transforms;
        if (!this.__get_transforms) {
            transforms = transforms.concat(this.getTransforms(this.shapeElement));
            this._transforms = transforms;
            this.__get_transforms = true;
        }
        return transforms;
    }

    get animations() {
        let animations = <SvgAnimation[]> super.animations;
        if (!this.__get_animations) {
            animations = animations.concat(<SvgAnimation[]> this.getAnimations(this.shapeElement));
            this._animations = animations;
            this.__get_animations = true;
        }
        return animations;
    }

    get instanceType() {
        return INSTANCE_TYPE.SVG_USE;
    }
}