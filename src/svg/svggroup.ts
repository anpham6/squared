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
        this.animate = SvgElement.toAnimateList(element);
        this.visible = isVisible(element);
    }

    public synchronize(useKeyTime = true) {
        if (this.animate.length) {
            SvgElement.synchronizeAnimations(this.element, this.animate, useKeyTime);
        }
    }

    get transform() {
        return this.element.transform.baseVal;
    }
}