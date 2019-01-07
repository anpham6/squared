import Container = squared.lib.base.Container;

declare global {
    namespace squared.svg {
        interface SvgContainer extends Container<SvgView>, SvgBuildable {
            readonly element: SVGGElement | SVGSVGElement | SVGUseElement;
            namespaceElement?: SVGSVGElement;
        }

        class SvgContainer implements SvgContainer {
            public static createUseTarget(element: SVGUseElement, parentElement?: SVGGraphicsElement): SvgView;
            constructor(element: SVGGElement | SVGSVGElement | SVGUseElement);
        }
    }
}

export = squared.svg.SvgContainer;