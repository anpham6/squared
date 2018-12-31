import { SvgMatrix, SvgTransform } from '../src/svg/types/svg';

import * as $util from '../src/svg/lib/util';

declare global {
    namespace squared.svg.lib {
        namespace util {
            export import MATRIX = $util.MATRIX;
            function getHrefTarget(element: Element): SVGGraphicsElement | null;
            function isSvgShape(element: Element): element is SVGGraphicsElement;
            function isSvgImage(element: Element): element is SVGImageElement;
            function isSvgVisible(element: SVGGraphicsElement): boolean;
            function createTransform(type: number, matrix: SvgMatrix | DOMMatrix, angle?: number, x?: boolean, y?: boolean): SvgTransform;
            function getTransform(element: SVGGraphicsElement): SvgTransform[] | undefined;
            function getTransformOrigin(element: SVGGraphicsElement): Point | undefined;
            function getTransformMatrix(element: SVGGraphicsElement): SvgMatrix | undefined;
            function getLeastCommonMultiple(values: number[]): number;
            function applyMatrixX(matrix: SvgMatrix | DOMMatrix, x: number, y: number): number;
            function applyMatrixY(matrix: SvgMatrix | DOMMatrix, x: number, y: number): number;
            function getRadiusX(angle: number, radius: number): number;
            function getRadiusY(angle: number, radius: number): number;
            function convertAngle(value: string, unit?: string): number;
            function convertRadian(angle: number): number;
        }
    }
}

export = squared.svg.lib.util;