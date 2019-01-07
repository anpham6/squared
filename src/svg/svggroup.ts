import { SvgBaseValue, SvgTransform } from './@types/object';

import SvgAnimation from './svganimation';
import SvgAnimate from './svganimate';
import SvgCreate from './svgcreate';
import SvgImage from './svgimage';
import SvgShape from './svgshape';
import SvgUse from './svguse';

import { getTransform, isSvgImage, isSvgShape, isSvgUse, isVisible, setVisible } from './lib/util';

export default class SvgGroup extends squared.lib.base.Container<squared.svg.SvgElement> implements squared.svg.SvgGroup {
    public baseValue: SvgBaseValue = {
        transformed: null
    };

    public readonly name: string;

    private _animate: SvgAnimation[];
    private _transform?: SvgTransform[];

    constructor(public readonly element: SVGGElement | SVGSVGElement) {
        super();
        this.name = SvgCreate.setName(element);
        this._animate = SvgCreate.toAnimateList(element);
        this.setChildren();
    }

    public synchronize(useKeyTime = true) {}

    public setChildren() {
        this.clear();
        for (const element of Array.from(this.element.children)) {
            if (isSvgUse(element)) {
                const use = SvgCreate.getUseTarget(element, false, <HTMLElement> this.element.parentElement);
                if (use) {
                    this.append(use as SvgUse);
                }
            }
            else if (isSvgShape(element)) {
                const shape = new SvgShape(element);
                if (shape.path) {
                    this.append(shape);
                }
            }
            else if (isSvgImage(element)) {
                this.append(new SvgImage(element));
            }
        }
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