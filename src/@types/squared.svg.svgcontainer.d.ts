import { SvgAspectRatio, SvgPoint } from '../svg/@types/object';

import Container = squared.lib.base.Container;

declare global {
    namespace squared.svg {
        type SvgGroup = Svg | SvgG | SvgUseSymbol | SvgPattern | SvgShapePattern | SvgUsePattern;

        interface SvgContainer extends Container<SvgView>, SvgElement {
            clipRegion: string;
            aspectRatio: SvgAspectRatio;
            readonly element: SVGSVGElement | SVGGElement | SVGUseElement;
            readonly requireRefit: boolean;
            readonly instanceType: number;
            append(item: SvgView, viewport?: Svg): this;
            refitX(value: number): number;
            refitY(value: number): number;
            refitSize(value: number): number;
            refitPoints(values: SvgPoint[]): SvgPoint[];
            getPathAll(cascade?: boolean): string[];
            hasViewBox(): boolean;
            clipViewBox(x: number, y: number, width: number, height: number, precision?: number, documentRoot?: boolean): void;
        }

        interface SvgViewRectExtended extends SvgView, SvgViewRect, SvgViewBox, SvgBaseVal, SvgSynchronize {
        }

        interface Svg extends SvgContainer, SvgViewRectExtended {
            precision?: number;
            readonly element: SVGSVGElement;
            readonly documentRoot: boolean;
            readonly definitions: {
                clipPath: Map<string, SVGClipPathElement>;
                pattern: Map<string, SVGPatternElement>;
                gradient: Map<string, Gradient>;
            };
        }

        interface SvgG extends SvgContainer, SvgView, SvgPaint {
            readonly element: SVGGElement;
        }

        interface SvgUseSymbol extends SvgContainer, SvgViewRectExtended, SvgPaint {
            element: SVGUseElement;
            readonly symbolElement: SVGSymbolElement;
        }

        interface SvgPattern extends SvgContainer, SvgView {
            readonly element: SVGGraphicsElement;
            readonly patternElement: SVGPatternElement;
        }

        interface SvgShapePattern extends SvgPattern, SvgPaint {
            drawRegion?: BoxRect;
            readonly element: SVGGeometryElement | SVGUseElement;
            readonly patternElement: SVGPatternElement;
            readonly patternUnits: number;
            readonly patternContentUnits: number;
            readonly patternWidth: number;
            readonly patternHeight: number;
            readonly tileWidth: number;
            readonly tileHeight: number;
            patternRefitX(value: number): number;
            patternRefitY(value: number): number;
            patternRefitPoints(values: SvgPoint[]): SvgPoint[];
        }

        interface SvgUsePattern extends SvgShapePattern, SvgViewRect {
            readonly element: SVGUseElement;
            readonly shapeElement: SVGGeometryElement;
        }

        class SvgContainer implements SvgContainer {
            constructor(element: SVGSVGElement | SVGGElement | SVGUseElement);
        }

        class Svg implements Svg {
            constructor(element: SVGSVGElement, documentRoot?: boolean);
        }

        class SvgG implements SvgG {
            constructor(element: SVGGElement);
        }

        class SvgUseSymbol implements SvgUseSymbol {
            constructor(element: SVGUseElement, symbolElement: SVGSymbolElement);
        }

        class SvgPattern implements SvgPattern {
            constructor(element: SVGGraphicsElement, patternElement: SVGPatternElement);
        }

        class SvgShapePattern implements SvgShapePattern {
            constructor(element: SVGGraphicsElement, patternElement: SVGPatternElement);
        }

        class SvgUsePattern implements SvgUsePattern {
            constructor(element: SVGUseElement, shapeElement: SVGGeometryElement, patternElement: SVGPatternElement);
        }
    }
}

export = squared.svg.SvgContainer;