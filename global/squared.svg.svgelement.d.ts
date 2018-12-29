import { SvgViewBox } from '../src/svg/types/svg';

declare global {
    namespace squared.svg {
        export interface SvgElement extends SvgBase {
            path: SvgPath | undefined;
            readonly drawable: boolean;
            synchronize(useKeyTime?: boolean): void;
        }

        export class SvgElement implements SvgElement {
            public static toAnimateList(element: SVGGraphicsElement): SvgAnimation[];
            public static synchronizeAnimations(element: SVGGraphicsElement, animate: SvgAnimation[], useKeyTime?: boolean, path?: SvgPath): SvgAnimation[];
            constructor(element: SVGGraphicsElement);
        }

        export interface SvgImage extends SvgViewBox, SvgElement {
            uri: string;
            externalize(): void;
        }

        export class SvgImage implements SvgImage {
            constructor(element: SVGUseElement, d: string);
        }
    }
}

export {};