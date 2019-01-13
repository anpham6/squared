import { SvgTransformExclusions, SvgTransformResidual } from './@types/object';

import SvgSynchronize$MX from './svgsynchronize-mx';
import SvgView$MX from './svgview-mx';
import SvgBuild from './svgbuild';
import SvgElement from './svgelement';
import SvgPath from './svgpath';

import { SHAPES, getTransform } from './lib/util';

export default class SvgShape extends SvgSynchronize$MX(SvgView$MX(SvgElement)) implements squared.svg.SvgShape {
    public type!: number;

    private _path?: SvgPath;

    constructor(public readonly element: SVGGraphicsElement) {
        super(element);
        this.setType();
    }

    public setType(element?: SVGGraphicsElement) {
        this.type = SHAPES[(element || this.element).tagName] || 0;
    }

    public build(exclusions?: SvgTransformExclusions, residual?: SvgTransformResidual) {
        let path: SvgPath;
        if (this._path === undefined) {
            path = new SvgPath(this.element);
            this.path = path;
        }
        else {
            path = this._path;
        }
        const transform = this.transform.slice();
        if (this.element !== path.element) {
            transform.push(...(getTransform(path.element) || SvgBuild.toTransformList(path.element.transform.baseVal)));
        }
        path.draw(SvgBuild.filterTransforms(transform, exclusions ? exclusions[path.element.tagName] : undefined), residual);
    }

    public synchronize(useKeyTime = false) {
        if (this.path && this.animate.length) {
            this.merge(this.getAnimateShape(), useKeyTime, this.path);
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