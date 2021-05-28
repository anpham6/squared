import SvgBaseVal$MX from './svgbaseval-mx';
import SvgPaint$MX from './svgpaint-mx';
import SvgSynchronize$MX from './svgsynchronize-mx';
import SvgView$MX from './svgview-mx';
import SvgViewRect$MX from './svgviewrect-mx';
import SvgContainer from './svgcontainer';

export default class SvgUseSymbol extends SvgPaint$MX(SvgSynchronize$MX(SvgViewRect$MX(SvgBaseVal$MX(SvgView$MX(SvgContainer))))) implements squared.svg.SvgUseSymbol {
    public readonly instanceType = squared.svg.constant.INSTANCE_TYPE.SVG_USE_SYMBOL;

    constructor(
        public readonly symbolElement: SVGSymbolElement,
        public readonly useElement: SVGUseElement)
    {
        super(useElement);
        this.useParent = this;
        this.rectElement = useElement;
    }

    public build(options?: SvgBuildOptions) {
        this.setRect();
        super.build({ ...options, targetElement: this.symbolElement });
        this.setPaint(this.getPathAll(), options && options.precision);
    }

    public synchronize(options?: SvgSynchronizeOptions) {
        if (this.animations.length) {
            this.animateSequentially(this.getAnimateViewRect(), this.getAnimateTransform(options), undefined, options);
        }
        super.synchronize(...(arguments as unknown) as [SvgSynchronizeOptions?]);
    }

    get viewBox() {
        return this.symbolElement.viewBox.baseVal || { x: 0, y: 0, width: 0, height: 0 };
    }
}