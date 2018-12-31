import { SvgTransform, SvgViewBox } from '../src/svg/types/object';

declare global {
    namespace squared.svg {
        interface SvgElement extends SvgBase {
            path: SvgPath | undefined;
            readonly drawable: boolean;
            synchronize(useKeyTime?: boolean): void;
        }

        interface SvgImage extends SvgViewBox, SvgElement, SvgTransformable {
            href: string;
            transformRect(): void;
        }

        class SvgElement implements SvgElement {
            public static toAnimateList(element: SVGGraphicsElement): SvgAnimation[];
            public static synchronizeAnimations(element: SVGGraphicsElement, animate: SvgAnimation[], useKeyTime?: boolean, path?: SvgPath): SvgAnimation[];
            constructor(element: SVGGraphicsElement);
        }

        class SvgImage implements SvgImage {
            constructor(element: SVGUseElement, d: string);
        }
    }
}

export = squared.svg.SvgElement;