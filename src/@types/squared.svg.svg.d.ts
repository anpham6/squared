import { SvgDefs, SvgMatrix, SvgPathCommand, SvgTransform } from '../svg/@types/object';

import Container = squared.lib.base.Container;

declare global {
    namespace squared.svg {
        interface SvgBase {
            animate: SvgAnimation[];
            visible: boolean;
            readonly element: SVGGraphicsElement;
            readonly name: string;
        }

        interface Svg extends Container<SvgGroup>, SvgBase {
            readonly defs: SvgDefs;
            readonly width: number;
            readonly height: number;
            readonly viewBoxWidth: number;
            readonly viewBoxHeight: number;
            readonly opacity: number;
            setViewBox(width: number, height: number): void;
            setOpacity(value: string | number): void;
            setDimensions(width: number, height: number): void;
        }

        class Svg implements Svg {
            constructor(element: SVGSVGElement);
        }

        class SvgBuild {
            public static applyTransforms(transform: SvgTransform[], points: Point[] | PointR[], origin?: Point, center?: PointR): Point[];
            public static filterTransformSkew(transform: SvgTransform[]): [SvgTransform[], SvgTransform[]];
            public static getPathCenter(values: Point[]): Point[];
            public static toPointList(points: SVGPointList | Point[] | PointR[]): PointR[];
            public static toCoordinateList(value: string): number[];
            public static toAbsolutePointList(values: SvgPathCommand[]): PointR[];
            public static toPathCommandList(value: string): SvgPathCommand[];
            public static fromNumberList(values: number[]): Point[];
            public static fromAbsolutePointList(values: SvgPathCommand[], points: Point[] | PointR[]): SvgPathCommand[];
            public static fromPathCommandList(commands: SvgPathCommand[]): string;
        }

        class SvgCreate {
            public static setName(element?: SVGGraphicsElement): string;
            public static toColorStopList(element: SVGGradientElement): ColorStop[];
            public static toAnimateList(element: SVGGraphicsElement): SvgAnimation[];
            public static toTransformList(transform: SVGTransformList): SvgTransform[];
        }
    }
}

export = squared.svg.Svg;