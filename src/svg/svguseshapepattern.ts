import SvgSynchronize$MX from './svgsynchronize-mx';
import SvgViewRect$MX from './svgviewrect-mx';
import SvgAnimation from './svganimation';
import SvgShapePattern from './svgshapepattern';

import { INSTANCE_TYPE } from './lib/constant';

export default class SvgUseShapePattern extends SvgSynchronize$MX(SvgViewRect$MX(SvgShapePattern)) implements squared.svg.SvgUseShapePattern {
    constructor(
        public readonly element: SVGGeometryElement,
        public readonly useElement: SVGUseElement,
        patternElement: SVGPatternElement)
    {
        super(element, patternElement);
        this.useParent = this;
        this.rectElement = useElement;
    }

    public synchronize(options?: SvgSynchronizeOptions) {
        const animations = this.animations.filter(item => item.attributeName === 'x' || item.attributeName === 'y' || this.verifyBaseValue(item.attributeName, 0) === undefined) as SvgAnimation[];
        const transforms = this.getAnimateTransform(options);
        if (animations.length || transforms.length) {
            this.animateSequentially(this.getAnimateViewRect(animations), transforms, undefined, options);
        }
        super.synchronize(options);
    }

    get instanceType() {
        return INSTANCE_TYPE.SVG_USE_SHAPE_PATTERN;
    }
}