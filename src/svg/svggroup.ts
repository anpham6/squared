import { SvgBaseValue, SvgTransform } from './@types/object';

import SvgAnimation from './svganimation';
import SvgAnimate from './svganimate';
import SvgBuild from './svgbuild';
import SvgImage from './svgimage';
import SvgShape from './svgshape';

import { getTransform, isSvgImage, isSvgShape, isSvgUse, isVisible, setVisible } from './lib/util';

export default class SvgGroup extends squared.lib.base.Container<squared.svg.SvgView> implements squared.svg.SvgGroup {
    public baseValue: SvgBaseValue = {
        transformed: null
    };

    public readonly name: string;

    private _animate: SvgAnimation[];
    private _transform?: SvgTransform[];

    constructor(public readonly element: SVGGElement | SVGSVGElement) {
        super();
        this.name = SvgBuild.setName(element);
        this._animate = SvgBuild.toAnimateList(element);
    }

    public build(exclusions?: number[]) {
        this.clear();
        for (const element of Array.from(this.element.children)) {
            if (isSvgUse(element)) {
                const use = SvgBuild.createUseTarget(element, false, <HTMLElement> this.element.parentElement);
                if (use) {
                    use.build(exclusions);
                    this.append(use);
                }
            }
            else if (isSvgShape(element)) {
                const shape = new SvgShape(element);
                if (shape.path) {
                    shape.build(exclusions);
                    this.append(shape);
                }
            }
            else if (isSvgImage(element)) {
                const image = new SvgImage(element);
                image.build(exclusions);
                this.append(image);
            }
        }
    }

    public synchronize(useKeyTime = false) {
        this.each(item => item.synchronize(useKeyTime));
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