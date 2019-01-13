import { SvgAspectRatio, SvgPoint } from '../svg/@types/object';

import Container = squared.lib.base.Container;

declare global {
    namespace squared.svg {
        interface SvgContainer extends Container<SvgView> {
            aspectRatio: SvgAspectRatio;
            readonly element: SVGSVGElement | SVGGElement | SVGUseElement;
            refitX(value: number): number;
            refitY(value: number): number;
            refitSize(value: number): number;
            refitPoints(values: SvgPoint[]): SvgPoint[];
        }

        interface SvgContainerRect extends SvgView, SvgViewRect, SvgViewBox, SvgSynchronize, SvgBaseVal {
        }

        interface Svg extends SvgContainer, SvgContainerRect {
            readonly element: SVGSVGElement;
            readonly documentRoot: boolean;
            readonly patterns: {
                clipPath: Map<string, SVGClipPathElement>;
                gradient: Map<string, Gradient>;
            };
        }

        interface SvgG extends SvgContainer, SvgView, SvgPaint {
            readonly element: SVGGElement;
        }

        interface SvgUseSymbol extends SvgContainer, SvgContainerRect, SvgPaint {
            element: SVGUseElement;
            readonly symbolElement: SVGSymbolElement;
        }

        type SvgGroup = Svg | SvgG | SvgUseSymbol;

        class SvgContainer implements SvgContainer {
            constructor(element: SvgGroup);
        }

        class Svg implements Svg {
            public static instance(object: SvgElement): object is Svg;
            public static instanceOfContainer(object: SvgElement): object is Svg | SvgG | SvgUseSymbol;
            public static instanceOfElement(object: SvgElement): object is SvgElement;
            public static instanceOfG(object: SvgElement): object is SvgG;
            public static instanceOfUseSymbol(object: SvgElement): object is SvgUseSymbol;
            public static instanceOfShape(object: SvgElement): object is SvgShape;
            public static instanceOfImage(object: SvgElement): object is SvgImage;
            public static instanceOfUse(object: SvgElement): object is SvgUse;
            public static instanceOfSet(object: SvgAnimation): boolean;
            public static instanceOfAnimate(object: SvgAnimation): object is SvgAnimate;
            public static instanceOfAnimateTransform(object: SvgAnimation): object is SvgAnimateTransform;
            public static instanceOfAnimateMotion(object: SvgAnimation): object is SvgAnimateMotion;
            constructor(element: SVGSVGElement, documentRoot?: boolean);
        }

        class SvgG implements SvgG {
            constructor(element: SVGGElement);
        }

        class SvgUseSymbol implements SvgUseSymbol {
            constructor(element: SVGUseElement, symbolElement: SVGSymbolElement);
        }
    }
}

export = squared.svg.SvgContainer;