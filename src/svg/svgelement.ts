import type { SvgBuildOptions, SvgSynchronizeOptions } from '../../@types/svg/object';

import SvgContainer from './svgcontainer';

import { INSTANCE_TYPE } from './lib/constant';

type Svg = squared.svg.Svg;

export default class SvgElement implements squared.svg.SvgElement {
    public parent?: SvgContainer;
    public viewport?: Svg;

    constructor(public readonly element: SVGGraphicsElement) {
    }

    public build(options?: SvgBuildOptions) {}
    public synchronize(options?: SvgSynchronizeOptions) {}

    get instanceType() {
        return INSTANCE_TYPE.SVG_ELEMENT;
    }
}