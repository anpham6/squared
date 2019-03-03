import { SvgBuildOptions, SvgSynchronizeOptions } from '../svg/@types/object';

declare global {
    namespace squared.svg {
        interface SvgElement {
            parent?: SvgContainer;
            viewport?: Svg;
            readonly element: SVGGraphicsElement;
            readonly instanceType: number;
            build(options?: SvgBuildOptions): void;
            synchronize(options?: SvgSynchronizeOptions): void;
        }

        interface SvgShape extends SvgElement, SvgView, SvgSynchronize {
            path?: SvgPath;
            readonly element: SVGGeometryElement | SVGUseElement;
            setPath(): void;
            synchronize(options?: SvgSynchronizeOptions): void;
        }

        interface SvgImage extends SvgElement, SvgView, SvgViewRect, SvgBaseVal, SvgTransformable {
            readonly element: SVGImageElement | SVGUseElement;
            readonly href: string;
            extract(exclude?: number[]): void;
        }

        interface SvgUse extends SvgShape, SvgViewRect, SvgBaseVal, SvgPaint {
            shapeElement: SVGGeometryElement;
            readonly element: SVGUseElement;
            synchronize(options?: SvgSynchronizeOptions): void;
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
            constructor(element: SVGUseElement, shapeElement: SVGGraphicsElement, initPath?: boolean);
        }
    }
}

export = squared.svg.SvgElement;