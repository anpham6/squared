import { SvgRectBaseValue } from '../svg/@types/object';

declare global {
    namespace squared.svg {
        interface SvgElement extends SvgBuildable {
            readonly element: SVGGraphicsElement;
        }

        interface SvgShape extends SvgElement, SvgView {
            type: number;
            path?: SvgPath;
            setType(element?: SVGGraphicsElement): void;
        }

        interface SvgImage extends SvgElement, SvgViewRect, SvgTransformable {
            href: string;
            readonly element: SVGImageElement | SVGUseElement;
            extract(exclude?: number[]): void;
        }

        interface SvgUse extends SvgElement, SvgViewRect {
            shapeElement: SVGGraphicsElement;
            setShape(value: SVGGraphicsElement): void;
        }

        class SvgElement implements SvgElement {
            constructor(element: SVGGraphicsElement);
        }

        class SvgShape implements SvgShape {
            public static synchronizeAnimate(element: SVGGraphicsElement, animate: SvgAnimation[], useKeyTime?: boolean, path?: SvgPath): SvgAnimation[];
            constructor(element: SVGGraphicsElement);
        }

        class SvgImage implements SvgImage {
            constructor(element: SVGImageElement | SVGUseElement, imageElement?: SVGImageElement);
        }

        class SvgUse implements SvgUse {
            constructor(element: SVGUseElement, shapeElement: SVGGraphicsElement);
        }
    }
}

export = squared.svg.SvgElement;