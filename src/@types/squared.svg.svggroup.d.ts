import { SvgBaseValue, SvgRectBaseValue } from '../svg/@types/object';

import Container = squared.lib.base.Container;

declare global {
    namespace squared.svg {
        interface SvgGroup extends Container<SvgElement>, SvgView {
            readonly element: SVGGElement | SVGSVGElement;
            synchronize(useKeyTime?: boolean): void;
        }

        interface SvgGroupPaint extends SvgGroup, SvgPaint {
            readonly element: SVGGElement;
        }

        interface SvgGroupRect extends SvgGroup, SvgViewRect, SvgViewBox {
            baseValue: SvgRectBaseValue;
            readonly element: SVGSVGElement;
        }

        class SvgGroup implements SvgGroup {
            constructor(element: SVGGElement | SVGSVGElement);
        }

        class SvgGroupPaint implements SvgGroupPaint {
            constructor(element: SVGGElement);
        }

        class SvgGroupRect implements SvgGroupRect {
            constructor(element: SVGSVGElement);
        }
    }
}

export = squared.svg.SvgGroup;