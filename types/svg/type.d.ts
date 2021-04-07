type SvgContainerElement = SVGSVGElement | SVGGElement | SVGUseElement;
type SvgUseElement = SVGSymbolElement | SVGGElement | SVGGeometryElement | SVGPatternElement;
type SvgViewBoxElement = SVGSVGElement | SVGSymbolElement;
type SvgRectElement = SVGSVGElement | SVGUseElement | SVGImageElement;
type SvgDataSet = ObjectMapNested<NumString | boolean>;
type SvgTransformResidualHandler = (e: SVGGraphicsElement, t: SvgTransform[], rx?: number, ry?: number) => [SvgTransform[][], SvgTransform[]];