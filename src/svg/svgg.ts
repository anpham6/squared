import SvgPaint$MX from './svgpaint-mx';
import SvgView$MX from './svgview-mx';
import SvgContainer from './svgcontainer';

export default class SvgG extends SvgPaint$MX(SvgView$MX(SvgContainer)) implements squared.svg.SvgG {
    constructor(public readonly element: SVGGElement) {
        super(element);
        this.setPaint();
    }
}