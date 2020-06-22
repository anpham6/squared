import SvgBaseVal$MX from './svgbaseval-mx';
import SvgPaint$MX from './svgpaint-mx';
import SvgViewRect$MX from './svgviewrect-mx';
import SvgAnimation from './svganimation';
import SvgPath from './svgpath';
import SvgShape from './svgshape';

import { INSTANCE_TYPE } from './lib/constant';

export default class SvgUseShape extends SvgPaint$MX(SvgViewRect$MX(SvgBaseVal$MX(SvgShape))) implements squared.svg.SvgUseShape {
    constructor(
        public readonly element: SVGGeometryElement,
        public readonly useElement: SVGUseElement,
        initialize = true)
    {
        super(element, false);
        this.useParent = this;
        this.rectElement = useElement;
        if (initialize) {
            this.setPath();
        }
    }

    public setPath() {
        const path = new SvgPath(this.element);
        path.useParent = this;
        this.path = path;
    }

    public build(options?: SvgBuildOptions) {
        super.build(options);
        this.setPaint(this.path && [this.path.value], options?.precision);
    }

    public synchronize(options?: SvgSynchronizeOptions) {
        options = { ...options, element: this.element };
        if (this.animations.length > 0) {
            this.animateSequentially(this.getAnimateViewRect(), this.getAnimateTransform(options), undefined, options);
        }
        super.synchronize(options);
    }

    get transforms() {
        return this._transforms ?? (() => {
            this._transforms = this.getTransforms(this.useElement).concat(super.transforms);
            return this._transforms;
        })();
    }

    get animations() {
        return this._animations ?? (() => {
            this._animations = (this.getAnimations(this.useElement) as SvgAnimation[]).concat(super.animations);
            return this._animations;
        })();
    }

    get instanceType() {
        return INSTANCE_TYPE.SVG_USE_SHAPE;
    }
}