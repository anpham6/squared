import { SvgBaseValue, SvgTransform } from './@types/object';

import SvgAnimation from './svganimation';
import SvgAnimate from './svganimate';
import SvgCreate from './svgcreate';
import SvgElement from './svgelement';

import { getTransform, isVisible, setVisible } from './lib/util';

export default class SvgGroup extends squared.lib.base.Container<SvgElement> implements squared.svg.SvgGroup {
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
    }

    public synchronize(useKeyTime = true) {}

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