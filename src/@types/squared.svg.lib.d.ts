import { SvgMatrix, SvgPoint, SvgTransform } from '../svg/@types/object';

import * as $const from '../svg/lib/constant';
import * as $util from '../svg/lib/util';

declare global {
    namespace squared.svg.lib {
        namespace constant {
            export import KEYSPLINE_NAME = $const.KEYSPLINE_NAME;
            export import FILL_MODE = $const.FILL_MODE;
        }

        namespace util {
            export import MATRIX = $util.MATRIX;
            export import REGEXP_SVG = $util.REGEXP_SVG;
            export import SHAPES = $util.SHAPES;
            export import SVG = $util.SVG;
            function getHostDPI(): number;
            function getFontSize(element: SVGElement): number;
            function createElement<K extends keyof SvgElementTagNameMap>(qualifiedName: K): SvgElementTagNameMap[K];
            function convertClockTime(value: string): number;
            function isVisible(element: Element): boolean;
            function setVisible(element: SVGGraphicsElement, value: boolean): void;
            function getTargetElement(element: Element, rootElement?: SVGElement | HTMLElement | null): SVGElement | null;
            function getNearestViewBox(element: SVGElement): DOMRect | undefined;
            function sortNumber(values: number[], descending?: boolean): boolean;
            function createTransform(type: number, matrix: SvgMatrix | DOMMatrix, angle?: number, x?: boolean, y?: boolean): SvgTransform;
            function getTransform(element: SVGElement, value?: string): SvgTransform[] | undefined;
            function getTransformMatrix(element: SVGElement, value?: string): SvgMatrix | undefined;
            function getTransformOrigin(element: SVGElement, value?: string): Point;
            function getTransformRotate(element: SVGElement): SvgPoint[];
            function getTransformInitialValue(nameType: string | number): string;
            function getLeastCommonMultiple(values: number[], minimum?: number, offset?: number[]): number;
            function applyMatrixX(matrix: SvgMatrix | DOMMatrix, x: number, y: number): number;
            function applyMatrixY(matrix: SvgMatrix | DOMMatrix, x: number, y: number): number;
            function getRadiusX(angle: number, radius: number): number;
            function getRadiusY(angle: number, radius: number): number;
        }
    }
}

export = squared.svg.lib.util;