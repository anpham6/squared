import { SvgMatrix, SvgPoint, SvgTransform } from '../svg/@types/object';

import * as $util from '../svg/lib/util';

declare global {
    namespace squared.svg.lib {
        namespace util {
            export import SHAPES = $util.SHAPES;
            export import MATRIX = $util.MATRIX;
            function ascendToViewport(element: SVGGraphicsElement): SVGGraphicsElement[];
            function isSvgUse(element: Element): element is SVGUseElement;
            function isSvgShape(element: Element): element is SVGGraphicsElement;
            function isSvgImage(element: Element): element is SVGImageElement;
            function isVisible(element: Element): boolean;
            function setVisible(element: SVGGraphicsElement, value: boolean): void;
            function getHrefTargetElement(element: Element, parentElement?: HTMLElement | null): SVGElement | null;
            function sortNumber(values: number[], descending?: boolean): boolean;
            function getRotateOrigin(element: SVGGraphicsElement): SvgPoint[];
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