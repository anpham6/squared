import { SvgTransformExclusions, SvgTransformResidual } from './@types/object';

import SvgBaseVal$MX from './svgbaseval-mx';
import SvgPaint$MX from './svgpaint-mx';
import SvgSynchronize$MX from './svgsynchronize-mx';
import SvgView$MX from './svgview-mx';
import SvgViewRect$MX from './svgviewrect-mx';
import SvgContainer from './svgcontainer';

import { INSTANCE_TYPE } from './lib/constant';

export default class SvgUseSymbol extends SvgPaint$MX(SvgSynchronize$MX(SvgViewRect$MX(SvgBaseVal$MX(SvgView$MX(SvgContainer))))) implements squared.svg.SvgUseSymbol {
    constructor(
        public element: SVGUseElement,
        public readonly symbolElement: SVGSymbolElement)
    {
        super(element);
    }

    public build(exclusions?: SvgTransformExclusions, residual?: SvgTransformResidual) {
        this.setRect();
        super.build(exclusions, residual, this.symbolElement);
        const x = this.getBaseValue('x', 0);
        const y = this.getBaseValue('y', 0);
        if (x !== 0 || y !== 0) {
            const pt = { x, y };
            this.cascade().forEach(item => item.translationOffset = pt);
        }
        this.setPaint(this.getPathAll());
    }

    public synchronize(useKeyTime = false) {
        if (this.animation.length) {
            this.mergeAnimate(this.getAnimateViewRect(this.animation), useKeyTime);
        }
        super.synchronize(useKeyTime);
    }

    get viewBox() {
        return this.symbolElement.viewBox.baseVal;
    }

    get instanceType() {
        return INSTANCE_TYPE.SVG_USE_SYMBOL;
    }
}