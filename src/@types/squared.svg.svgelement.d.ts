declare global {
    namespace squared.svg {
        interface SvgElement extends SvgBase {
            readonly element: SVGGraphicsElement;
        }

        interface SvgShape extends SvgElement, SvgView, SvgSynchronize {
            type: number;
            path?: SvgPath;
            setType(element?: SVGGraphicsElement): void;
        }

        interface SvgImage extends SvgElement, SvgView, SvgViewRect, SvgBaseVal, SvgTransformable {
            href: string;
            readonly element: SVGImageElement | SVGUseElement;
            extract(exclude?: number[]): void;
        }

        interface SvgUse extends SvgShape, SvgViewRect, SvgBaseVal {
            shapeElement: SVGGraphicsElement;
            setShape(value: SVGGraphicsElement): void;
        }

        class SvgElement implements SvgElement {
            constructor(element: SVGGraphicsElement);
        }

        class SvgShape implements SvgShape {
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