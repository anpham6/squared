import { SvgAspectRatio, SvgPathCommand, SvgPoint, SvgRect, SvgTransform } from '../svg/@types/object';

import Container = squared.lib.base.Container;

declare global {
    namespace squared.svg {
        interface SvgView extends SvgElement {
            animation: SvgAnimation[];
            transform: SvgTransform[];
            opacity: string;
            visible: boolean;
            transformed: SvgTransform[] | null;
            translationOffset?: Point;
            readonly name: string;
        }

        interface SvgTransformable {
            transformed: SvgTransform[] | null;
            rotateOrigin?: SvgPoint;
            transformResidual?: SvgTransform[][];
        }

        interface SvgSynchronize {
            getAnimateShape(): SvgAnimate[];
            getAnimateViewRect(): SvgAnimate[];
            mergeAnimate(animations: SvgAnimate[], useKeyTime?: boolean, path?: SvgPath): void;
        }

        interface SvgViewRect extends SvgRect, SvgBaseVal {
            setRect(): void;
        }

        interface SvgBaseVal extends SvgElement {
            setBaseValue(attr: string, value?: any): boolean;
            getBaseValue(attr: string, defaultValue?: any): any;
        }

        interface SvgViewBox {
            viewBox: DOMRect;
        }

        interface SvgPaint {
            color: string;
            fill: string;
            fillPattern: string;
            fillOpacity: string;
            fillRule: string;
            stroke: string;
            strokeWidth: string;
            strokePattern: string;
            strokeOpacity: string;
            strokeLinecap: string;
            strokeLinejoin: string;
            strokeMiterlimit: string;
            strokeDashArray: string;
            strokeDashOffset: string;
            clipPath: string;
            clipRule: string;
            readonly parentElement: SVGGraphicsElement | null;
            setPaint(): void;
        }

        interface SvgElementTagNameMap extends SVGElementTagNameMap {
            'animation': SVGAnimationElement;
            'animate': SVGAnimateElement;
            'animateTransform': SVGAnimateTransformElement;
            'animateMotion': SVGAnimateMotionElement;
        }

        class SvgBuild {
            public static setName(element?: SVGElement): string;
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
            public static getContainerOpacity(instance: SvgView): number;
            public static getContainerViewBox(instance: SvgContainer): Svg | SvgUseSymbol | undefined;
            public static convertTransformList(transform: SVGTransformList): SvgTransform[];
            public static filterTransforms(transform: SvgTransform[], exclude?: number[]): SvgTransform[];
            public static applyTransforms(transform: SvgTransform[], values: Point[], aspectRatio?: SvgAspectRatio, origin?: Point, center?: Point): SvgPoint[];
            public static getCenterPoint(values: Point[]): Point[];
            public static clonePoints(values: SvgPoint[] | SVGPointList): SvgPoint[];
            public static fromNumberList(values: number[]): Point[];
            public static toNumberList(value: string): number[];
            public static getAbsolutePoints(values: SvgPathCommand[]): SvgPoint[];
            public static mergeAbsolutePoints(values: SvgPathCommand[], points: SvgPoint[]): SvgPathCommand[];
            public static fromPathCommandList(values: SvgPathCommand[]): string;
            public static toPathCommandList(value: string): SvgPathCommand[];
        }
    }
}

export = squared.svg.Svg;