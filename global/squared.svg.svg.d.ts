import { SvgDefs, SvgPathCommand } from '../src/svg/types/svg';

import Container = squared.lib.base.Container;

declare global {
    namespace squared.svg {
        export interface SvgBase {
            animate: SvgAnimation[];
            readonly element: SVGGraphicsElement;
            readonly name: string;
            readonly visible: boolean;
            readonly transform: SVGTransformList;
        }

        export interface SvgBaseFeature {
            readonly animatable: boolean;
            readonly transformable: boolean;
        }

        export interface Svg extends Container<SvgGroup>, SvgBase, SvgBaseFeature {
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

        export class Svg implements Svg {
            constructor(element: SVGSVGElement);
        }

        export class SvgBuild {
            public static setName(element: SVGGraphicsElement): string;
            public static applyTransforms(transform: SVGTransformList, points: Point[], origin?: Point): Point[];
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