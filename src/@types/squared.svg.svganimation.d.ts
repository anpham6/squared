import { SvgAnimationAttribute, SvgAnimationGroup } from '../svg/@types/object';

declare global {
    namespace squared.svg {
        interface SvgAnimation {
            element: SVGGraphicsElement | null;
            animationElement: SVGAnimationElement | null;
            attributeName: string;
            delay: number;
            to: string;
            fillMode: number;
            fillBackwards: boolean;
            fillForwards: boolean;
            fillFreeze: boolean;
            duration: number;
            paused: boolean;
            synchronizeState: number;
            group: SvgAnimationGroup;
            setterType: boolean;
            id?: number;
            parent?: SvgView | SvgPath;
            baseValue?: string;
            startValue?: string;
            readonly instanceType: number;
            readonly fillReplace: boolean;
            setAttribute(attr: string, equality?: string): void;
            addState(...values: number[]): void;
            removeState(...values: number[]): void;
            hasState(...values: number[]): boolean;
        }

        interface SvgAnimate extends SvgAnimation {
            animationElement: SVGAnimateElement | null;
            type: number;
            from: string;
            values: string[];
            keyTimes: number[];
            iterationCount: number;
            reverse: boolean;
            alternate: boolean;
            additiveSum: boolean;
            accumulateSum: boolean;
            evaluateStart: boolean;
            keySplines?: string[];
            by?: number;
            end?: number;
            synchronized?: NumberValue<string>;
            timingFunction?: string;
            readonly valueTo: string;
            readonly valueFrom: string;
            readonly fromToType: boolean;
            readonly partialType: boolean;
            readonly length: number;
            setCalcMode(name: string): void;
            setGroupOrdering(value: SvgAnimationAttribute[]): void;
            getPartialDuration(iteration?: number): number;
            getTotalDuration(minimum?: boolean): number;
            convertToValues(keyTimes?: number[]): void;
        }

        interface SvgAnimateTransform extends SvgAnimate {
            animationElement: SVGAnimateTransformElement | null;
            transformFrom?: string;
            transformOrigin?: Point[];
            setType(value: string): void;
            expandToValues(): void;
        }

        interface SvgAnimateMotion extends SvgAnimate {
            animationElement: SVGAnimateMotionElement | null;
            motionPathElement: SVGGraphicsElement | null;
            path: string;
            rotate: number;
            rotateAuto: boolean;
            rotateAutoReverse: boolean;
            keyPoints?: number[];
        }

        interface SvgIntervalMap {
            [key: string]: Map<number, SvgIntervalValue[]>;
        }

        interface SvgIntervalValue {
            time: number;
            value: string;
            duration: number;
            start: boolean;
            end: boolean;
            fillMode: number;
            infinite: boolean;
            valueFrom?: string;
            animate?: SvgAnimation;
        }

        class SvgAnimation implements SvgAnimation {
            public static convertClockTime(value: string): number;
            constructor(element?: SVGGraphicsElement, animationElement?: SVGAnimationElement);
        }

        class SvgAnimate implements SvgAnimate {
            public static getGroupDuration(item: SvgAnimationAttribute): number;
            public static getIntervalKeyName(item: SvgAnimation): string;
            public static getIntervalMap(): SvgIntervalMap;
            public static getIntervalValue(map: SvgIntervalMap, attr: string, interval: number, playing?: boolean): string | undefined;
            public static getSplitValue(value: number, next: number, percent: number): number;
            public static convertStepKeyTimeValues(name: string, keyTimes: number[], values: string[], keySpline: string, index: number, fontSize?: number): [number[], string[]] | undefined;
            public static toFractionList(value: string, delimiter?: string): number[];
            constructor(element?: SVGGraphicsElement, animationElement?: SVGAnimateElement);
        }

        class SvgAnimateTransform implements SvgAnimateTransform {
            public static toRotateList(values: string[]): number[][] | undefined;
            public static toScaleList(values: string[]): number[][] | undefined;
            public static toTranslateList(values: string[]): number[][] | undefined;
            public static toSkewList(values: string[]): number[][] | undefined;
            constructor(element?: SVGGraphicsElement, animationElement?: SVGAnimateTransformElement);
        }

        class SvgAnimateMotion implements SvgAnimateMotion {
            constructor(element?: SVGGraphicsElement, animationElement?: SVGAnimateMotionElement);
        }
    }
}

export = squared.svg.SvgAnimation;