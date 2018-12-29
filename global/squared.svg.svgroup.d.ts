import { SvgViewBox } from '../src/svg/types/svg';

import Container = squared.lib.base.Container;

declare global {
    namespace squared.svg {
        interface SvgGroup extends SvgBase, Container<SvgElement> {
            synchronize(useKeyTime?: boolean): void;
        }

        class SvgGroup implements SvgGroup {
            constructor(element: SVGGraphicsElement);
        }

        interface SvgGroupViewBox extends SvgViewBox, SvgGroup {}

        class SvgGroupViewBox implements SvgGroupViewBox {
            constructor(element: SVGSVGElement | SVGUseElement);
        }

        interface SvgUse extends SvgGroupViewBox {
            path: SvgPath | undefined;
            setPath(value: SvgPath): void;
        }

        class SvgUse implements SvgUse {
            constructor(element: SVGUseElement, d: string);
        }
    }
}

export {};