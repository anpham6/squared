import { SvgBuildOptions, SvgSynchronizeOptions } from './@types/object';

import SvgSynchronize$MX from './svgsynchronize-mx';
import SvgViewRect$MX from './svgviewrect-mx';
import SvgShapePattern from './svgshapepattern';

import { INSTANCE_TYPE } from './lib/constant';

const $util = squared.lib.util;

export default class SvgUsePattern extends SvgSynchronize$MX(SvgViewRect$MX(SvgShapePattern)) implements squared.svg.SvgUsePattern {
    constructor(
        public readonly element: SVGUseElement,
        public shapeElement: SVGGeometryElement,
        patternElement: SVGPatternElement)
    {
        super(element, patternElement);
    }

    public build(options?: SvgBuildOptions) {
        options = { ...options };
        options.element = this.shapeElement;
        super.build(options);
    }

    public synchronize(options?: SvgSynchronizeOptions) {
        const animations = $util.filterArray(this.animations, item => this.verifyBaseValue(item.attributeName, 0) === undefined || item.attributeName === 'x' || item.attributeName === 'y');
        const transformations = this.getAnimateTransform();
        if (animations.length || transformations.length) {
            this.animateSequentially(this.getAnimateViewRect(animations), transformations, undefined, options);
        }
        super.synchronize(options);
    }

    get instanceType() {
        return INSTANCE_TYPE.SVG_USE_PATTERN;
    }
}