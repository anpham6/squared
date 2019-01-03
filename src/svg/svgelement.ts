import { SvgTransform } from './@types/object';

import SvgAnimation from './svganimation';
import SvgCreate from './svgcreate';

import { getTransform, isSvgVisible } from './lib/util';

export default abstract class SvgElement implements squared.svg.SvgElement {
    public animatable = true;
    public animate: SvgAnimation[];
    public visible: boolean;

    public readonly name: string;

    private _transformed = false;
    private _transform?: SvgTransform[];

    constructor(public readonly element: SVGGraphicsElement) {
        this.name = SvgCreate.setName(element);
        this.animate = this.animatable ? SvgCreate.toAnimateList(element) : [];
        this.visible = isSvgVisible(element);
    }

    public abstract build(): string;

    public filterTransform(exclusions?: number[]) {
        return exclusions ? this.transform.filter(item => !exclusions.includes(item.type)) : this.transform;
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
    }
    get transformed() {
        return this._transformed;
    }
}