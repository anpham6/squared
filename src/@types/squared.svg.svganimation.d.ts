declare global {
    namespace squared.svg {
        interface SvgAnimation {
            attributeName: string;
            begin: number;
            to: string;
            duration: number;
            paused: boolean;
            synchronizeState: number;
            animationName: NumberValue<string>;
            element?: SVGAnimationElement;
            parent?: SvgView | SvgPath;
            baseFrom?: string;
            readonly setterType: boolean;
            readonly instanceType: number;
            setAttribute(attr: string, equality?: string): void;
            getAttribute(attr: string): string;
            addState(...values: number[]): void;
            removeState(...values: number[]): void;
            hasState(value: number): boolean;
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
            fillBackwards: boolean;
            fillForwards: boolean;
            fillFreeze: boolean;
            reverse: boolean;
            alternate: boolean;
            element?: SVGAnimateElement;
            end?: number;
            keySplines?: string[];
            animationSiblings?: SvgAnimate[];
            synchronized?: NumberValue<string>;
            readonly fromToType: boolean;
            readonly fillReplace: boolean;
            setCalcMode(name: string): void;
            convertToValues(keyTimes?: number[]): void;
        }

        interface SvgAnimateTransform extends SvgAnimate {
            type: number;
            element?: SVGAnimateTransformElement;
            transformFrom?: string;
            transformOrigin?: Point[];
            setType(value: string): void;
            expandToValues(): void;
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
            public static toRotateList(values: string[]): number[][] | undefined;
            public static toScaleList(values: string[]): number[][] | undefined;
            public static toTranslateList(values: string[]): number[][] | undefined;
            public static toSkewList(values: string[]): number[][] | undefined;
            constructor(element?: SVGAnimateTransformElement);
        }

        class SvgAnimateMotion implements SvgAnimateMotion {
            constructor(element?: SVGAnimateMotionElement);
        }
    }
}

export = squared.svg.SvgAnimation;