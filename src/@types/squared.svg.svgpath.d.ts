import { SvgBuildOptions, SvgPathExtendData, SvgStrokeDash, SvgTransform, SvgTransformExclude, SvgTransformResidual } from '../svg/@types/object';

declare global {
    namespace squared.svg {
        interface SvgPath extends SvgBaseVal, SvgPaint, SvgTransformable, NameValue {
            value: string;
            baseValue: string;
            transforms: SvgTransform[];
            readonly element: SVGGeometryElement;
            readonly pathLength: number;
            readonly totalLength: number;
            draw(transforms?: SvgTransform[], options?: SvgBuildOptions): string;
            extendLength(data: SvgPathExtendData, negative?: boolean, precision?: number): SvgPathExtendData | undefined;
            flattenStrokeDash(valueArray: number[], valueOffset: number, totalLength: number, pathLength?: number): SvgPathExtendData;
            extractStrokeDash(animations?: SvgAnimation[], negative?: boolean, precision?: number): [SvgStrokeDash[] | undefined, string | undefined, string | undefined];
        }

        class SvgPath implements SvgPath {
            public static extrapolate(attr: string, value: string, values: string[], companion?: SvgShape, transforms?: SvgTransform[], precision?: number): string[] | undefined;
            public static build(path: SvgPath, transform: SvgTransform[], options?: SvgBuildOptions): SvgPath;
            constructor(element: SVGGeometryElement);
        }
    }
}

export = squared.svg.SvgElement;