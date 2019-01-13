import SvgContainer from './svgcontainer';

export default class SvgBase implements squared.svg.SvgBase {
    public parent?: SvgContainer;

    constructor(public readonly element: SVGGraphicsElement) {
    }

    public build() {}
    public synchronize(useKeyTime?: boolean) {}
}