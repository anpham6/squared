import SvgViewRect$MX from './svgviewrect-mx';
import SvgGroup from './svggroup';
import SvgShape from './svgshape';

export default class SvgGroupRect extends SvgViewRect$MX(SvgGroup) implements squared.svg.SvgGroupRect {
    private _symbol?: SVGSymbolElement;

    constructor(
        public readonly element: SVGSVGElement | SVGUseElement,
        symbol?: SVGSymbolElement)
    {
        super(element);
        this.setRect();
        if (symbol) {
            this._symbol = symbol;
        }
    }

    public synchronize(useKeyTime = false) {
        if (this.animate.length) {
            SvgShape.synchronizeAnimate(this.element, this.animate, useKeyTime);
        }
    }

    get viewBox() {
        if (this._symbol) {
            return Object.assign({}, this._symbol.viewBox.baseVal);
        }
        else if (this.element instanceof SVGSVGElement) {
            return this.element.viewBox.baseVal;
        }
        else {
            return undefined;
        }
    }
}