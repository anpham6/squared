import SvgAnimate from './svganimate';
import SvgBuild from './svgbuild';

import { INSTANCE_TYPE } from './lib/constant';
import { TRANSFORM } from './lib/util';

const $lib = squared.lib;
const { getNamedItem } = $lib.dom;
const { replaceMap } = $lib.util;

export default class SvgAnimateTransform extends SvgAnimate implements squared.svg.SvgAnimateTransform {
    public static toRotateList(values: string[]) {
        const result: number[][] = [];
        for (const value of values) {
            if (value === '') {
                result.push([0, 0, 0]);
            }
            else {
                const seg = SvgBuild.parseCoordinates(value);
                if (seg.length === 2) {
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
    public readonly attributeName = 'transform';

    constructor(element?: SVGGraphicsElement, animationElement?: SVGAnimateTransformElement) {
        super(element, animationElement);
        if (animationElement) {
            const type = getNamedItem(animationElement, 'type');
            this.setType(type);
            this.setCalcMode(type);
        }
    }

    public expandToValues() {
        if (this.additiveSum) {
            const { duration, keyTimes: keyTimesBase, iterationCount } = this;
            if (iterationCount !== -1 && duration > 0 && keyTimesBase.length) {
                const durationTotal = duration * iterationCount;
                invalid: {
                    const { type, keySplines: keySplinesBase, values: valuesBase } = this;
                    const keyTimes: number[] = [];
                    const values: string[] = [];
                    const keySplines: string[] = [];
                    let previousValues: number[] | undefined;
                    const length = keyTimesBase.length;
                    for (let i = 0; i < iterationCount; i++) {
                        if (i > 0 && keySplinesBase) {
                            keySplines.push('');
                        }
                        for (let j = 0; j < length; j++) {
                            const coordinates = SvgBuild.parseCoordinates(valuesBase[j]);
                            const lengthA = coordinates.length;
                            if (lengthA) {
                                let currentValues: number[] | undefined;
                                switch (type) {
                                    case SVGTransform.SVG_TRANSFORM_TRANSLATE:
                                        if (lengthA === 1) {
                                            currentValues = [coordinates[0], 0];
                                        }
                                        else if (lengthA === 2) {
                                            currentValues = coordinates;
                                        }
                                        break;
                                    case SVGTransform.SVG_TRANSFORM_SCALE:
                                        if (lengthA === 1) {
                                            currentValues = [coordinates[0], coordinates[0]];
                                        }
                                        else if (lengthA === 2) {
                                            currentValues = coordinates;
                                        }
                                        break;
                                    case SVGTransform.SVG_TRANSFORM_ROTATE:
                                        if (lengthA === 1) {
                                            currentValues = [coordinates[0], 0, 0];
                                        }
                                        else if (lengthA === 3) {
                                            currentValues = coordinates;
                                        }
                                        break;
                                    case SVGTransform.SVG_TRANSFORM_SKEWX:
                                    case SVGTransform.SVG_TRANSFORM_SKEWY:
                                        if (lengthA === 1) {
                                            currentValues = coordinates;
                                        }
                                        break;
                                }
                                if (currentValues) {
                                    let time = (keyTimesBase[j] + i) * duration;
                                    if (previousValues) {
                                        const lengthB = currentValues.length;
                                        for (let k = 0; k < lengthB; k++) {
                                            currentValues[k] += previousValues[k];
                                        }
                                    }
                                    if (i < iterationCount - 1 && j === length - 1) {
                                        if (this.accumulateSum) {
                                            previousValues = currentValues;
                                        }
                                        time--;
                                    }
                                    keyTimes.push(time / durationTotal);
                                    values.push(currentValues.join(' '));
                                    if (keySplinesBase && j < length - 1) {
                                        keySplines.push(keySplinesBase[j]);
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
                    this.values = values;
                    this.keyTimes = keyTimes;
                    this.keySplines = keySplines.length ? keySplines : undefined;
                    this.duration = durationTotal;
                    this.iterationCount = 1;
                    this.accumulateSum = false;
                }
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
            this.values = replaceMap<number[], string>(values, array => array.join(' '));
        }
        this.baseValue = TRANSFORM.typeAsValue(this.type);
    }

    get instanceType() {
        return INSTANCE_TYPE.SVG_ANIMATE_TRANSFORM;
    }
}