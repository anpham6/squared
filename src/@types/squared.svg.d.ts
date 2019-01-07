import { SvgBaseValue, SvgPathCommand, SvgPoint, SvgRect, SvgRectBaseValue, SvgTransform, SvgTransformExclusions } from '../svg/@types/object';

import Container = squared.lib.base.Container;

declare global {
    namespace squared.svg {
        interface SvgBase {
            readonly element: SVGGraphicsElement;
        }

        interface SvgView {
            baseValue: SvgBaseValue;
            animate: SvgAnimation[];
            transform: SvgTransform[];
            opacity: string;
            visible: boolean;
            readonly name: string;
        }

        interface SvgBuildable extends SvgBase {
            build(residual?: boolean, exclusions?: SvgTransformExclusions): void;
            synchronize(useKeyTime?: boolean): void;
        }

        interface SvgViewable extends SvgBuildable, SvgView {
        }

        interface SvgTransformable {
            rotateOrigin?: SvgPoint;
            transformResidual?: SvgTransform[][];
        }

        interface SvgViewRect extends SvgRect {
            baseValue: SvgRectBaseValue;
            setRect(): void;
        }

        interface SvgViewBox {
            viewBox?: DOMRect;
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
            opacity: string;
            readonly parentElement?: SVGGraphicsElement;
            setPaint(): void;
        }

        class SvgBuild {
            public static setName(element?: SVGElement): string;
            public static filterTransforms(transform: SvgTransform[], exclude?: number[]): SvgTransform[];
            public static applyTransforms(transform: SvgTransform[], values: Point[], origin?: Point, center?: Point): Point[];
            public static partitionTransforms(element: SVGGraphicsElement, transform: SvgTransform[], fromPath?: boolean): [SvgTransform[][], SvgTransform[]];
            public static getCenterPoint(values: Point[]): Point[];
            public static toColorStopList(element: SVGGradientElement): ColorStop[];
            public static toAnimateList(element: SVGElement): SvgAnimation[];
            public static toTransformList(transform: SVGTransformList): SvgTransform[];
            public static toPointList(values: SVGPointList | Point[]): Point[];
            public static toCoordinateList(value: string): number[];
            public static toAbsolutePointList(values: SvgPathCommand[]): Point[];
            public static toPathCommandList(value: string): SvgPathCommand[];
            public static fromPointsValue(value: string): Point[];
            public static fromNumberList(values: number[]): Point[];
            public static fromAbsolutePointList(values: SvgPathCommand[], points: Point[]): SvgPathCommand[];
            public static fromPathCommandList(values: SvgPathCommand[]): string;
        }
    }
}

export = squared.svg.Svg;