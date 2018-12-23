declare global {
    namespace squared.svg {
        interface SvgAnimation {
            readonly element: SVGAnimationElement;
            readonly parentElement: SVGGraphicsElement;
            attributeName: string;
            attributeType: string;
            to: string;
            readonly duration: number;
            readonly begin: number;
        }

        export class SvgAnimation implements SvgAnimation {
            public static convertClockTime(value: string): [number, number];
            constructor(element: SVGAnimationElement, parentElement: SVGGraphicsElement);
        }

        interface SvgAnimate extends SvgAnimation {
            readonly element: SVGAnimateElement;
            from: string;
            by: string;
            values: string[];
            keyTimes: number[];
            calcMode: string;
            additive: boolean;
            accumulate: boolean;
            freeze: boolean;
            repeatDur: number | undefined;
            repeatCount: number | undefined;
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