import Container = squared.lib.base.Container;

declare global {
    namespace squared.svg {
        interface SvgSymbol extends Container<SvgElement>, SvgBase, SvgViewBox {
            viewBox: DOMRect;
            readonly element: SVGSymbolElement;
        }

        class SvgSymbol implements SvgSymbol {
            constructor(element: SVGSymbolElement);
        }
    }
}

export = squared.svg.SvgGroup;