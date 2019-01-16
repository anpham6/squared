import { SvgMatrix, SvgPoint, SvgTransform } from '../svg/@types/object';

import * as $util from '../svg/lib/util';

declare global {
    namespace squared.svg.lib {
        namespace util {
            export import SVG = $util.SVG;
            export import SHAPES = $util.SHAPES;
            export import MATRIX = $util.MATRIX;
            function createElement<K extends keyof SvgElementTagNameMap>(qualifiedName: K): SvgElementTagNameMap[K];
            function convertClockTime(value: string): number;
            function isVisible(element: Element): boolean;
            function setVisible(element: SVGGraphicsElement, value: boolean): void;
            function getTargetElement(element: Element, parentElement?: SVGElement | HTMLElement | null): SVGElement | null;
            function sortNumber(values: number[], descending?: boolean): boolean;
            function createTransform(type: number, matrix: SvgMatrix | DOMMatrix, angle?: number, x?: boolean, y?: boolean): SvgTransform;
            function getTransform(element: SVGElement, value?: string): SvgTransform[] | undefined;
            function getTransformMatrix(element: SVGElement, value?: string): SvgMatrix | undefined;
            function getTransformOrigin(element: SVGElement, value?: string): Point;
            function getTransformRotate(element: SVGElement): SvgPoint[];
            function getLeastCommonMultiple(values: number[]): number;
            function applyMatrixX(matrix: SvgMatrix | DOMMatrix, x: number, y: number): number;
            function applyMatrixY(matrix: SvgMatrix | DOMMatrix, x: number, y: number): number;
            function getRadiusX(angle: number, radius: number): number;
            function getRadiusY(angle: number, radius: number): number;
        }
    }
}

export = squared.svg.lib.util;