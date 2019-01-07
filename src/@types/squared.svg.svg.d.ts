declare global {
    namespace squared.svg {
        interface Svg extends SvgContainer, Dimension, SvgView, SvgViewBox {
            width: number;
            height: number;
            viewBox: DOMRect;
            readonly element: SVGSVGElement;
            readonly patterns: {
                clipPath: Map<string, SVGClipPathElement>;
                gradient: Map<string, Gradient>;
            };
        }

        class Svg implements Svg {
            constructor(element: SVGSVGElement);
        }
    }
}

export = squared.svg.Svg;