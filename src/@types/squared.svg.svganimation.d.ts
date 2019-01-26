declare global {
    namespace squared.svg {
        interface SvgAnimation {
            attributeName: string;
            begin: number[];
            delay: number;
            to: string;
            duration: number;
            paused: boolean;
            element?: SVGAnimationElement;
            parent?: SvgView | SvgPath;
            readonly instanceType: number;
            setAttribute(attr: string, equality?: string): void;
            getAttribute(attr: string): string;
        }

        interface SvgAnimate extends SvgAnimation {
            from: string;
            values: string[];
            keyTimes: number[];
            repeatCount: number;
            repeatDuration: number;
            additiveSum: boolean;
            accumulateSum: boolean;
            fillMode: number;
            reverse: boolean;
            alternate: boolean;
            element?: SVGAnimateElement;
            end?: number;
            keySplines?: string[];
            fromBaseValue?: string;
            sequential?: NumberValue<string>;
            readonly fromToType: boolean;
            setCalcMode(name: string): void;
        }

        interface SvgAnimateTransform extends SvgAnimate {
            type: number;
            element?: SVGAnimateTransformElement;
            transformOrigin?: Point[];
            setType(value: string): void;
        }

        interface SvgAnimateMotion extends SvgAnimate {
            path: string;
            rotate: number;
            rotateAuto: boolean;
            rotateAutoReverse: boolean;
            mpath: SVGGraphicsElement | null;
            element?: SVGAnimateMotionElement;
            keyPoints?: number[];
        }

        class SvgAnimation implements SvgAnimation {
            constructor(element?: SVGAnimationElement);
        }

        class SvgAnimate implements SvgAnimate {
            public static toStepFractionList(name: string, keySpline: string, index: number, keyTimes: number[], values: string[], dpi?: number, fontSize?: number): [number[], string[]] | undefined;
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