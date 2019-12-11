import { SvgBuildOptions, SvgSynchronizeOptions } from '../../@types/svg/object';

import SvgSynchronize$MX from './svgsynchronize-mx';
import SvgView$MX from './svgview-mx';
import SvgElement from './svgelement';
import SvgPath from './svgpath';

import { INSTANCE_TYPE } from './lib/constant';

export default class SvgShape extends SvgSynchronize$MX(SvgView$MX(SvgElement)) implements squared.svg.SvgShape {
    private _path?: SvgPath;

    constructor(
        public element: SVGGeometryElement | SVGUseElement,
        initialize = true)
    {
        super(element);
        if (initialize) {
            this.setPath();
        }
    }

    public setPath() {
        this.path = new SvgPath(<SVGGeometryElement> this.element);
    }

    public build(options?: SvgBuildOptions) {
        const path = this.path;
        if (path) {
            path.parent = this.parent;
            options = {
                ...options,
                transforms: this.transforms
            };
            path.build(options);
        }
    }

    public synchronize(options?: SvgSynchronizeOptions) {
        if (this.animations.length) {
            const path = this.path;
            if (path) {
                const element = options?.element;
                if (element) {
                    this.animateSequentially(this.getAnimateShape(element), undefined, path, options);
                }
                else {
                    this.animateSequentially(this.getAnimateShape(this.element), this.getAnimateTransform(options), path, options);
                }
            }
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