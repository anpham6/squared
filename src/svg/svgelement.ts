import SvgBaseVal from './svgbaseval';

export default class SvgElement extends SvgBaseVal implements squared.svg.SvgElement {
    constructor(element: SVGGraphicsElement) {
        super(element);
    }

    public build() {}
    public synchronize() {}
}