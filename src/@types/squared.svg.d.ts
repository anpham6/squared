import { SvgAspectRatio, SvgPathCommand, SvgPoint, SvgRect, SvgTransform, SvgTransformExclusions, SvgTransformResidual } from '../svg/@types/object';

import Container = squared.lib.base.Container;

declare global {
    namespace squared.svg {
        interface SvgBase {
            readonly element: SVGGraphicsElement;
        }

        interface SvgBaseVal extends SvgBase {
            setBaseValue(attr: string, value?: any): boolean;
            getBaseValue(attr: string): any;
        }

        interface SvgView extends SvgBaseVal {
            animate: SvgAnimation[];
            transform: SvgTransform[];
            opacity: string;
            visible: boolean;
            transformed: SvgTransform[] | null;
            parent?: SvgContainer;
            readonly name: string;
        }

        interface SvgBuildable extends SvgBase {
            build(exclusions?: SvgTransformExclusions, residual?: SvgTransformResidual): void;
            synchronize(useKeyTime?: boolean): void;
        }

        interface SvgViewable extends SvgBuildable, SvgView {
        }

        interface SvgTransformable {
            transformed: SvgTransform[] | null;
            rotateOrigin?: SvgPoint;
            transformResidual?: SvgTransform[][];
        }

        interface SvgViewRect extends SvgView, SvgRect {
            setRect(): void;
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
            public static filterTransforms(transform: SvgTransform[], exclude?: number[]): SvgTransform[];
            public static applyTransforms(transform: SvgTransform[], values: Point[], aspectRatio?: SvgAspectRatio, origin?: Point, center?: Point): Point[];
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