import { SvgStrokeDash, SvgTransform, SvgTransformExclude, SvgTransformResidual } from '../svg/@types/object';

declare global {
    namespace squared.svg {
        interface SvgPath extends SvgBaseVal, SvgPaint, SvgTransformable, NameValue {
            value: string;
            transforms: SvgTransform[];
            readonly element: SVGGeometryElement;
            readonly pathLength: number;
            readonly totalLength: number;
            draw(transforms?: SvgTransform[], residual?: SvgTransformResidual, precision?: number, extract?: boolean): string;
            extendLength(value: number, precision?: number): string;
            flatStrokeDash(valueArray: number[], valueOffset: number, totalLength: number, pathLength?: number): SvgStrokeDash[];
            extractStrokeDash(animations?: SvgAnimation[], precision?: number): [SvgStrokeDash[] | undefined, string | undefined, string | undefined];
        }

        class SvgPath implements SvgPath {
            public static extrapolate(basePath: string, attr: string, values: string[], precision?: number, element?: SVGGraphicsElement): string[] | undefined;
            public static build(path: SvgPath, transform: SvgTransform[], exclude?: SvgTransformExclude, residual?: SvgTransformResidual, precision?: number): SvgPath;
            constructor(element: SVGGeometryElement);
        }
    }
}

export = squared.svg.SvgElement;