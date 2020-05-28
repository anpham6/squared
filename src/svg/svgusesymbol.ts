import SvgBaseVal$MX from './svgbaseval-mx';
import SvgPaint$MX from './svgpaint-mx';
import SvgSynchronize$MX from './svgsynchronize-mx';
import SvgView$MX from './svgview-mx';
import SvgViewRect$MX from './svgviewrect-mx';
import SvgBuild from './svgbuild';
import SvgContainer from './svgcontainer';

import { INSTANCE_TYPE } from './lib/constant';
import { getDOMRect } from './lib/util';

export default class SvgUseSymbol extends SvgPaint$MX(SvgSynchronize$MX(SvgViewRect$MX(SvgBaseVal$MX(SvgView$MX(SvgContainer))))) implements squared.svg.SvgUseSymbol {
    constructor(
        public element: SVGUseElement,
        public readonly symbolElement: SVGSymbolElement)
    {
        super(element);
    }

    public build(options?: SvgBuildOptions) {
        this.setRect();
        super.build({ ...options, symbolElement: this.symbolElement });
        const x: number = this.getBaseValue('x', 0);
        const y: number = this.getBaseValue('y', 0);
        if (x !== 0 || y !== 0) {
            const pt = { x, y };
            this.cascade(item => {
                if (SvgBuild.asImage(item)) {
                    item.translationOffset = pt;
                }
            });
        }
        this.setPaint(this.getPathAll(), options?.precision);
    }

    public synchronize(options?: SvgSynchronizeOptions) {
        if (this.animations.length) {
            this.animateSequentially(this.getAnimateViewRect(), this.getAnimateTransform(options), undefined, options);
        }
        super.synchronize(options);
    }

    get viewBox() {
        return this.symbolElement.viewBox.baseVal || getDOMRect(this.element);
    }

    get instanceType() {
        return INSTANCE_TYPE.SVG_USE_SYMBOL;
    }
}