declare global {
    namespace squared.svg {
        interface SvgElement extends SvgBuildable, SvgBase {
            readonly element: SVGGraphicsElement;
        }

        interface SvgShape extends SvgElement, SvgView {
            type: number;
            path?: SvgPath;
            setType(element?: SVGGraphicsElement): void;
        }

        interface SvgImage extends SvgElement, SvgView, SvgViewRect, SvgBaseVal, SvgTransformable {
            href: string;
            readonly element: SVGImageElement | SVGUseElement;
            extract(exclude?: number[]): void;
        }

        interface SvgUse extends SvgElement, SvgView, SvgViewRect, SvgBaseVal {
            shapeElement: SVGGraphicsElement;
            setShape(value: SVGGraphicsElement): void;
        }

        class SvgElement implements SvgElement {
            constructor(element: SVGGraphicsElement);
        }

        class SvgShape implements SvgShape {
            public static synchronizeAnimate(instance: SvgView, animate: SvgAnimation[], useKeyTime?: boolean, path?: SvgPath): SvgAnimation[];
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