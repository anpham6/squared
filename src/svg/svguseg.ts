import SvgBaseVal$MX from './svgbaseval-mx';
import SvgViewRect$MX from './svgviewrect-mx';
import SvgG from './svgg';
import SvgBuild from './svgbuild';

import { INSTANCE_TYPE } from './lib/constant';

export default class SvgUseG extends SvgViewRect$MX(SvgBaseVal$MX(SvgG)) implements squared.svg.SvgUseG {
    protected _retainStyle = false;

    constructor(
        public readonly element: SVGUseElement,
        public groupElement: SVGGElement)
    {
        super(element);
    }

    public build(options?: SvgBuildOptions) {
        this.setRect();
        super.build({ ...options, targetElement: this.groupElement });
        const x: number = this.getBaseValue('x', 0);
        const y: number = this.getBaseValue('y', 0);
        if (x !== 0 || y !== 0) {
            const pt = { x, y };
            this.cascade(item => {
                if (SvgBuild.asImage(item)) {
                    item.translationOffset = pt;
                }
                return false;
            });
        }
        this.setPaint(this.getPathAll(), options?.precision);
    }

    get instanceType() {
        return INSTANCE_TYPE.SVG_USE_G;
    }
}