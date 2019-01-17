import { SvgTransformExclusions, SvgTransformResidual } from '../svg/@types/object';

import SvgContainer from './svgcontainer';

export default class SvgElement implements squared.svg.SvgElement {
    public parent?: SvgContainer;

    constructor(public readonly element: SVGGraphicsElement) {
    }

    public build(exclusions?: SvgTransformExclusions, residual?: SvgTransformResidual) {}
    public synchronize(useKeyTime?: boolean) {}
}