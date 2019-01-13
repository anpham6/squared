import { SvgAspectRatio, SvgPathCommand, SvgPoint, SvgRect, SvgTransform } from '../svg/@types/object';

import Container = squared.lib.base.Container;

declare global {
    namespace squared.svg {
        interface SvgView extends SvgElement {
            animate: SvgAnimation[];
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
            merge(animations: SvgAnimate[], useKeyTime?: boolean, path?: SvgPath): void;
        }

        interface SvgViewRect extends SvgRect, SvgBaseVal {
            setRect(): void;
        }

        interface SvgBaseVal extends SvgElement {
            setBaseValue(attr: string, value?: any): boolean;
            getBaseValue(attr: string, defaultValue?: any): any;
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
            readonly parentElement: SVGGraphicsElement | null;
            setPaint(): void;
        }

        class SvgBuild {
            public static setName(element?: SVGElement): string;
            public static getContainerOpacity(instance: SvgView): number;
            public static getContainerViewBox(instance: SvgContainer): Svg | SvgUseSymbol | undefined;
            public static filterTransforms(transform: SvgTransform[], exclude?: number[]): SvgTransform[];
            public static applyTransforms(transform: SvgTransform[], values: Point[], aspectRatio?: SvgAspectRatio, origin?: Point, center?: Point): SvgPoint[];
            public static getCenterPoint(values: Point[]): Point[];
            public static toColorStopList(element: SVGGradientElement): ColorStop[];
            public static toAnimateList(element: SVGElement): SvgAnimation[];
            public static toTransformList(transform: SVGTransformList): SvgTransform[];
            public static toPointList(values: SvgPoint[] | SVGPointList): SvgPoint[];
            public static toCoordinateList(value: string): number[];
            public static toAbsolutePointList(values: SvgPathCommand[]): SvgPoint[];
            public static toPathCommandList(value: string): SvgPathCommand[];
            public static fromPointsValue(value: string): SvgPoint[];
            public static fromNumberList(values: number[]): SvgPoint[];
            public static fromAbsolutePointList(values: SvgPathCommand[], points: SvgPoint[]): SvgPathCommand[];
            public static fromPathCommandList(values: SvgPathCommand[]): string;
        }
    }
}

export = squared.svg.Svg;