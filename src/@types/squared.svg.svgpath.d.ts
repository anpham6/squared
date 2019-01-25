import { SvgPoint, SvgTransform, SvgTransformResidual } from '../svg/@types/object';

declare global {
    namespace squared.svg {
        interface SvgPath extends SvgBaseVal, SvgPaint, SvgTransformable, NameValue {
            value: string;
            transform: SvgTransform[];
            draw(transform?: SvgTransform[], residual?: SvgTransformResidual, save?: boolean): string;
            transformPoints(transform: SvgTransform[], points: SvgPoint[], center?: SvgPoint): SvgPoint[];
        }

        class SvgPath implements SvgPath {
            constructor(element: SVGGraphicsElement);
        }
    }
}

export = squared.svg.SvgElement;