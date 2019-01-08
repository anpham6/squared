import SvgPaint$MX from './svgpaint-mx';
import SvgView$MX from './svgview-mx';
import SvgViewRect$MX from './svgviewrect-mx';
import SvgContainer from './svgcontainer';
import SvgShape from './svgshape';

export default class SvgUseSymbol extends SvgPaint$MX(SvgViewRect$MX(SvgView$MX(SvgContainer))) implements squared.svg.SvgUseSymbol {
    constructor(
        public readonly element: SVGUseElement,
        public readonly symbolElement: SVGSymbolElement)
    {
        super(element);
        this.setRect();
        this.setPaint();
    }

    public synchronize(useKeyTime = false) {
        if (this.animate.length) {
            SvgShape.synchronizeAnimate(this.element, this.animate, useKeyTime);
        }
    }

    get viewBox() {
        return this.symbolElement.viewBox.baseVal;
    }
}