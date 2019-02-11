import { SvgPoint, SvgTransform, SvgTransformExclude, SvgTransformResidual } from '../svg/@types/object';

declare global {
    namespace squared.svg {
        interface SvgPath extends SvgBaseVal, SvgPaint, SvgTransformable, NameValue {
            value: string;
            transforms: SvgTransform[];
            draw(transforms?: SvgTransform[], residual?: SvgTransformResidual, extract?: boolean): string;
            transformPoints(transforms: SvgTransform[], points: SvgPoint[], center?: SvgPoint): SvgPoint[];
        }

        class SvgPath implements SvgPath {
            public static build(path: SvgPath, transform: SvgTransform[], exclude?: SvgTransformExclude, residual?: SvgTransformResidual): SvgPath;
            public static getCenter(values: Point[]): Point[];
            constructor(element: SVGGraphicsElement);
        }
    }
}

export = squared.svg.SvgElement;