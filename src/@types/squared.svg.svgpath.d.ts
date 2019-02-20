import { SvgPoint, SvgStrokeDash, SvgTransform, SvgTransformExclude, SvgTransformResidual } from '../svg/@types/object';

declare global {
    namespace squared.svg {
        interface SvgPath extends SvgBaseVal, SvgPaint, SvgTransformable, NameValue {
            value: string;
            transforms: SvgTransform[];
            readonly totalLength: number;
            draw(transforms?: SvgTransform[], residual?: SvgTransformResidual, precision?: number, extract?: boolean): string;
            drawStrokeDash(animations?: SvgAnimation[]): SvgStrokeDash[] | undefined;
            getStrokeDash(value: number, offset: number, totalLength: number): SvgStrokeDash[];
        }

        class SvgPath implements SvgPath {
            public static build(path: SvgPath, transform: SvgTransform[], exclude?: SvgTransformExclude, residual?: SvgTransformResidual, precision?: number): SvgPath;
            constructor(element: SVGGraphicsElement);
        }
    }
}

export = squared.svg.SvgElement;