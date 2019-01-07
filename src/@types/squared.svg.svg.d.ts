import { SvgBaseValue, SvgMatrix, SvgPathCommand, SvgPoint, SvgRect, SvgRectBaseValue, SvgTransform } from '../svg/@types/object';

import Container = squared.lib.base.Container;

declare global {
    namespace squared.svg {
        interface SvgBase {
            readonly element: SVGElement;
        }

        interface SvgView extends SvgBase {
            animate: SvgAnimation[];
            transform: SvgTransform[];
            visible: boolean;
            baseValue: SvgBaseValue;
            readonly name: string;
            readonly element: SVGGraphicsElement;
            readonly parentElement?: SVGGraphicsElement;
        }

        interface SvgParent {
            setChildren(): void;
        }

        interface SvgViewRect extends SvgRect {
            baseValue: SvgRectBaseValue;
            setRect(): void;
        }

        interface SvgViewBox {
            viewBox?: DOMRect;
        }

        interface SvgTransformable {
            rotateOrigin?: SvgPoint;
            transformResidual?: SvgTransform[][];
        }

        interface SvgPaint {
            opacity: string;
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
            setPaint(): void;
        }

        interface Svg extends Container<SvgView>, SvgView, SvgParent, Dimension, SvgViewBox {
            width: number;
            height: number;
            opacity: number;
            viewBox: DOMRect;
            readonly element: SVGSVGElement;
            readonly defs: {
                clipPath: Map<string, SvgGroup>;
                gradient: Map<string, Gradient>;
            };
        }

        class Svg implements Svg {
            constructor(element: SVGSVGElement);
        }

        class SvgBuild {
            public static applyTransforms(transform: SvgTransform[], values: Point[], origin?: Point, center?: Point): Point[];
            public static partitionTransforms(element: SVGGraphicsElement, transform: SvgTransform[], fromPath?: boolean): [SvgTransform[][], SvgTransform[]];
            public static getPathCenter(values: Point[]): Point[];
            public static toPointList(values: SVGPointList | Point[]): Point[];
            public static toCoordinateList(value: string): number[];
            public static toAbsolutePointList(values: SvgPathCommand[]): Point[];
            public static toPathCommandList(value: string): SvgPathCommand[];
            public static fromPointsValue(value: string): Point[];
            public static fromNumberList(values: number[]): Point[];
            public static fromAbsolutePointList(values: SvgPathCommand[], points: Point[]): SvgPathCommand[];
            public static fromPathCommandList(values: SvgPathCommand[]): string;
        }

        class SvgCreate {
            public static setName(element?: SVGElement): string;
            public static getUseTarget(element: SVGUseElement, includeSymbol?: boolean, parentElement?: SVGGraphicsElement): SvgView;
            public static toColorStopList(element: SVGGradientElement): ColorStop[];
            public static toAnimateList(element: SVGElement): SvgAnimation[];
            public static toTransformList(transform: SVGTransformList): SvgTransform[];
        }
    }
}

export = squared.svg.Svg;