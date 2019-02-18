import { SvgPoint, SvgStrokeDash, SvgTransform, SvgTransformExclude, SvgTransformResidual } from '../svg/@types/object';

declare global {
    namespace squared.svg {
        interface SvgPath extends SvgBaseVal, SvgPaint, SvgTransformable, NameValue {
            value: string;
            transforms: SvgTransform[];
            readonly totalLength: number;
            draw(transforms?: SvgTransform[], residual?: SvgTransformResidual, extract?: boolean): string;
            getStrokeDash(value?: number, offset?: number): SvgStrokeDash[];
        }

        class SvgPath implements SvgPath {
            public static build(path: SvgPath, transform: SvgTransform[], exclude?: SvgTransformExclude, residual?: SvgTransformResidual): SvgPath;
            constructor(element: SVGGraphicsElement);
        }
    }
}

export = squared.svg.SvgElement;