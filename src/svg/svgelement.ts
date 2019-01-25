import { SvgTransformExclusions, SvgTransformResidual } from './@types/object';

import SvgContainer from './svgcontainer';

type Svg = squared.svg.Svg;

export default class SvgElement implements squared.svg.SvgElement {
    public parent?: SvgContainer;
    public viewport?: Svg;

    constructor(public readonly element: SVGGraphicsElement) {
    }

    public build(exclusions?: SvgTransformExclusions, residual?: SvgTransformResidual) {}
    public synchronize(useKeyTime?: boolean) {}
}