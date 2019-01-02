import { SvgTransform } from './@types/object';

import SvgAnimation from './svganimation';
import SvgCreate from './svgcreate';
import SvgElement from './svgelement';
import SvgShape from './svgshape';

import { getTransform, isSvgVisible } from './lib/util';

export default class SvgGroup extends squared.lib.base.Container<SvgElement> implements squared.svg.SvgGroup {
    public animate: SvgAnimation[];

    public readonly visible: boolean;
    public readonly name: string;

    private _transform?: SvgTransform[];

    constructor(public readonly element: SVGGraphicsElement) {
        super();
        this.name = SvgCreate.setName(element);
        this.animate = SvgCreate.toAnimateList(element);
        this.visible = isSvgVisible(element);
    }

    public synchronize(useKeyTime = true) {
        if (this.animate.length) {
            SvgShape.synchronizeAnimations(this.element, this.animate, useKeyTime);
        }
    }

    get transform() {
        if (this._transform === undefined) {
            this._transform = getTransform(this.element) || SvgCreate.toTransformList(this.element.transform.baseVal);
        }
        return this._transform;
    }
}