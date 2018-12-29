import { SvgTransformData } from '../src/svg/types/svg';

declare global {
    namespace squared.svg.lib {
        namespace util {
            function getHrefTarget(element: Element): SVGGraphicsElement | null;
            function isSvgShape(element: Element): element is SVGGraphicsElement;
            function isSvgImage(element: Element): element is SVGImageElement;
            function createTransformData(element: SVGGraphicsElement): SvgTransformData;
            function getTransformOrigin(element: SVGGraphicsElement, dpi?: number): Point | undefined;
            function getLeastCommonMultiple(values: number[]): number;
            function applyMatrixX(matrix: DOMMatrix, x: number, y: number): number;
            function applyMatrixY(matrix: DOMMatrix, x: number, y: number): number;
            function getRadiusX(angle: number, radius: number): number;
            function getRadiusY(angle: number, radius: number): number;
            function isVisible(element: SVGGraphicsElement): boolean;
        }
    }
}

export {};