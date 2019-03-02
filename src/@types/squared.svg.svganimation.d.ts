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
            parent?: SvgView | SvgPath;
            baseValue?: string;
            replaceValue?: string;
            id?: number;
            companion?: NumberValue<SvgAnimation>;
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
            timingFunction?: string;
            by?: number;
            end?: number;
            loopIntervals?: boolean[];
            synchronized?: NumberValue<string>;
            readonly playable: boolean;
            readonly valueTo: string;
            readonly valueFrom: string;
            readonly fromToType: boolean;
            readonly partialType: boolean;
            readonly length: number;
            setCalcMode(name: string): void;
            convertToValues(keyTimes?: number[]): void;
            isLoop(index: number): boolean;
            setGroupOrdering(value: SvgAnimationAttribute[]): void;
            getPartialDuration(iteration?: number): number;
            getTotalDuration(minimum?: boolean): number;
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

        interface SvgAnimationIntervalMap {
            map: SvgAnimationIntervalAttributeMap;
            has(attr: string): boolean;
            get(attr: string, time: number, playing?: boolean): string | undefined;
            evaluateStart(item: SvgAnimate, otherValue?: any): string[];
        }

        interface SvgAnimationIntervalAttributeMap {
            [key: string]: Map<number, SvgAnimationIntervalValue[]>;
        }

        interface SvgAnimationIntervalValue {
            time: number;
            value: string;
            duration: number;
            start: boolean;
            end: boolean;
            fillMode: number;
            infinite: boolean;
            valueFrom?: string;
            animation?: SvgAnimation;
        }

        class SvgAnimation implements SvgAnimation {
            public static convertClockTime(value: string): number;
            constructor(element?: SVGGraphicsElement, animationElement?: SVGAnimationElement);
        }

        class SvgAnimate implements SvgAnimate {
            public static getSplitValue(value: number, next: number, percent: number): number;
            public static convertStepTimingFunction(name: string, keyTimes: number[], values: string[], keySpline: string, index: number, fontSize?: number): [number[], string[]] | undefined;
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

        class SvgAnimationIntervalMap implements SvgAnimationIntervalMap {
            public static getGroupDuration(item: SvgAnimationAttribute): number;
            public static getKeyName(item: SvgAnimation): string;
            constructor(animations: SvgAnimation[], ...attrs: string[]);
        }
    }
}

export = squared.svg.SvgAnimation;