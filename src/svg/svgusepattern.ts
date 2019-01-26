import { SvgTransformExclusions, SvgTransformResidual } from './@types/object';

import SvgSynchronize$MX from './svgsynchronize-mx';
import SvgViewRect$MX from './svgviewrect-mx';
import SvgShapePattern from './svgshapepattern';

import { INSTANCE_TYPE } from './lib/constant';

export default class SvgUsePattern extends SvgSynchronize$MX(SvgViewRect$MX(SvgShapePattern)) implements squared.svg.SvgUsePattern {
    constructor(
        public readonly element: SVGUseElement,
        public shapeElement: SVGGraphicsElement,
        patternElement: SVGPatternElement)
    {
        super(element, patternElement);
    }

    public build(exclusions?: SvgTransformExclusions, residual?: SvgTransformResidual) {
        super.build(exclusions, residual, this.shapeElement);
    }

    public synchronize(useKeyTime = false) {
        const animation = this.animation.filter(item => this.validateBaseValueType(item.attributeName, 0) === undefined || item.attributeName === 'x' || item.attributeName === 'y');
        if (animation.length) {
            this.mergeAnimate(this.getAnimateViewRect(), useKeyTime);
        }
        super.synchronize(useKeyTime);
    }

    get instanceType() {
        return INSTANCE_TYPE.SVG_USE_PATTERN;
    }
}