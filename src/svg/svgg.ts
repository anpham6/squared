import { SvgTransformExclude, SvgTransformResidual } from './@types/object';

import SvgPaint$MX from './svgpaint-mx';
import SvgView$MX from './svgview-mx';
import SvgContainer from './svgcontainer';

import { INSTANCE_TYPE } from './lib/constant';

export default class SvgG extends SvgPaint$MX(SvgView$MX(SvgContainer)) implements squared.svg.SvgG {
    constructor(public readonly element: SVGGElement) {
        super(element);
    }

    public build(exclude?: SvgTransformExclude, residual?: SvgTransformResidual) {
        super.build(exclude, residual);
        this.setPaint(this.getPathAll());
    }

    get instanceType() {
        return INSTANCE_TYPE.SVG_G;
    }
}