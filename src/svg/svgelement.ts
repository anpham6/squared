import SvgContainer from './svgcontainer';

export default class SvgElement implements squared.svg.SvgElement {
    public parent?: SvgContainer;

    constructor(public readonly element: SVGGraphicsElement) {
    }

    public build() {}
    public synchronize(useKeyTime?: boolean) {}
}