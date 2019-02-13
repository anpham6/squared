import { SvgTransformExclude, SvgTransformResidual } from './@types/object';

import SvgContainer from './svgcontainer';

import { INSTANCE_TYPE } from './lib/constant';

type Svg = squared.svg.Svg;

export default class SvgElement implements squared.svg.SvgElement {
    public parent?: SvgContainer;
    public viewport?: Svg;

    constructor(public readonly element: SVGGraphicsElement) {
    }

    public build(exclude?: SvgTransformExclude, residual?: SvgTransformResidual, element?: Element) {}
    public synchronize(keyTimeMode?: number) {}

    get instanceType() {
        return INSTANCE_TYPE.SVG_ELEMENT;
    }
}