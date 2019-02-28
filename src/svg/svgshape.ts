import { SvgBuildOptions, SvgSynchronizeOptions } from './@types/object';

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

    public build(options?: SvgBuildOptions) {
        if (this.path) {
            this.path.parent = this.parent;
            if (options === undefined) {
                options = {};
            }
            options.transforms = this.transforms;
            this.path.build(options);
        }
    }

    public synchronize(options?: SvgSynchronizeOptions) {
        if (this.path && this.animations.length) {
            const element = options && options.element;
            this.animateSequentially(this.getAnimateShape(element || this.element), element ? undefined : this.getAnimateTransform(), this.path, options);
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