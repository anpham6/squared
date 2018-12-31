import { SvgDefs, SvgMatrix, SvgPathCommand, SvgTransform } from '../src/svg/types/svg';

import Container = squared.lib.base.Container;

declare global {
    namespace squared.svg {
        interface SvgBase {
            animate: SvgAnimation[];
            readonly element: SVGGraphicsElement;
            readonly name: string;
            readonly visible: boolean;
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
            public static setName(element: SVGGraphicsElement): string;
            public static applyTransforms(transform: SvgTransform[] | SVGTransformList, points: Point[], origin?: Point | null): Point[];
            public static toPointList(points: SVGPointList): Point[];
            public static toCoordinateList(value: string): number[];
            public static toPathCommandList(value: string): SvgPathCommand[];
            public static createColorStops(element: SVGGradientElement): ColorStop[];
            public static createAnimations(element: SVGGraphicsElement): SvgAnimation[];
            public static fromCoordinateList(values: number[]): Point[];
            public static fromPathCommandList(commands: SvgPathCommand[]): string;
        }
    }
}

export {};