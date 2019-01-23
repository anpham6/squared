import { SvgTransformExclusions, SvgTransformResidual } from './@types/object';

import SvgBaseVal$MX from './svgbaseval-mx';
import SvgPaint$MX from './svgpaint-mx';
import SvgSynchronize$MX from './svgsynchronize-mx';
import SvgView$MX from './svgview-mx';
import SvgViewRect$MX from './svgviewrect-mx';
import SvgContainer from './svgcontainer';
import SvgShape from './svgshape';

export default class SvgUseSymbol extends SvgPaint$MX(SvgSynchronize$MX(SvgViewRect$MX(SvgBaseVal$MX(SvgView$MX(SvgContainer))))) implements squared.svg.SvgUseSymbol {
    constructor(
        public element: SVGUseElement,
        public readonly symbolElement: SVGSymbolElement)
    {
        super(element);
    }

    public build(exclusions?: SvgTransformExclusions, residual?: SvgTransformResidual) {
        this.setRect();
        const element = this.element;
        this.element = <SVGUseElement> (this.symbolElement as unknown);
        super.build(exclusions, residual);
        this.each((item: SvgShape) => {
            if (item.path) {
                item.path.parentElement = element;
            }
        });
        this.element = element;
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
            this.mergeAnimate(this.getAnimateViewRect(), useKeyTime);
        }
        super.synchronize(useKeyTime);
    }

    get viewBox() {
        return this.symbolElement.viewBox.baseVal;
    }
}