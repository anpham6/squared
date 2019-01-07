import { SvgBaseValue, SvgRectBaseValue } from '../svg/@types/object';

import Container = squared.lib.base.Container;

declare global {
    namespace squared.svg {
        interface SvgGroup extends Container<SvgElement>, SvgView, SvgParent {
            readonly element: SVGGraphicsElement;
            synchronize(useKeyTime?: boolean): void;
        }

        interface SvgGroupPaint extends SvgGroup, SvgPaint {
            readonly element: SVGGElement | SVGUseElement;
        }

        interface SvgGroupRect extends SvgGroup, SvgViewRect, SvgViewBox {
            baseValue: SvgRectBaseValue;
            readonly element: SVGSVGElement | SVGUseElement;
        }

        class SvgGroup implements SvgGroup {
            constructor(element: SVGGraphicsElement);
        }

        class SvgGroupPaint implements SvgGroupPaint {
            constructor(element: SVGGElement | SVGUseElement);
        }

        class SvgGroupRect implements SvgGroupRect {
            constructor(element: SVGSVGElement | SVGUseElement, symbol?: SVGSymbolElement);
        }
    }
}

export = squared.svg.SvgGroup;