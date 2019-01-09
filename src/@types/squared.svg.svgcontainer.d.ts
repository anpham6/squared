import Container = squared.lib.base.Container;

declare global {
    namespace squared.svg {
        interface SvgContainer extends Container<SvgView>, SvgBuildable {
            readonly element: SVGSVGElement | SVGGElement | SVGUseElement;
            append(item: SvgViewable): this;
        }

        interface Svg extends SvgContainer, SvgViewRect, SvgViewBox {
            readonly element: SVGSVGElement;
            readonly documentRoot: boolean;
            readonly patterns: {
                clipPath: Map<string, SVGClipPathElement>;
                gradient: Map<string, Gradient>;
            };
        }

        interface SvgG extends SvgContainer, SvgView, SvgPaint {
            readonly element: SVGGElement;
        }

        interface SvgUseSymbol extends SvgContainer, SvgViewRect, SvgViewBox, SvgPaint {
            readonly element: SVGUseElement;
            readonly symbolElement: SVGSymbolElement;
        }

        class SvgContainer implements SvgContainer {
            constructor(element: SVGSVGElement | SVGGElement | SVGUseElement);
        }

        class Svg implements Svg {
            constructor(element: SVGSVGElement);
        }

        class SvgG implements SvgG {
            constructor(element: SVGGElement);
        }

        class SvgUseSymbol implements SvgUseSymbol {
            constructor(element: SVGUseElement, symbolElement: SVGSymbolElement);
        }
    }
}

export = squared.svg.SvgContainer;