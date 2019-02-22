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
            function getTargetElement(element: Element, rootElement?: HTMLElement | SVGElement | null): SVGElement | null;
            function getNearestViewBox(element: SVGElement): DOMRect | undefined;
            function getPathLength(value: string): string;
        }
    }
}

export = squared.svg.lib.util;