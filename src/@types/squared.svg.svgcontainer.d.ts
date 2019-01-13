import { SvgAspectRatio, SvgPoint } from '../svg/@types/object';

import Container = squared.lib.base.Container;
import { SvgAnimation } from '../svg/main';

declare global {
    namespace squared.svg {
        interface SvgContainer extends Container<SvgViewable>, SvgBuildable {
            aspectRatio: SvgAspectRatio;
            readonly element: SVGSVGElement | SVGGElement | SVGUseElement;
            append(item: SvgViewable): this;
            recalibrateX(value: number): number;
            recalibrateY(value: number): number;
            recalibrateDimension(value: number): number;
            recalibratePoints(values: SvgPoint[]): SvgPoint[];
        }

        interface Svg extends SvgContainer, SvgView, SvgViewRect, SvgViewBox, SvgBaseVal {
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

        interface SvgUseSymbol extends SvgContainer, SvgView, SvgViewRect, SvgViewBox, SvgBaseVal, SvgPaint {
            element: SVGUseElement;
            readonly symbolElement: SVGSymbolElement;
        }

        type SvgGroup = Svg | SvgG | SvgUseSymbol;

        class SvgContainer implements SvgContainer {
            constructor(element: SvgGroup);
        }

        class Svg implements Svg {
            public static instance(object: SvgBase): object is Svg;
            public static instanceOfContainer(object: SvgBase): object is SvgContainer;
            public static instanceOfElement(object: SvgBase): object is SvgElement;
            public static instanceOfG(object: SvgBase): object is SvgG;
            public static instanceOfUseSymbol(object: SvgBase): object is SvgUseSymbol;
            public static instanceOfShape(object: SvgBase): object is SvgShape;
            public static instanceOfImage(object: SvgBase): object is SvgImage;
            public static instanceOfUse(object: SvgBase): object is SvgUse;
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