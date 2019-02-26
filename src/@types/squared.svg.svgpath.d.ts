import { SvgStrokeDash, SvgTransform, SvgTransformExclude, SvgTransformResidual } from '../svg/@types/object';

declare global {
    namespace squared.svg {
        interface SvgPath extends SvgBaseVal, SvgPaint, SvgTransformable, NameValue {
            value: string;
            baseValue: string;
            transforms: SvgTransform[];
            readonly element: SVGGeometryElement;
            readonly pathLength: number;
            readonly totalLength: number;
            draw(transforms?: SvgTransform[], residual?: SvgTransformResidual, precision?: number): string;
            extendLength(leading: number, trailing: number, negative?: boolean, precision?: number): [string, number, number];
            flatStrokeDash(valueArray: number[], valueOffset: number, totalLength: number, pathLength?: number): SvgStrokeDash[];
            extractStrokeDash(animations?: SvgAnimation[], negative?: boolean, precision?: number): [SvgStrokeDash[] | undefined, string | undefined, string | undefined];
        }

        class SvgPath implements SvgPath {
            public static extrapolate(attr: string, value: string, values: string[], companion?: SvgShape, transforms?: SvgTransform[], precision?: number): string[] | undefined;
            public static build(path: SvgPath, transform: SvgTransform[], exclude?: SvgTransformExclude, residual?: SvgTransformResidual, precision?: number): SvgPath;
            constructor(element: SVGGeometryElement);
        }
    }
}

export = squared.svg.SvgElement;