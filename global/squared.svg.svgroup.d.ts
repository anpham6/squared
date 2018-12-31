import { SvgViewBox } from '../src/svg/types/object';

import Container = squared.lib.base.Container;

declare global {
    namespace squared.svg {
        interface SvgGroup extends SvgBase, Container<SvgElement> {
            synchronize(useKeyTime?: boolean): void;
        }

        interface SvgUse extends SvgGroupViewBox {
            path: SvgPath | undefined;
            setPath(value: SvgPath): void;
        }

        interface SvgGroupViewBox extends SvgViewBox, SvgGroup {}

        class SvgGroup implements SvgGroup {
            constructor(element: SVGGraphicsElement);
        }

        class SvgGroupViewBox implements SvgGroupViewBox {
            constructor(element: SVGSVGElement | SVGUseElement);
        }

        class SvgUse implements SvgUse {
            constructor(element: SVGUseElement, d: string);
        }
    }
}

export = squared.svg.SvgGroup;