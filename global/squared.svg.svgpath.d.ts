import { SvgPathBaseVal, SvgTransform } from '../src/svg/types/svg';

declare global {
    namespace squared.svg {
        interface SvgPath extends SvgTransformable {
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
            readonly element: SVGGraphicsElement;
            setColor(attr: string): void;
            setOpacity(attr: string): void;
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

export {};