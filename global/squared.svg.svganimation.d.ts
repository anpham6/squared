declare global {
    namespace squared.svg {
        interface SvgAnimation {
            attributeName: string;
            to: string;
            readonly element: SVGAnimationElement;
            readonly parentElement: SVGGraphicsElement;
            duration: number;
            begin: number;
            setAttribute(attr: string, equality?: string): void;
            getAttribute(attr: string): string;
        }

        export class SvgAnimation implements SvgAnimation {
            public static convertClockTime(value: string): [number, number];
            constructor(element: SVGAnimationElement, parentElement: SVGGraphicsElement);
        }

        interface SvgAnimate extends SvgAnimation {
            from: string;
            by: string;
            values: string[];
            keyTimes: number[];
            repeatCount: number;
            calcMode: string;
            additiveSum: boolean;
            accumulateSum: boolean;
            fillFreeze: boolean;
            readonly element: SVGAnimateElement;
            readonly end: number;
            readonly repeatDuration: number;
        }

        export class SvgAnimate implements SvgAnimate {
            public static toFractionList(value: string, delimiter?: string): number[];
            constructor(element: SVGAnimateElement, parentElement: SVGGraphicsElement);
        }

        interface SvgAnimateTransform extends SvgAnimate {
            type: number;
        }

        export class SvgAnimateTransform implements SvgAnimateTransform {
            public static toRotateList(values: string[]): (null[] | number[])[] | undefined;
            public static toScaleList(values: string[]): (null[] | number[])[] | undefined;
            public static toTranslateList(values: string[]): (null[] | number[])[] | undefined;
            constructor(element: SVGAnimateTransformElement, parentElement: SVGGraphicsElement);
        }

        interface SvgAnimateMotion extends SvgAnimate {
            path: string;
            keyPoints: number[];
            rotate: number;
            rotateAuto: boolean;
            rotateAutoReverse: boolean;
        }

        export class SvgAnimateMotion implements SvgAnimateMotion {
            constructor(element: SVGAnimateMotionElement, parentElement: SVGGraphicsElement);
        }
    }
}

export {};