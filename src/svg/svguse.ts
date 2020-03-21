import type { SvgBuildOptions, SvgSynchronizeOptions } from '../../@types/svg/object';

import SvgBaseVal$MX from './svgbaseval-mx';
import SvgPaint$MX from './svgpaint-mx';
import SvgViewRect$MX from './svgviewrect-mx';
import SvgAnimation from './svganimation';
import SvgPath from './svgpath';
import SvgShape from './svgshape';

import { INSTANCE_TYPE } from './lib/constant';

export default class SvgUse extends SvgPaint$MX(SvgViewRect$MX(SvgBaseVal$MX(SvgShape))) implements squared.svg.SvgUse {
    protected _retainStyle = false;

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
        const path = new SvgPath(this.shapeElement);
        path.useParent = this;
        this.path = path;
    }

    public build(options?: SvgBuildOptions) {
        super.build(options);
        const path = this.path;
        this.setPaint(path ? [path.value] : undefined, options?.precision);
    }

    public synchronize(options?: SvgSynchronizeOptions) {
        options = { ...options, element: this.shapeElement };
        if (this.animations.length) {
            this.animateSequentially(this.getAnimateViewRect(), this.getAnimateTransform(options), undefined, options);
        }
        super.synchronize(options);
    }

    get transforms() {
        let result = super.transforms;
        if (!this.__get_transforms) {
            result = result.concat(this.getTransforms(this.shapeElement));
            this._transforms = result;
            this.__get_transforms = true;
        }
        return result;
    }

    get animations() {
        let result = <SvgAnimation[]> super.animations;
        if (!this.__get_animations) {
            result = result.concat(<SvgAnimation[]> this.getAnimations(this.shapeElement));
            this._animations = result;
            this.__get_animations = true;
        }
        return result;
    }

    get instanceType() {
        return INSTANCE_TYPE.SVG_USE;
    }
}