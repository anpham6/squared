import { SvgPathBaseVal, SvgTransform, SvgViewBox } from '../src/svg/types/object';

declare global {
    namespace squared.svg {
        interface SvgElement extends SvgBase {
            transform: SvgTransform[];
            transformed: boolean;
        }

        interface SvgShape extends SvgElement {
            path: SvgPath | undefined;
            setPath(value: SvgPath | string): void;
            synchronize(useKeyTime?: boolean): void;
        }

        interface SvgImage extends SvgElement, SvgViewBox {
            href: string;
            transformRect(): void;
        }

        interface SvgUse extends SvgShape, SvgViewBox {}

        interface SvgPath extends SvgElement {
            opacity: number;
            d: string;
            color: string;
            fillRule: string;
            fill: string;
            fillOpacity: string;
            stroke: string;
            strokeWidth: string;
            strokeOpacity: string;
            strokeLinecap: string;
            strokeLinejoin: string;
            strokeMiterlimit: string;
            clipPath: string;
            clipRule: string;
            baseVal: SvgPathBaseVal;
            setColor(attr: string): void;
            setOpacity(attr: string): void;
        }

        class SvgElement implements SvgElement {
            constructor(element: SVGGraphicsElement);
        }

        class SvgShape implements SvgShape {
            public static synchronizeAnimations(element: SVGGraphicsElement, animate: SvgAnimation[], useKeyTime?: boolean, path?: SvgPath): SvgAnimation[];
            constructor(element: SVGGraphicsElement);
        }

        class SvgUse implements SvgUse {
            constructor(element: SVGUseElement, d: string);
        }

        class SvgImage implements SvgImage {
            constructor(element: SVGImageElement | SVGUseElement, href?: string);
        }

        class SvgPath implements SvgPath {
            public static getLine(x1: number, y1: number, x2?: number, y2?: number, checkValid?: boolean): string;
            public static getRect(width: number, height: number, x?: number, y?: number, checkValid?: boolean): string;
            public static getPolyline(points: Point[] | DOMPoint[] | SVGPointList): string;
            public static getPolygon(points: Point[] | DOMPoint[] | SVGPointList): string;
            public static getCircle(cx: number, cy: number, r: number, checkValid?: boolean): string;
            public static getEllipse(cx: number, cy: number, rx: number, ry: number, checkValid?: boolean): string;
            constructor(element: SVGGraphicsElement, d?: string);
        }
    }
}

export = squared.svg.SvgElement;