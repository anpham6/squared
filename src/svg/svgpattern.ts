import { SvgTransformExclusions, SvgTransformResidual } from './@types/object';

import SvgBaseVal$MX from './svgbaseval-mx';
import SvgView$MX from './svgview-mx';
import SvgContainer from './svgcontainer';

type SvgAnimation = squared.svg.SvgAnimation;

export default class SvgPattern extends SvgBaseVal$MX(SvgView$MX(SvgContainer)) implements squared.svg.SvgPatternTile {
    constructor(
        public element: SVGGraphicsElement,
        public readonly patternElement: SVGPatternElement)
    {
        super(element);
    }

    public build(exclusions?: SvgTransformExclusions, residual?: SvgTransformResidual) {
        const shapeElement = this.element;
        this.element = this.patternElement as any;
        super.build(exclusions, residual);
        this.element = shapeElement;
    }

    get animation(): SvgAnimation[] {
        return [];
    }
}