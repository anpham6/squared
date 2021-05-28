import SvgBaseVal$MX from './svgbaseval-mx';
import SvgViewRect$MX from './svgviewrect-mx';
import SvgG from './svgg';

export default class SvgUseG extends SvgViewRect$MX(SvgBaseVal$MX(SvgG)) implements squared.svg.SvgUseG {
    public readonly instanceType = squared.svg.constant.INSTANCE_TYPE.SVG_USE_G;

    constructor(
        public readonly element: SVGGElement,
        public useElement: SVGUseElement)
    {
        super(element);
        this.useParent = this;
        this.rectElement = useElement;
    }

    public build(options?: SvgBuildOptions) {
        this.setRect();
        super.build(...(arguments as unknown) as [SvgBuildOptions?]);
    }
}