declare global {
    namespace squared.svg {
        interface SvgAnimation {
            attributeName: string;
            begin: number[];
            to: string;
            duration: number;
            readonly element: SVGAnimationElement;
            readonly parentElement: SVGGraphicsElement;
            setAttribute(attr: string, equality?: string): void;
            getAttribute(attr: string): string;
        }

        interface SvgAnimate extends SvgAnimation {
            from: string;
            by: string;
            end: number | undefined;
            values: string[];
            keyTimes: number[];
            repeatCount: number;
            repeatDuration: number;
            calcMode: string;
            additiveSum: boolean;
            accumulateSum: boolean;
            fillFreeze: boolean;
            parentPath: SvgPath | undefined;
            sequential: NameValue | undefined;
            readonly element: SVGAnimateElement;
        }

        interface SvgAnimateTransform extends SvgAnimate {
            type: number;
        }

        interface SvgAnimateMotion extends SvgAnimate {
            path: string;
            mpath: SVGGraphicsElement | undefined;
            keyPoints: number[];
            rotate: number;
            rotateAuto: boolean;
            rotateAutoReverse: boolean;
        }

        class SvgAnimation implements SvgAnimation {
            public static convertClockTime(value: string): number;
            constructor(element: SVGAnimationElement, parentElement: SVGGraphicsElement);
        }

        class SvgAnimate implements SvgAnimate {
            public static toFractionList(value: string, delimiter?: string): number[];
            constructor(element: SVGAnimateElement, parentElement: SVGGraphicsElement);
        }

        class SvgAnimateTransform implements SvgAnimateTransform {
            public static toRotateList(values: string[]): (null[] | number[])[] | undefined;
            public static toScaleList(values: string[]): (null[] | number[])[] | undefined;
            public static toTranslateList(values: string[]): (null[] | number[])[] | undefined;
            constructor(element: SVGAnimateTransformElement, parentElement: SVGGraphicsElement);
        }

        class SvgAnimateMotion implements SvgAnimateMotion {
            constructor(element: SVGAnimateMotionElement, parentElement: SVGGraphicsElement);
        }
    }
}

export = squared.svg.SvgAnimation;