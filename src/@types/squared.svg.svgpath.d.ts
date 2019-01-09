import { SvgPathBaseValue, SvgPoint, SvgTransform } from '../svg/@types/object';

declare global {
    namespace squared.svg {
        interface SvgPath extends SvgBase, SvgTransformable, SvgPaint, NameValue {
            value: string;
            baseValue: Nullable<SvgPathBaseValue>;
            draw(transform?: SvgTransform[], residual?: boolean): string;
            transformPoints(transform: SvgTransform[], points: SvgPoint[], center?: SvgPoint): SvgPoint[];
        }

        class SvgPath implements SvgPath {
            public static getLine(x1: number, y1: number, x2?: number, y2?: number): string;
            public static getCircle(cx: number, cy: number, r: number): string;
            public static getEllipse(cx: number, cy: number, rx: number, ry?: number): string;
            public static getRect(width: number, height: number, x?: number, y?: number): string;
            public static getPolygon(points: Point[] | DOMPoint[]): string;
            public static getPolyline(points: Point[] | DOMPoint[]): string;
            constructor(element: SVGGraphicsElement, parentElement?: SVGGraphicsElement);
        }
    }
}

export = squared.svg.SvgElement;