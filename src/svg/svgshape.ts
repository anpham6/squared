import { SvgTransformExclude, SvgTransformResidual } from './@types/object';

import SvgSynchronize$MX from './svgsynchronize-mx';
import SvgView$MX from './svgview-mx';
import SvgElement from './svgelement';
import SvgPath from './svgpath';

import { INSTANCE_TYPE } from './lib/constant';

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

    public build(exclude?: SvgTransformExclude, residual?: SvgTransformResidual) {
        if (this.path) {
            this.path.parent = this.parent;
            SvgPath.build(this.path, this.transforms, exclude, residual);
        }
    }

    public synchronize(useKeyTime = 0, element?: SVGGraphicsElement) {
        if (this.path && this.animations.length) {
            this.mergeAnimations(this.getAnimateShape(element || this.element), element ? [] : this.getAnimateTransform(), useKeyTime, this.path);
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