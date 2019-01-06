import { SvgBaseValue, SvgRect, SvgTransform } from '../svg/@types/object';

import Container = squared.lib.base.Container;

declare global {
    namespace squared.svg {
        interface SvgGroup extends Container<SvgElement>, SvgView {
            readonly element: SVGGElement | SVGSVGElement;
            baseValue: SvgBaseValue;
            synchronize(useKeyTime?: boolean): void;
        }

        interface SvgGroupRect extends SvgRect, SvgViewBox, SvgGroup {
            readonly element: SVGSVGElement;
        }

        class SvgGroup implements SvgGroup {
            constructor(element: SVGGElement | SVGSVGElement);
        }

        class SvgGroupRect implements SvgGroupRect {
            constructor(element: SVGSVGElement);
        }
    }
}

export = squared.svg.SvgGroup;