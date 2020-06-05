import SvgBaseVal$MX from './svgbaseval-mx';
import SvgViewRect$MX from './svgviewrect-mx';
import SvgG from './svgg';

import { INSTANCE_TYPE } from './lib/constant';

export default class SvgUseG extends SvgViewRect$MX(SvgBaseVal$MX(SvgG)) implements squared.svg.SvgUseG {
    protected _retainStyle = false;

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
        super.build(options);
    }

    get instanceType() {
        return INSTANCE_TYPE.SVG_USE_G;
    }
}