import { SvgTransform } from './@types/object';

import SvgAnimation from './svganimation';
import SvgCreate from './svgcreate';

import { getTransform, isSvgVisible } from './lib/util';

export default abstract class SvgElement implements squared.svg.SvgElement {
    public animate: SvgAnimation[];
    public visible: boolean;

    public readonly name: string;

    private _transform?: SvgTransform[];
    private _transformed = false;

    constructor(public readonly element: SVGGraphicsElement) {
        this.name = SvgCreate.setName(element);
        this.animate = SvgCreate.toAnimateList(element);
        this.visible = isSvgVisible(element);
    }

    set transform(value) {
        this._transform = value;
    }
    get transform() {
        if (this._transform === undefined) {
            this._transform = getTransform(this.element) || SvgCreate.toTransformList(this.element.transform.baseVal);
        }
        return this._transform;
    }

    set transformed(value) {
        this._transformed = value;
        if (!value) {
            this._transform = undefined;
        }
        else {
            if (this._transform !== undefined) {
                this._transform.length = 0;
            }
        }
    }
    get transformed() {
        return this._transformed;
    }
}