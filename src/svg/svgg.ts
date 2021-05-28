import SvgPaint$MX from './svgpaint-mx';
import SvgView$MX from './svgview-mx';
import SvgContainer from './svgcontainer';

export default class SvgG extends SvgPaint$MX(SvgView$MX(SvgContainer)) implements squared.svg.SvgG {
    public readonly instanceType = squared.svg.constant.INSTANCE_TYPE.SVG_G;

    constructor(public readonly element: SVGGElement) {
        super(element);
    }

    public build(options?: SvgBuildOptions) {
        super.build(...(arguments as unknown) as [SvgBuildOptions?]);
        this.setPaint(this.getPathAll(), options && options.precision);
    }
}