import SvgPaint$MX from './svgpaint-mx';
import SvgGroup from './svggroup';

export default class SvgGroupPaint extends SvgPaint$MX(SvgGroup) implements squared.svg.SvgGroupPaint {
    constructor(public readonly element: SVGGElement | SVGUseElement) {
        super(element);
        this.setPaint();
    }
}