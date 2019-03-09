import SvgAnimate from './svganimate';
import SvgBuild from './svgbuild';

import { INSTANCE_TYPE } from './lib/constant';
import { TRANSFORM } from './lib/util';

const $css = squared.lib.css;
const $util = squared.lib.util;

export default class SvgAnimateTransform extends SvgAnimate implements squared.svg.SvgAnimateTransform {
    public static toRotateList(values: string[]) {
        const result: number[][] = [];
        for (const value of values) {
            if (value === '') {
                result.push([0, 0, 0]);
            }
            else {
                const seg = SvgBuild.parseCoordinates(value);
                if (seg.length === 1) {
                    seg[1] = 0;
                    seg[2] = 0;
                }
                if (seg.length === 3) {
                    result.push(seg);
                }
                else {
                    return undefined;
                }
            }
        }
        return result;
    }

    public static toScaleList(values: string[]) {
        const result: number[][] = [];
        for (const value of values) {
            if (value === '') {
                result.push([1, 1, 0, 0]);
            }
            else {
                const seg = SvgBuild.parseCoordinates(value);
                if (seg.length === 1) {
                    seg[1] = seg[0];
                }
                if (seg.length === 2) {
                    seg[2] = 0;
                    seg[3] = 0;
                }
                if (seg.length === 4) {
                    result.push(seg);
                }
                else {
                    return undefined;
                }
            }
        }
        return result;
    }

    public static toTranslateList(values: string[]) {
        const result: number[][] = [];
        for (const value of values) {
            if (value === '') {
                result.push([0, 0]);
            }
            else {
                const seg = SvgBuild.parseCoordinates(value);
                if (seg.length === 1) {
                    seg[1] = 0;
                }
                if (seg.length === 2) {
                    result.push(seg);
                }
                else {
                    return undefined;
                }
            }
        }
        return result;
    }

    public static toSkewList(values: string[]) {
        const result: number[][] = [];
        for (const value of values) {
            if (value === '') {
                result.push([0]);
            }
            else {
                const seg = SvgBuild.parseCoordinates(value);
                if (seg.length === 1) {
                    result.push(seg);
                }
                else {
                    return undefined;
                }
            }
        }
        return result;
    }

    public transformFrom?: string;
    public transformOrigin?: Point[];

    constructor(element?: SVGGraphicsElement, animationElement?: SVGAnimateTransformElement) {
        super(element, animationElement);
        if (animationElement) {
            const type = $css.getNamedItem(animationElement, 'type');
            this.setType(type);
            this.setCalcMode(type);
        }
    }

    public expandToValues() {
        if (this.additiveSum && this.iterationCount !== -1 && this.keyTimes.length && this.duration > 0) {
            const durationTotal = this.duration * this.iterationCount;
            invalid: {
                const keyTimes: number[] = [];
                const values: string[] = [];
                const keySplines: string[] = [];
                let previousValues: number[] | undefined;
                for (let i = 0; i < this.iterationCount; i++) {
                    if (i > 0 && this.keySplines) {
                        keySplines.push('');
                    }
                    for (let j = 0; j < this.keyTimes.length; j++) {
                        const floatValues = $util.replaceMap<string, number>(this.values[j].split(' '), value => parseFloat(value));
                        if (floatValues.every(value => !isNaN(value))) {
                            let currentValues: number[] | undefined;
                            switch (this.type) {
                                case SVGTransform.SVG_TRANSFORM_TRANSLATE:
                                    if (floatValues.length === 1) {
                                        currentValues = [floatValues[0], 0];
                                    }
                                    else if (floatValues.length === 2) {
                                        currentValues = floatValues;
                                    }
                                    break;
                                case SVGTransform.SVG_TRANSFORM_SCALE:
                                    if (floatValues.length === 1) {
                                        currentValues = [floatValues[0], floatValues[0]];
                                    }
                                    else if (floatValues.length === 2) {
                                        currentValues = floatValues;
                                    }
                                    break;
                                case SVGTransform.SVG_TRANSFORM_ROTATE:
                                    if (floatValues.length === 1) {
                                        currentValues = [floatValues[0], 0, 0];
                                    }
                                    else if (floatValues.length === 3) {
                                        currentValues = floatValues;
                                    }
                                    break;
                                case SVGTransform.SVG_TRANSFORM_SKEWX:
                                case SVGTransform.SVG_TRANSFORM_SKEWY:
                                    if (floatValues.length === 1) {
                                        currentValues = floatValues;
                                    }
                                    break;
                            }
                            if (currentValues) {
                                let time = (this.keyTimes[j] + i) * this.duration;
                                if (previousValues) {
                                    for (let k = 0; k < currentValues.length; k++) {
                                        currentValues[k] += previousValues[k];
                                    }
                                }
                                if (i < this.iterationCount - 1 && j === this.keyTimes.length - 1) {
                                    if (this.accumulateSum) {
                                        previousValues = currentValues;
                                    }
                                    time--;
                                }
                                keyTimes.push(time / durationTotal);
                                values.push(currentValues.join(' '));
                                if (this.keySplines && j < this.keyTimes.length - 1) {
                                    keySplines.push(this.keySplines[j]);
                                }
                            }
                            else {
                                break invalid;
                            }
                        }
                        else {
                            break invalid;
                        }
                    }
                }
                this.keyTimes = keyTimes;
                this.values = values;
                this.keySplines = keySplines.length ? keySplines : undefined;
                this.duration = durationTotal;
                this.iterationCount = 1;
                this.accumulateSum = false;
            }
        }
    }

    public setType(value: string) {
        let values: number[][] | undefined;
        switch (value) {
            case 'translate':
                this.type = SVGTransform.SVG_TRANSFORM_TRANSLATE;
                if (this.animationElement) {
                    values = SvgAnimateTransform.toTranslateList(this.values);
                }
                break;
            case 'scale':
                this.type = SVGTransform.SVG_TRANSFORM_SCALE;
                if (this.animationElement) {
                    values = SvgAnimateTransform.toScaleList(this.values);
                }
                break;
            case 'rotate':
                this.type = SVGTransform.SVG_TRANSFORM_ROTATE;
                if (this.animationElement) {
                    values = SvgAnimateTransform.toRotateList(this.values);
                }
                break;
            case 'skewX':
                this.type = SVGTransform.SVG_TRANSFORM_SKEWX;
                if (this.animationElement) {
                    values = SvgAnimateTransform.toSkewList(this.values);
                }
                break;
            case 'skewY':
                this.type = SVGTransform.SVG_TRANSFORM_SKEWY;
                if (this.animationElement) {
                    values = SvgAnimateTransform.toSkewList(this.values);
                }
                break;
            default:
                return;
        }
        if (values) {
            this.values = $util.replaceMap<number[], string>(values, array => array.join(' '));
        }
        this.baseValue = TRANSFORM.typeAsValue(this.type);
    }

    get instanceType() {
        return INSTANCE_TYPE.SVG_ANIMATE_TRANSFORM;
    }
}