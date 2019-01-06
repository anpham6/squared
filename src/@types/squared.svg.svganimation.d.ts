declare global {
    namespace squared.svg {
        interface SvgAnimation {
            attributeName: string;
            begin: number[];
            to: string;
            duration: number;
            readonly element: SVGAnimationElement;
            setAttribute(attr: string, equality?: string): void;
            getAttribute(attr: string): string;
        }

        interface SvgAnimate extends SvgAnimation {
            from: string;
            by: string;
            values: string[];
            keyTimes: number[];
            repeatCount: number;
            repeatDuration: number;
            calcMode: string;
            additiveSum: boolean;
            accumulateSum: boolean;
            fillFreeze: boolean;
            end?: number;
            parent?: SvgView;
            sequential?: NameValue;
            readonly element: SVGAnimateElement;
        }

        interface SvgAnimateTransform extends SvgAnimate {
            type: number;
        }

        interface SvgAnimateMotion extends SvgAnimate {
            path: string;
            mpath?: SVGGraphicsElement;
            keyPoints: number[];
            rotate: number;
            rotateAuto: boolean;
            rotateAutoReverse: boolean;
        }

        class SvgAnimation implements SvgAnimation {
            public static convertClockTime(value: string): number;
            constructor(element: SVGAnimationElement);
        }

        class SvgAnimate implements SvgAnimate {
            public static toFractionList(value: string, delimiter?: string): number[];
            constructor(element: SVGAnimateElement);
        }

        class SvgAnimateTransform implements SvgAnimateTransform {
            public static toRotateList(values: string[]): (null[] | number[])[] | undefined;
            public static toScaleList(values: string[]): (null[] | number[])[] | undefined;
            public static toTranslateList(values: string[]): (null[] | number[])[] | undefined;
            constructor(element: SVGAnimateTransformElement);
        }

        class SvgAnimateMotion implements SvgAnimateMotion {
            constructor(element: SVGAnimateMotionElement);
        }
    }
}

export = squared.svg.SvgAnimation;