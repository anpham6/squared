import { SvgTransformExclude, SvgTransformResidual } from './@types/object';

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

    public build(exclude?: SvgTransformExclude, residual?: SvgTransformResidual, precision?: number) {
        super.build(exclude, residual, precision, this.shapeElement);
    }

    public synchronize(keyTimeMode = 0, precision?: number) {
        const [animations, transformations] = [$util.filterArray(this.animations, item => this.verifyBaseValue(item.attributeName, 0) === undefined || item.attributeName === 'x' || item.attributeName === 'y'), this.getAnimateTransform()];
        if (animations.length || transformations.length) {
            this.mergeAnimations(this.getAnimateViewRect(animations), transformations, keyTimeMode, precision);
        }
        super.synchronize(keyTimeMode, precision);
    }

    get instanceType() {
        return INSTANCE_TYPE.SVG_USE_PATTERN;
    }
}