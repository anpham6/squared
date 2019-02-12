import { SvgAnimateAttribute, SvgAnimationGroup } from '../svg/@types/object';

declare global {
    namespace squared.svg {
        interface SvgAnimation {
            element: SVGAnimationElement | null;
            attributeName: string;
            delay: number;
            to: string;
            duration: number;
            paused: boolean;
            synchronizeState: number;
            group: SvgAnimationGroup;
            setterType: boolean;
            parent?: SvgView | SvgPath;
            baseFrom?: string;
            readonly instanceType: number;
            setAttribute(attr: string, equality?: string): void;
            addState(...values: number[]): void;
            removeState(...values: number[]): void;
            hasState(...values: number[]): boolean;
        }

        interface SvgAnimate extends SvgAnimation {
            element: SVGAnimateElement | null;
            type: number;
            from: string;
            values: string[];
            keyTimes: number[];
            iterationCount: number;
            fillMode: number;
            fillBackwards: boolean;
            fillForwards: boolean;
            fillFreeze: boolean;
            reverse: boolean;
            alternate: boolean;
            additiveSum: boolean;
            accumulateSum: boolean;
            keySplines?: string[];
            end?: number;
            synchronized?: NumberValue<string>;
            readonly valueTo: string;
            readonly valueFrom: string;
            readonly fillReplace: boolean;
            readonly fromToType: boolean;
            readonly partialType: boolean;
            setCalcMode(name: string): void;
            setGroupSiblings(value: SvgAnimateAttribute[]): void;
            getPartialDuration(iteration?: number): number;
            convertToValues(keyTimes?: number[]): void;
        }

        interface SvgAnimateTransform extends SvgAnimate {
            element: SVGAnimateTransformElement | null;
            transformFrom?: string;
            transformOrigin?: Point[];
            setType(value: string): void;
            expandToValues(): void;
        }

        interface SvgAnimateMotion extends SvgAnimate {
            element: SVGAnimateMotionElement | null;
            path: string;
            rotate: number;
            rotateAuto: boolean;
            rotateAutoReverse: boolean;
            mpath: SVGGraphicsElement | null;
            keyPoints?: number[];
        }

        class SvgAnimation implements SvgAnimation {
            constructor(element?: SVGAnimationElement);
        }

        class SvgAnimate implements SvgAnimate {
            public static toStepFractionList(name: string, keyTimes: number[], values: string[], keySpline: string, index: number, dpi?: number, fontSize?: number): [number[], string[]] | undefined;
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