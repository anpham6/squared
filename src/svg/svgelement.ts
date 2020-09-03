type Svg = squared.svg.Svg;
type SvgContainer = squared.svg.SvgContainer;

export default class SvgElement implements squared.svg.SvgElement {
    public parent: Null<SvgContainer> = null;
    public viewport?: Svg;
    public readonly instanceType = squared.svg.lib.enumeration.INSTANCE_TYPE.SVG_ELEMENT;

    constructor(public readonly element: SVGGraphicsElement) {}

    public build(options?: SvgBuildOptions) {}
    public synchronize(options?: SvgSynchronizeOptions) {}
}