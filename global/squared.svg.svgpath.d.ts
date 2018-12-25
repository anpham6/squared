import { SvgPathBaseVal } from '../src/svg/types/svg';

declare global {
    namespace squared.svg {
        export interface SvgPath {
            readonly element: SVGGraphicsElement;
            transformed: boolean;
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

        export class SvgPath implements SvgPath {
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