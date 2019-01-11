import SvgBaseVal$MX from './svgbaseval-mx';
import SvgBase from './svgbase';

export default class SvgBaseVal extends SvgBaseVal$MX(SvgBase) implements squared.svg.SvgBaseVal {
    constructor(element: SVGGraphicsElement) {
        super(element);
    }
}