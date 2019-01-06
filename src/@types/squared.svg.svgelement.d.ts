import { SvgImageBaseValue, SvgPathBaseValue, SvgPoint, SvgRect, SvgTransform } from '../svg/@types/object';

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
        }

        interface SvgTransformable {
            rotateOrigin?: SvgPoint;
            transformHost?: SvgTransform[][];
        }

        interface SvgImage extends SvgRect, SvgElement, SvgTransformable {
            href: string;
            baseValue: SvgImageBaseValue;
            readonly element: SVGImageElement | SVGUseElement;
        }

        interface SvgUse extends SvgShape, Point {
            group?: SvgGroup;
            setPath(value: SvgPath): void;
        }

        interface SvgPath extends SvgElement, SvgTransformable {
            name: string;
            opacity: number;
            d: string;
            color: string;
            fillRule: string;
            fill: string;
            fillPattern: string;
            fillOpacity: string;
            stroke: string;
            strokeWidth: string;
            strokePattern: string;
            strokeOpacity: string;
            strokeLinecap: string;
            strokeLinejoin: string;
            strokeMiterlimit: string;
            clipPath: string;
            clipRule: string;
            baseValue: SvgPathBaseValue;
            setColor(attr: string): void;
            setOpacity(attr: string): void;
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