import { SvgRect } from './@types/object';

import SvgGroup from './svggroup';
import SvgShape from './svgshape';

export default class SvgGroupRect extends SvgGroup implements squared.svg.SvgGroupRect {
    public x: number;
    public y: number;
    public width: number;
    public height: number;

    private _viewBox!: SvgRect;

    constructor(public readonly element: SVGSVGElement) {
        super(element);
        this.x = element.x.baseVal.value;
        this.y = element.y.baseVal.value;
        this.width = element.width.baseVal.value;
        this.height = element.height.baseVal.value;
        this.setViewBox(element.viewBox.baseVal);
    }

    public setViewBox(value: SvgRect) {
        this._viewBox = value;
    }

    public synchronize(useKeyTime = true) {
        if (this.animate.length) {
            SvgShape.synchronizeAnimate(this.element, this.animate, useKeyTime);
        }
    }

    get viewBox() {
        return this._viewBox;
    }
}