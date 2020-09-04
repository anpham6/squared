import SvgView$MX from './svgview-mx';
import SvgContainer from './svgcontainer';

export default class SvgPattern extends SvgView$MX(SvgContainer) implements squared.svg.SvgPattern {
    public readonly instanceType = squared.svg.constant.INSTANCE_TYPE.SVG_PATTERN;

    constructor(
        public element: SVGGraphicsElement,
        public readonly patternElement: SVGPatternElement)
    {
        super(element);
    }

    public build(options?: SvgBuildOptions) {
        super.build({ ...options, targetElement: this.patternElement, initialize: false });
    }

    get animations() {
        return [];
    }
}