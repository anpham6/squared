import SvgView$MX from './svgview-mx';
import SvgContainer from './svgcontainer';

import { ascendToViewport } from './lib/util';

export default class SvgGroup extends SvgView$MX(SvgContainer) implements squared.svg.SvgGroup {
    public namespaceElement: SVGSVGElement;

    constructor(public readonly element: SVGGElement | SVGSVGElement) {
        super(element);
        this.namespaceElement = ascendToViewport(element).pop() as SVGSVGElement;
    }
}