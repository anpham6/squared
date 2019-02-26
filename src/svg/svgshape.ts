import { SvgTransformExclude, SvgTransformResidual } from './@types/object';

import SvgSynchronize$MX from './svgsynchronize-mx';
import SvgView$MX from './svgview-mx';
import SvgElement from './svgelement';
import SvgPath from './svgpath';

import { INSTANCE_TYPE } from './lib/constant';

export default class SvgShape extends SvgSynchronize$MX(SvgView$MX(SvgElement)) implements squared.svg.SvgShape {
    private _path?: SvgPath;

    constructor(
        public element: SVGGeometryElement | SVGUseElement,
        initPath = true)
    {
        super(element);
        if (initPath) {
            this.setPath();
        }
    }

    public setPath() {
        this.path = new SvgPath(<SVGGeometryElement> this.element);
    }

    public build(exclude?: SvgTransformExclude, residual?: SvgTransformResidual, precision?: number) {
        if (this.path) {
            this.path.parent = this.parent;
            SvgPath.build(this.path, this.transforms, exclude, residual, precision);
        }
    }

    public synchronize(keyTimeMode = 0, precision?: number, element?: SVGGraphicsElement) {
        if (this.path && this.animations.length) {
            this.animateSequentially(this.getAnimateShape(element || this.element), element ? undefined : this.getAnimateTransform(), this.path, keyTimeMode, precision);
        }
    }

    set path(value) {
        this._path = value;
        if (value) {
            value.name = this.name;
        }
    }
    get path() {
        return this._path;
    }

    get instanceType() {
        return INSTANCE_TYPE.SVG_SHAPE;
    }
}