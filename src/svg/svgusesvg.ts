import SvgPaint$MX from './svgpaint-mx';
import Svg from './svg';

import { INSTANCE_TYPE } from './lib/constant';

export default class SvgUseSvg extends SvgPaint$MX(Svg) implements squared.svg.SvgUseSvg {
    protected _retainStyle = false;

    constructor(
        public readonly element: SVGSVGElement,
        public useElement: SVGUseElement)
    {
        super(element);
        this.useParent = this;
        this.rectElement = useElement;
    }

    public build(options?: SvgBuildOptions) {
        super.build(options);
        this.setPaint(this.getPathAll(), options?.precision);
    }

    get instanceType() {
        return INSTANCE_TYPE.SVG_USE_SVG;
    }
}