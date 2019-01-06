import { SvgBaseValue, SvgTransform } from './@types/object';

import SvgAnimation from './svganimation';
import SvgAnimate from './svganimate';
import SvgBuild from './svgbuild';
import SvgCreate from './svgcreate';

import { getTransform, getTransformOrigin, isVisible, setVisible } from './lib/util';

export default class SvgElement implements squared.svg.SvgElement {
    public animatable = true;
    public baseValue: SvgBaseValue = {
        transformed: null
    };

    public readonly name: string;

    private _animate: SvgAnimation[];
    private _transform?: SvgTransform[];

    constructor(public readonly element: SVGGraphicsElement) {
        this.name = SvgCreate.setName(element);
        this._animate = this.animatable ? SvgCreate.toAnimateList(element) : [];
    }

    public build() {}

    public transformFilter(exclusions?: number[]) {
        return (exclusions ? this.transform.filter(item => !exclusions.includes(item.type)) : this.transform).filter(item => !(item.type === SVGTransform.SVG_TRANSFORM_SCALE && item.matrix.a === 1 && item.matrix.d === 1));
    }

    public transformPoints(transform: SvgTransform[], points: Point[], center?: Point) {
        return SvgBuild.applyTransforms(transform, points, getTransformOrigin(this.element), center);
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