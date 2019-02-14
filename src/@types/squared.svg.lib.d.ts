import * as $const from '../svg/lib/constant';
import * as $util from '../svg/lib/util';

declare global {
    namespace squared.svg.lib {
        namespace constant {
            export import FILL_MODE = $const.FILL_MODE;
            export import SYNCHRONIZE_MODE = $const.SYNCHRONIZE_MODE;
            export import KEYSPLINE_NAME = $const.KEYSPLINE_NAME;
        }

        namespace util {
            export import MATRIX = $util.MATRIX;
            export import SVG = $util.SVG;
            export import TRANSFORM = $util.TRANSFORM;
            function getFontSize(element: SVGElement | null): number;
            function convertClockTime(value: string): number;
            function isVisible(element: Element): boolean;
            function setVisible(element: SVGGraphicsElement, value: boolean): void;
            function getTargetElement(element: Element, rootElement?: SVGElement | HTMLElement | null): SVGElement | null;
            function getNearestViewBox(element: SVGElement): DOMRect | undefined;
            function sortNumber(values: number[], descending?: boolean): boolean;
            function truncateString(value: string, precision?: number): string;
            function getSplitValue(value: number, next: number, percent: number): number;
            function getLeastCommonMultiple(values: number[], offset?: number[]): number;
        }
    }
}

export = squared.svg.lib.util;