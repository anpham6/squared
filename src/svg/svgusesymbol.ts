import { SvgTransformExclude, SvgTransformResidual } from './@types/object';

import SvgBaseVal$MX from './svgbaseval-mx';
import SvgPaint$MX from './svgpaint-mx';
import SvgSynchronize$MX from './svgsynchronize-mx';
import SvgView$MX from './svgview-mx';
import SvgViewRect$MX from './svgviewrect-mx';
import SvgContainer from './svgcontainer';

import { INSTANCE_TYPE } from './lib/constant';

const $dom = squared.lib.dom;

export default class SvgUseSymbol extends SvgPaint$MX(SvgSynchronize$MX(SvgViewRect$MX(SvgBaseVal$MX(SvgView$MX(SvgContainer))))) implements squared.svg.SvgUseSymbol {
    constructor(
        public element: SVGUseElement,
        public readonly symbolElement: SVGSymbolElement)
    {
        super(element);
    }

    public build(exclude?: SvgTransformExclude, residual?: SvgTransformResidual) {
        this.setRect();
        super.build(exclude, residual, this.symbolElement);
        const x = this.getBaseValue('x', 0);
        const y = this.getBaseValue('y', 0);
        if (x !== 0 || y !== 0) {
            const pt = { x, y };
            for (const item of this.cascade()) {
                item.translationOffset = pt;
            }
        }
        this.setPaint(this.getPathAll());
    }

    public synchronize(keyTimeMode = 0) {
        if (this.animations.length) {
            this.mergeAnimations(this.getAnimateViewRect(), this.getAnimateTransform(), keyTimeMode);
        }
        super.synchronize(keyTimeMode);
    }

    get viewBox() {
        if (this.symbolElement.viewBox.baseVal) {
            return this.symbolElement.viewBox.baseVal;
        }
        else {
            return $dom.getDOMRect(this.element);
        }
    }

    get instanceType() {
        return INSTANCE_TYPE.SVG_USE_SYMBOL;
    }
}