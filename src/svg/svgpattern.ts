import { SvgTransformExclusions, SvgTransformResidual } from './@types/object';

import SvgView$MX from './svgview-mx';
import SvgContainer from './svgcontainer';

import { INSTANCE_TYPE } from './lib/constant';

type SvgAnimation = squared.svg.SvgAnimation;

export default class SvgPattern extends SvgView$MX(SvgContainer) implements squared.svg.SvgPattern {
    constructor(
        public element: SVGGraphicsElement,
        public readonly patternElement: SVGPatternElement)
    {
        super(element);
    }

    public build(exclusions?: SvgTransformExclusions, residual?: SvgTransformResidual) {
        super.build(exclusions, residual, this.patternElement);
    }

    get animation(): SvgAnimation[] {
        return [];
    }

    get instanceType() {
        return INSTANCE_TYPE.SVG_PATTERN;
    }
}