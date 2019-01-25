import { SvgTransformExclusions, SvgTransformResidual } from './@types/object';

import SvgSynchronize$MX from './svgsynchronize-mx';
import SvgView$MX from './svgview-mx';
import SvgElement from './svgelement';
import SvgPath from './svgpath';

export default class SvgShape extends SvgSynchronize$MX(SvgView$MX(SvgElement)) implements squared.svg.SvgShape {
    public readonly element!: SVGShapeElement | SVGUseElement;

    private _path?: SvgPath;

    constructor(element: SVGGraphicsElement, initPath = true) {
        super(element);
        if (initPath) {
            this.setPath();
        }
    }

    public setPath() {
        this.path = new SvgPath(this.element);
    }

    public build(exclusions?: SvgTransformExclusions, residual?: SvgTransformResidual) {
        if (this.path) {
            SvgPath.build(this.path, this.transform, this.element, exclusions, residual);
        }
    }

    public synchronize(useKeyTime = false) {
        if (this.path && this.animation.length) {
            this.mergeAnimate(this.getAnimateShape(), useKeyTime, this.path);
        }
    }

    set path(value) {
        this._path = value;
        if (value) {
            value.parent = this.parent;
            value.name = this.name;
        }
    }
    get path() {
        return this._path;
    }
}