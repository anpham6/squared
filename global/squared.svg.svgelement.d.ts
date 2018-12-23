declare global {
    namespace squared.svg {
        export interface SvgElement extends SvgBase, SvgBaseFeature {
            path: SvgPath | undefined;
            readonly drawable: boolean;
        }

        export class SvgElement implements SvgElement {
            public static toAnimateList(element: SVGGraphicsElement): SvgAnimation[];
            constructor(element: SVGGraphicsElement);
        }

        export interface SvgImage extends SvgViewBox, SvgElement {
            uri: string;
            setExternal(): void;
        }

        export class SvgImage implements SvgImage {
            constructor(element: SVGUseElement, d: string);
        }
    }
}

export {};