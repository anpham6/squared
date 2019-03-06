import { SvgBuildOptions, SvgPathExtendData, SvgStrokeDash, SvgTransform } from '../svg/@types/object';

declare global {
    namespace squared.svg {
        interface SvgPath extends SvgBaseVal, SvgPaint, SvgTransformable, NameValue {
            value: string;
            baseValue: string;
            readonly element: SVGGeometryElement;
            readonly pathLength: number;
            readonly totalLength: number;
            draw(transforms?: SvgTransform[], options?: SvgBuildOptions): string;
            extendLength(data: SvgPathExtendData, precision?: number): SvgPathExtendData | undefined;
            flattenStrokeDash(valueArray: number[], valueOffset: number, totalLength: number, pathLength?: number): SvgPathExtendData;
            extractStrokeDash(animations?: SvgAnimation[], precision?: number, loopInterval?: number): [SvgStrokeDash[] | undefined, string, string];
        }

        class SvgPath implements SvgPath {
            public static transform(value: string, transforms: SvgTransform[], element?: SVGGeometryElement, precision?: number): string;
            public static extrapolate(attr: string, value: string, values: string[], transforms?: SvgTransform[], companion?: SvgShape, precision?: number): string[] | undefined;
            constructor(element: SVGGeometryElement);
        }
    }
}

export = squared.svg.SvgElement;