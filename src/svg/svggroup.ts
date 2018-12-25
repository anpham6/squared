import SvgAnimation from './svganimation';
import SvgBuild from './svgbuild';
import SvgElement from './svgelement';

import { isVisible } from './lib/util';

export default class SvgGroup extends squared.lib.base.Container<SvgElement> implements squared.svg.SvgGroup {
    public animate: SvgAnimation[];
    public visible = true;

    public readonly name: string;

    constructor(public readonly element: SVGGraphicsElement) {
        super();
        this.name = SvgBuild.setName(element);
        this.animate = this.animatable ? SvgElement.toAnimateList(element) : [];
        this.visible = isVisible(element);
    }

    get transform() {
        return this.element.transform.baseVal;
    }

    get animatable() {
        return this.element instanceof SVGGElement;
    }

    get transformable() {
        return this.element instanceof SVGGElement && this.element.transform.baseVal.numberOfItems > 0;
    }
}