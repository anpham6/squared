import SvgBaseVal$MX from './svgbaseval-mx';
import SvgPaint$MX from './svgpaint-mx';
import SvgViewRect$MX from './svgviewrect-mx';
import SvgPath from './svgpath';
import SvgShape from './svgshape';

import { INSTANCE_TYPE } from './lib/constant';

export default class SvgUseShape extends SvgPaint$MX(SvgViewRect$MX(SvgBaseVal$MX(SvgShape))) implements squared.svg.SvgUseShape {
    public readonly instanceType = INSTANCE_TYPE.SVG_USE_SHAPE;

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
        this.setPaint(this.path && [this.path.value], options && options.precision);
    }

    public synchronize(options?: SvgSynchronizeOptions) {
        options = { ...options, element: this.element };
        if (this.animations.length > 0) {
            this.animateSequentially(this.getAnimateViewRect(), this.getAnimateTransform(options), undefined, options);
        }
        super.synchronize(options);
    }

    public getTransforms() {
        return super.getTransforms(this.useElement).concat(super.getTransforms());
    }

    public getAnimations() {
        return super.getAnimations(this.useElement).concat(super.getAnimations());
    }
}