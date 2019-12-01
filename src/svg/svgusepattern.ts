import { SvgBuildOptions, SvgSynchronizeOptions } from '../../@types/svg/object';

import SvgSynchronize$MX from './svgsynchronize-mx';
import SvgViewRect$MX from './svgviewrect-mx';
import SvgShapePattern from './svgshapepattern';

import { INSTANCE_TYPE } from './lib/constant';

const { filterArray } = squared.lib.util;

export default class SvgUsePattern extends SvgSynchronize$MX(SvgViewRect$MX(SvgShapePattern)) implements squared.svg.SvgUsePattern {
    constructor(
        public readonly element: SVGUseElement,
        public shapeElement: SVGGeometryElement,
        patternElement: SVGPatternElement)
    {
        super(element, patternElement);
    }

    public build(options?: SvgBuildOptions) {
        options = {
            ...options,
            element: this.shapeElement
        };
        super.build(options);
    }

    public synchronize(options?: SvgSynchronizeOptions) {
        const animations = filterArray(this.animations, item => this.verifyBaseValue(item.attributeName, 0) === undefined || item.attributeName === 'x' || item.attributeName === 'y');
        const transforms = this.getAnimateTransform(options);
        if (animations.length || transforms.length) {
            this.animateSequentially(this.getAnimateViewRect(animations), transforms, undefined, options);
        }
        super.synchronize(options);
    }

    get instanceType() {
        return INSTANCE_TYPE.SVG_USE_PATTERN;
    }
}