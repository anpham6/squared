type Svg = squared.svg.Svg;
type SvgContainer = squared.svg.SvgContainer;

export default class SvgElement implements squared.svg.SvgElement {
    public parent: Null<SvgContainer> = null;
    public viewport: Null<Svg> = null;
    public readonly instanceType = squared.svg.constant.INSTANCE_TYPE.SVG_ELEMENT;

    constructor(public readonly element: SVGGraphicsElement) {}

    public build(options?: SvgBuildOptions) {}
    public synchronize(options?: SvgSynchronizeOptions) {}
}