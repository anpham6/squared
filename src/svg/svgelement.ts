import { SvgBaseValue, SvgTransform } from './@types/object';

import SvgAnimation from './svganimation';
import SvgAnimate from './svganimate';
import SvgBuild from './svgbuild';

import { getTransform, isVisible, setVisible } from './lib/util';

export default class SvgElement implements squared.svg.SvgElement {
    public nested = false;
    public baseValue: SvgBaseValue = {
        transformed: null
    };

    public readonly name: string;

    private _animate: SvgAnimation[];
    private _transform?: SvgTransform[];

    constructor(public readonly element: SVGGraphicsElement) {
        this.name = SvgBuild.setName(element);
        this._animate = this.nested ? [] : SvgBuild.toAnimateList(element);
    }

    public build() {}
    public synchronize() {}

    set transform(value) {
        this._transform = value;
    }
    get transform() {
        if (this._transform === undefined) {
            this._transform = getTransform(this.element) || SvgBuild.toTransformList(this.element.transform.baseVal);
        }
        return this._transform;
    }

    get animate() {
        for (const item of this._animate) {
            if (item instanceof SvgAnimate) {
                item.parent = this;
            }
        }
        return this._animate;
    }

    set visible(value) {
        setVisible(this.element, value);
    }
    get visible() {
        return isVisible(this.element);
    }
}