import { SvgBuildOptions } from '../../@types/svg/object';

import SvgPaint$MX from './svgpaint-mx';
import SvgView$MX from './svgview-mx';
import SvgContainer from './svgcontainer';

import { INSTANCE_TYPE } from './lib/constant';

export default class SvgG extends SvgPaint$MX(SvgView$MX(SvgContainer)) implements squared.svg.SvgG {
    constructor(public readonly element: SVGGElement) {
        super(element);
    }

    public build(options?: SvgBuildOptions) {
        super.build(options);
        this.setPaint(this.getPathAll(), options?.precision);
    }

    get instanceType() {
        return INSTANCE_TYPE.SVG_G;
    }
}