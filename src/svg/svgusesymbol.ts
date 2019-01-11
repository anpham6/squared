import { SvgTransformExclusions, SvgTransformResidual } from './@types/object';

import SvgBaseVal$MX from './svgbaseval-mx';
import SvgPaint$MX from './svgpaint-mx';
import SvgView$MX from './svgview-mx';
import SvgViewRect$MX from './svgviewrect-mx';
import SvgContainer from './svgcontainer';
import SvgShape from './svgshape';

export default class SvgUseSymbol extends SvgPaint$MX(SvgViewRect$MX(SvgView$MX(SvgBaseVal$MX(SvgContainer)))) implements squared.svg.SvgUseSymbol {
    constructor(
        public element: SVGUseElement,
        public readonly symbolElement: SVGSymbolElement)
    {
        super(element);
        this.setRect();
        this.setPaint();
    }

    public synchronize(useKeyTime = false) {
        if (this.animate.length) {
            SvgShape.synchronizeAnimate(this, this.animate, useKeyTime);
        }
        super.synchronize(useKeyTime);
    }

    public build(exclusions?: SvgTransformExclusions, residual?: SvgTransformResidual) {
        const element = this.element;
        this.element = <SVGUseElement> (this.symbolElement as unknown);
        super.build(exclusions, residual);
        this.each((item: SvgShape) => {
            if (item.path) {
                item.path.parentElement = element;
                item.path.setPaint();
            }
        });
        this.element = element;
    }

    get viewBox() {
        return this.symbolElement.viewBox.baseVal;
    }
}