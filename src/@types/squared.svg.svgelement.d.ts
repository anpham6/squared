import { SvgTransformExclusions, SvgTransformResidual } from '../svg/@types/object';

declare global {
    namespace squared.svg {
        interface SvgElement {
            viewport?: Svg;
            parent?: SvgContainer;
            readonly element: SVGGraphicsElement;
            build(exclusions?: SvgTransformExclusions, residual?: SvgTransformResidual): void;
            synchronize(useKeyTime?: boolean): void;
        }

        interface SvgShape extends SvgElement, SvgView, SvgSynchronize {
            path?: SvgPath;
            readonly element: SVGShapeElement | SVGUseElement;
            setPath(): void;
        }

        interface SvgImage extends SvgElement, SvgView, SvgViewRect, SvgBaseVal, SvgTransformable {
            readonly element: SVGImageElement | SVGUseElement;
            readonly href: string;
            extract(exclude?: number[]): void;
        }

        interface SvgUse extends SvgShape, SvgViewRect, SvgBaseVal, SvgPaint {
            readonly element: SVGUseElement;
            shapeElement: SVGGraphicsElement;
        }

        class SvgElement implements SvgElement {
            constructor(element: SVGGraphicsElement);
        }

        class SvgShape implements SvgShape {
            constructor(element: SVGGraphicsElement, initPath?: boolean);
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