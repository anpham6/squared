import { SvgTransform, SvgViewBox } from '../svg/@types/object';

import Container = squared.lib.base.Container;

declare global {
    namespace squared.svg {
        interface SvgGroup extends SvgBase, Container<SvgElement> {
            transform?: SvgTransform[];
            synchronize(useKeyTime?: boolean): void;
        }

        interface SvgGroupViewBox extends SvgViewBox, SvgGroup {}

        class SvgGroup implements SvgGroup {
            constructor(element: SVGGraphicsElement);
        }

        class SvgGroupViewBox implements SvgGroupViewBox {
            constructor(element: SVGSVGElement);
        }
    }
}

export = squared.svg.SvgGroup;