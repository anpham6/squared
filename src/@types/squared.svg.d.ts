import { SvgAspectRatio, SvgPathCommand, SvgPoint, SvgRect, SvgTransform } from '../svg/@types/object';

declare global {
    namespace squared.svg {
        interface SvgView extends SvgElement {
            name: string;
            opacity: string;
            visible: boolean;
            transformed: SvgTransform[] | null;
            translationOffset?: Point;
            readonly transform: SvgTransform[];
            readonly animation: SvgAnimation[];
            getTransforms(companion?: SVGGraphicsElement): SvgTransform[];
            getAnimations(companion?: SVGGraphicsElement): SvgAnimation[];
        }

        interface SvgTransformable {
            transformed: SvgTransform[] | null;
            rotateAngle?: number;
            transformResidual?: SvgTransform[][];
        }

        interface SvgSynchronize {
            getAnimateShape(element: SVGGraphicsElement, animation?: SvgAnimation[]): SvgAnimate[];
            getAnimateViewRect(animation?: SvgAnimation[]): SvgAnimate[];
            getAnimateTransform(animation?: SvgAnimation[]): SvgAnimateTransform[];
            mergeAnimations(animations: SvgAnimate[], transformations: SvgAnimateTransform[], useKeyTime?: number, path?: SvgPath): void;
        }

        interface SvgViewRect extends SvgRect, SvgBaseVal {
            setRect(): void;
        }

        interface SvgBaseVal extends SvgElement {
            setBaseValue(attr: string, value?: any): boolean;
            getBaseValue(attr: string, defaultValue?: any): any;
            refitBaseValue(x: number, y: number, scaleX?: number, scaleY?: number): void;
            validateBaseValue(attr: string, value?: any): boolean | undefined;
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
            public static drawLine(x1: number, y1: number, x2?: number, y2?: number): string;
            public static drawRect(width: number, height: number, x?: number, y?: number): string;
            public static drawCircle(cx: number, cy: number, r: number): string;
            public static drawEllipse(cx: number, cy: number, rx: number, ry?: number, truncate?: boolean): string;
            public static drawPolygon(points: Point[] | DOMPoint[], truncate?: boolean): string;
            public static drawPolyline(points: Point[] | DOMPoint[], truncate?: boolean): string;
            public static filterTransforms(transform: SvgTransform[], exclude?: number[]): SvgTransform[];
            public static applyTransforms(transform: SvgTransform[], values: Point[], aspectRatio?: SvgAspectRatio, origin?: Point, center?: Point): SvgPoint[];
            public static getPointCenter(values: Point[]): Point[];
            public static clonePoints(values: SvgPoint[] | SVGPointList): SvgPoint[];
            public static convertTransformList(transform: SVGTransformList): SvgTransform[];
            public static convertNumberList(values: number[]): Point[];
            public static unbindPathPoints(values: SvgPathCommand[], includeRadius?: boolean): SvgPoint[];
            public static rebindPathPoints(values: SvgPathCommand[], points: SvgPoint[]): SvgPathCommand[];
            public static toNumberList(value: string): number[];
            public static toBoxRect(value: string): BoxRect;
            public static toPathCommandList(value: string): SvgPathCommand[];
            public static fromPathCommandList(values: SvgPathCommand[]): string;
        }
    }
}

export = squared.svg.Svg;