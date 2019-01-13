import SvgBase from './svgbase';

export default class SvgElement extends SvgBase implements squared.svg.SvgElement {
    constructor(element: SVGGraphicsElement) {
        super(element);
    }
}