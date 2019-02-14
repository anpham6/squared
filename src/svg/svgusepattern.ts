import { SvgTransformExclude, SvgTransformResidual } from './@types/object';

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

    public build(exclude?: SvgTransformExclude, residual?: SvgTransformResidual) {
        super.build(exclude, residual, this.shapeElement);
    }

    public synchronize(keyTimeMode = 0) {
        const [animations, transformations] = [this.animations.filter(item => this.verifyBaseValue(item.attributeName, 0) === undefined || item.attributeName === 'x' || item.attributeName === 'y'), this.getAnimateTransform()];
        if (animations.length || transformations.length) {
            this.mergeAnimations(this.getAnimateViewRect(animations), transformations, keyTimeMode);
        }
        super.synchronize(keyTimeMode);
    }

    get instanceType() {
        return INSTANCE_TYPE.SVG_USE_PATTERN;
    }
}