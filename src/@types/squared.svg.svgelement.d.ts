import { SvgRectBaseValue, SvgPathBaseValue, SvgPoint, SvgTransform } from '../svg/@types/object';

declare global {
    namespace squared.svg {
        interface SvgElement extends SvgView {
            readonly animatable: boolean;
            build(exclusions?: number[]): void | string;
            transformFilter(exclusions?: number[]): SvgTransform[];
            transformPoints(transform: SvgTransform[], points: SvgPoint[], center?: SvgPoint): SvgPoint[];
        }

        interface SvgShape extends SvgElement {
            path?: SvgPath;
            synchronize(useKeyTime?: boolean): void;
            build(exclusions?: number[]): void;
        }

        interface SvgImage extends SvgElement, SvgViewRect, SvgTransformable {
            href: string;
            baseValue: Required<SvgRectBaseValue>;
            readonly element: SVGImageElement | SVGUseElement;
        }

        interface SvgUse extends SvgShape, Point {
            href: string;
            setShape(value: SVGGraphicsElement): void;
        }

        interface SvgPath extends SvgElement, SvgTransformable, SvgPaint {
            d: string;
            name: string;
            baseValue: SvgPathBaseValue;
            build(exclusions?: number[], save?: boolean): string;
        }

        class SvgElement implements SvgElement {
            constructor(element: SVGGraphicsElement);
        }

        class SvgShape implements SvgShape {
            public static synchronizeAnimate(element: SVGGraphicsElement, animate: SvgAnimation[], useKeyTime?: boolean, path?: SvgPath): SvgAnimation[];
            constructor(element: SVGGraphicsElement);
        }

        class SvgUse implements SvgUse {
            constructor(element: SVGUseElement, d: string);
        }

        class SvgImage implements SvgImage {
            constructor(element: SVGImageElement | SVGUseElement, href?: string);
        }

        class SvgPath implements SvgPath {
            public static getLine(x1: number, y1: number, x2?: number, y2?: number): string;
            public static getCircle(cx: number, cy: number, r: number): string;
            public static getEllipse(cx: number, cy: number, rx: number, ry: number): string;
            public static getRect(width: number, height: number, x?: number, y?: number): string;
            public static getPolygon(points: Point[] | DOMPoint[]): string;
            public static getPolyline(points: Point[] | DOMPoint[]): string;
            constructor(element: SVGGraphicsElement, d?: string);
        }
    }
}

export = squared.svg.SvgElement;