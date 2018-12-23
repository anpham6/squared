import { SvgTransformData } from '../src/svg/types/svg';

declare global {
    namespace squared.svg.lib {
        namespace util {
            export function isSvgShape(element: Element): element is SVGGraphicsElement;
            export function isSvgImage(element: Element): element is SVGImageElement;
            export function createTransformData(element: SVGGraphicsElement): SvgTransformData;
            export function getTransformOrigin(element: SVGGraphicsElement, dpi?: number): Point | undefined;
            export function applyMatrixX(matrix: DOMMatrix, x: number, y: number): number;
            export function applyMatrixY(matrix: DOMMatrix, x: number, y: number): number;
            export function getRadiusX(angle: number, radius: number): number;
            export function getRadiusY(angle: number, radius: number): number;
            export function isVisible(element: SVGGraphicsElement): boolean;
        }
    }
}

export {};