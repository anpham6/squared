declare global {
    namespace squared.svg {
        interface SvgAnimation {
            attributeName: string;
            begin: number[];
            to: string;
            duration: number;
            paused: boolean;
            element?: SVGAnimationElement;
            parent?: SvgView | SvgPath;
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
            alternate: boolean;
            element?: SVGAnimateElement;
            end?: number;
            keySplines?: string[];
            sequential?: NameValue;
        }

        interface SvgAnimateTransform extends SvgAnimate {
            type: number;
            element?: SVGAnimateTransformElement;
            setType(value: string): void;
        }

        interface SvgAnimateMotion extends SvgAnimate {
            path: string;
            keyPoints: number[];
            rotate: number;
            rotateAuto: boolean;
            rotateAutoReverse: boolean;
            mpath: SVGGraphicsElement | null;
            element?: SVGAnimateMotionElement;
        }

        class SvgAnimation implements SvgAnimation {
            constructor(element?: SVGAnimationElement);
        }

        class SvgAnimate implements SvgAnimate {
            public static toFractionList(value: string, delimiter?: string): number[];
            constructor(element?: SVGAnimateElement);
        }

        class SvgAnimateTransform implements SvgAnimateTransform {
            public static toRotateList(values: string[]): (null[] | number[])[] | undefined;
            public static toScaleList(values: string[]): (null[] | number[])[] | undefined;
            public static toTranslateList(values: string[]): (null[] | number[])[] | undefined;
            constructor(element?: SVGAnimateTransformElement);
        }

        class SvgAnimateMotion implements SvgAnimateMotion {
            constructor(element?: SVGAnimateMotionElement);
        }
    }
}

export = squared.svg.SvgAnimation;