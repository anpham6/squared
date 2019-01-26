import { SvgAspectRatio, SvgPathCommand, SvgPoint, SvgRect, SvgTransform } from '../svg/@types/object';

declare global {
    namespace squared.svg {
        interface SvgView extends SvgElement {
            animation: SvgAnimation[];
            transform: SvgTransform[];
            opacity: string;
            visible: boolean;
            transformed: SvgTransform[] | null;
            translationOffset?: Point;
            readonly name: string;
        }

        interface SvgTransformable {
            transformed: SvgTransform[] | null;
            rotateOrigin?: SvgPoint;
            transformResidual?: SvgTransform[][];
        }

        interface SvgSynchronize {
            getAnimateShape(): SvgAnimate[];
            getAnimateViewRect(): SvgAnimate[];
            mergeAnimate(animations: SvgAnimate[], useKeyTime?: boolean, path?: SvgPath): void;
        }

        interface SvgViewRect extends SvgRect, SvgBaseVal {
            setRect(): void;
        }

        interface SvgBaseVal extends SvgElement {
            setBaseValue(attr: string, value?: any): boolean;
            getBaseValue(attr: string, defaultValue?: any): any;
            refitBaseValue(x: number, y: number, scaleX?: number, scaleY?: number): void;
            validateBaseValueType(attr: string, value?: any): boolean | undefined;
        }

        interface SvgViewBox {
            viewBox: DOMRect;
        }

        interface SvgPaint {
            color: string;
            fill: string;
            fillPattern: string;
            fillOpacity: string;
            fillRule: string;
            stroke: string;
            strokeWidth: string;
            strokePattern: string;
            strokeOpacity: string;
            strokeLinecap: string;
            strokeLinejoin: string;
            strokeMiterlimit: string;
            strokeDashArray: string;
            strokeDashOffset: string;
            clipPath: string;
            clipRule: string;
            useParent?: SvgUse | SvgUseSymbol;
            patternParent?: SvgPattern;
            setPaint(d?: string[]): void;
            resetPaint(): void;
        }

        interface SvgElementTagNameMap extends SVGElementTagNameMap {
            'animation': SVGAnimationElement;
            'animate': SVGAnimateElement;
            'animateTransform': SVGAnimateTransformElement;
            'animateMotion': SVGAnimateMotionElement;
        }

        class SvgBuild {
            public static asContainer(object: SvgElement): object is SvgGroup;
            public static asElement(object: SvgElement): object is SvgElement;
            public static asSvg(object: SvgElement): object is Svg;
            public static asG(object: SvgElement): object is SvgG;
            public static asUseSymbol(object: SvgElement): object is SvgUseSymbol;
            public static asPattern(object: SvgElement): object is SvgPattern;
            public static asShapePattern(object: SvgElement): object is SvgShapePattern;
            public static asUsePattern(object: SvgElement): object is SvgUsePattern;
            public static asShape(object: SvgElement): object is SvgShape;
            public static asImage(object: SvgElement): object is SvgImage;
            public static asUse(object: SvgElement): object is SvgUse;
            public static asAnimation(object: SvgAnimation): boolean;
            public static asAnimationAnimate(object: SvgAnimation): object is SvgAnimate;
            public static asSet(object: SvgAnimation): boolean;
            public static asAnimate(object: SvgAnimation): object is SvgAnimate;
            public static asAnimateTransform(object: SvgAnimation): object is SvgAnimateTransform;
            public static asAnimateMotion(object: SvgAnimation): object is SvgAnimateMotion;
            public static setName(element?: SVGElement): string;
            public static getLine(x1: number, y1: number, x2?: number, y2?: number): string;
            public static getCircle(cx: number, cy: number, r: number): string;
            public static getEllipse(cx: number, cy: number, rx: number, ry?: number): string;
            public static getRect(width: number, height: number, x?: number, y?: number): string;
            public static getPolygon(points: Point[] | DOMPoint[]): string;
            public static getPolyline(points: Point[] | DOMPoint[]): string;
            public static convertTransformList(transform: SVGTransformList): SvgTransform[];
            public static filterTransforms(transform: SvgTransform[], exclude?: number[]): SvgTransform[];
            public static applyTransforms(transform: SvgTransform[], values: Point[], aspectRatio?: SvgAspectRatio, origin?: Point, center?: Point): SvgPoint[];
            public static getCenterPoint(values: Point[]): Point[];
            public static clonePoints(values: SvgPoint[] | SVGPointList): SvgPoint[];
            public static fromNumberList(values: number[]): Point[];
            public static toNumberList(value: string): number[];
            public static getPathBoxRect(value: string): BoxRect;
            public static getPathPoints(values: SvgPathCommand[], includeRadius?: boolean): SvgPoint[];
            public static rebindPathPoints(values: SvgPathCommand[], points: SvgPoint[]): SvgPathCommand[];
            public static fromPathCommandList(values: SvgPathCommand[]): string;
            public static toPathCommandList(value: string): SvgPathCommand[];
        }
    }
}

export = squared.svg.Svg;