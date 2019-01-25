import { SvgAspectRatio, SvgPoint, SvgTransformExclusions, SvgTransformResidual } from '../svg/@types/object';

import Container = squared.lib.base.Container;

declare global {
    namespace squared.svg {
        type SvgGroup = Svg | SvgG | SvgUseSymbol | SvgPattern | SvgPatternShape;

        interface SvgContainer extends Container<SvgView>, SvgElement {
            aspectRatio: SvgAspectRatio;
            readonly element: SVGContainerElement;
            readonly instanceType: number;
            append(item: SvgView, viewport?: Svg): this;
            refitX(value: number): number;
            refitY(value: number): number;
            refitSize(value: number): number;
            refitPoints(values: SvgPoint[]): SvgPoint[];
            getPathAll(): string[];
        }

        interface SvgViewRectExtended extends SvgView, SvgViewRect, SvgViewBox, SvgBaseVal, SvgSynchronize {
        }

        interface Svg extends SvgContainer, SvgViewRectExtended {
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

        interface SvgPattern extends SvgContainer, SvgView, SvgBaseVal {
            readonly element: SVGGraphicsElement;
            readonly patternElement: SVGPatternElement;
        }

        interface SvgPatternShape extends SvgPattern, SvgPaint {
            clipRegion: string;
            readonly element: SVGGraphicsElement;
            readonly patternElement: SVGPatternElement;
        }

        class SvgContainer implements SvgContainer {
            constructor(element: SVGContainerElement);
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

        class SvgPatternTile implements SvgPatternTile {
            constructor(element: SVGGraphicsElement, patternElement: SVGPatternElement);
        }

        class SvgPatternShape implements SvgPatternShape {
            constructor(element: SVGGraphicsElement, patternElement: SVGPatternElement);
        }
    }
}

export = squared.svg.SvgContainer;