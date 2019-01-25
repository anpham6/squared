import { SvgTransformExclusions, SvgTransformResidual } from './@types/object';

import SvgPaint$MX from './svgpaint-mx';
import SvgView$MX from './svgview-mx';
import SvgContainer from './svgcontainer';

import { INSTANCE_TYPE } from './lib/constant';

export default class SvgG extends SvgPaint$MX(SvgView$MX(SvgContainer)) implements squared.svg.SvgG {
    constructor(public readonly element: SVGGElement) {
        super(element);
    }

    public build(exclusions?: SvgTransformExclusions, residual?: SvgTransformResidual) {
        super.build(exclusions, residual);
        this.setPaint(this.getPathAll());
    }

    get instanceType() {
        return INSTANCE_TYPE.SVG_G;
    }
}